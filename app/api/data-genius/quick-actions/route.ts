import { NextRequest } from 'next/server'
import postgres from 'postgres'

/**
 * Connect to Neon/Postgres using DATABASE_URL
 * Ensure you have DATABASE_URL set in Vercel/Env.
 */
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  idle_timeout: 20,
  max: 1,
})

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

function resJson(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function publicTables(): Promise<string[]> {
  // Return only user tables in the public schema
  const rows = await sql/* sql */`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `
  // rows is an array of objects; map table_name out
  // @ts-ignore (lib returns unknown)
  return rows.map((r: any) => r.table_name) as string[]
}

async function getColumns(table: string): Promise<{column_name:string; data_type:string; is_nullable:'YES'|'NO'}[]> {
  const rows = await sql/* sql */`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
    ORDER BY ordinal_position
  `
  // @ts-ignore
  return rows as any[]
}

function isSelectOnly(query: string) {
  const q = query.trim().toLowerCase()
  // allow with leading "with" CTE or "select"
  if (q.startsWith('select') || q.startsWith('with')) return true
  return false
}

/** Create/seed superheroes with robust columns (no assumptions on "name"). */
async function synthesizeSuperheroes(rowsToInsert = 50) {
  const table = 'superheroes'
  // Create table if not exists with a "name" column (and others)
  await sql/* sql */`
    CREATE TABLE IF NOT EXISTS ${sql(table)} (
      id BIGSERIAL PRIMARY KEY,
      name TEXT,
      address TEXT,
      net_worth NUMERIC,
      movies INTEGER,
      super_power TEXT
    )
  `
  // Generate synthetic data
  const names = [
    'Astra Nova','Volt Ranger','Crimson Falcon','Shadow Viper','Aurora Blaze',
    'Titan Forge','Quasar Knight','Echo Lynx','Nebula Shade','Phantom Gale'
  ]
  const streets = [
    '42 Starfall Ave','120 Quantum Rd','9 Hyperion Blvd','77 Eclipse Way','501 Aurora St',
    '13 Nebula Ct','88 Singularity Dr','310 Polaris Ave','5 Zenith Pl','200 Nova Dr'
  ]
  const powers = [
    'Telekinesis','Invisibility','Super Strength','Flight','Time Warp',
    'Regeneration','Electrokinesis','Pyrokinesis','Teleportation','Sonic Boom'
  ]

  const values: Array<[string,string,number,number,string]> = []
  const N = Math.max(1, Math.min(rowsToInsert || 50, 2000))
  for (let i = 0; i < N; i++) {
    const n = names[Math.floor(Math.random() * names.length)]
    const a = streets[Math.floor(Math.random() * streets.length)]
    const w = Math.round((Math.random() * 900 + 100) * 1e6) // $100M - $1B
    const m = Math.floor(Math.random() * 15)
    const p = powers[Math.floor(Math.random() * powers.length)]
    values.push([n, a, w, m, p])
  }

  // Insert in chunks
  const chunk = 200
  for (let i = 0; i < values.length; i += chunk) {
    const slice = values.slice(i, i + chunk)
    await sql/* sql */`
      INSERT INTO ${sql(table)} (name, address, net_worth, movies, super_power)
      VALUES ${sql(slice)}
    `
  }

  return { ok: true, table, inserted: values.length }
}

/** Basic sampling of rows */
async function sampleRows(table: string, limit: number) {
  const lim = Math.max(1, Math.min(limit || 5, 5000))
  const rows = await sql/* sql */`
    SELECT *
    FROM ${sql(table)}
    LIMIT ${lim}
  `
  // @ts-ignore
  return rows as any[]
}

/** Simple table analysis: row count, column count, numeric stats & top categories */
async function analyzeTable(table: string) {
  const cols = await getColumns(table)
  // row count
  const rowCount =
    (await sql/* sql */`SELECT COUNT(*)::bigint AS n FROM ${sql(table)}` as any[])[0]?.n ?? 0n

  // Numeric stats for numeric-like columns
  const numericTypes = new Set(['smallint','integer','bigint','numeric','real','double precision'])
  const numericCols = cols.filter(c => numericTypes.has(c.data_type))
  const numStats: any[] = []
  for (const c of numericCols) {
    const stat =
      (await sql/* sql */`
        SELECT
          MIN(${sql(c.column_name)}) AS min,
          MAX(${sql(c.column_name)}) AS max,
          AVG(${sql(c.column_name)}) AS avg
        FROM ${sql(table)}
      ` as any[])[0] || {}
    numStats.push({
      column: c.column_name,
      min: stat.min ?? null,
      max: stat.max ?? null,
      avg: stat.avg ?? null,
    })
  }

  // For text columns, top 5 values
  const textTypes = new Set(['text','character varying','character'])
  const textCols = cols.filter(c => textTypes.has(c.data_type))
  const topCategories: { column: string; value: string; freq: number }[] = []
  for (const c of textCols) {
    const tops = await sql/* sql */`
      SELECT ${sql(c.column_name)} AS value, COUNT(*)::int AS freq
      FROM ${sql(table)}
      GROUP BY ${sql(c.column_name)}
      ORDER BY freq DESC
      LIMIT 5
    `
    // @ts-ignore
    for (const t of tops as any[]) {
      topCategories.push({
        column: c.column_name,
        value: t.value ?? '',
        freq: t.freq ?? 0,
      })
    }
  }

  return {
    ok: true,
    table,
    summary: [
      { metric: 'rows', value: String(rowCount) },
      { metric: 'columns', value: String(cols.length) },
    ],
    numeric: numStats,
    topCategories,
  }
}

/** Opinionated insights for a "superheroes" table, but generic fallback if columns differ */
async function insightsForTable(table: string) {
  const cols = await getColumns(table)
  const colSet = new Set(cols.map(c => c.column_name))

  const out: Record<string, any[]> = {}

  // Top net worth (if exists)
  if (colSet.has('net_worth')) {
    const rows = await sql/* sql */`
      SELECT *
      FROM ${sql(table)}
      ORDER BY net_worth DESC NULLS LAST
      LIMIT 5
    `
    // @ts-ignore
    out.topNetWorth = rows as any[]
  }

  // Distribution by super_power (if exists)
  if (colSet.has('super_power')) {
    const rows = await sql/* sql */`
      SELECT super_power, COUNT(*)::int AS count
      FROM ${sql(table)}
      GROUP BY super_power
      ORDER BY count DESC
      LIMIT 10
    `
    // @ts-ignore
    out.powerDistribution = rows as any[]
  }

  // Movies stats (if exists)
  if (colSet.has('movies')) {
    const rows = await sql/* sql */`
      SELECT
        MIN(movies)::int AS min,
        MAX(movies)::int AS max,
        AVG(movies)::numeric(10,2) AS avg
      FROM ${sql(table)}
    `
    // @ts-ignore
    out.moviesStats = rows as any[]
  }

  // Fallback: if none of the above, just show top 10 rows
  if (!Object.keys(out).length) {
    const rows = await sql/* sql */`
      SELECT *
      FROM ${sql(table)}
      LIMIT 10
    `
    // @ts-ignore
    out.sample = rows as any[]
  }

  return { ok: true, table, ...out }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')

    switch (action) {
      case 'list_tables': {
        const tables = await publicTables()
        return resJson({ ok: true, tables })
      }

      case 'schema': {
        const t = String(body?.table || '')
        if (!t) return resJson({ ok: false, error: 'Missing table' }, 400)
        const columns = await getColumns(t)
        return resJson({ ok: true, columns })
      }

      case 'sample': {
        const t = String(body?.table || '')
        if (!t) return resJson({ ok: false, error: 'Missing table' }, 400)
        const limit = Number(body?.limit || 5)
        const rows = await sampleRows(t, limit)
        return resJson({ ok: true, rows })
      }

      case 'run_sql': {
        const query = String(body?.sql || '')
        if (!query) return resJson({ ok: false, error: 'Missing sql' }, 400)
        if (!isSelectOnly(query)) {
          return resJson({ ok: false, error: 'Only SELECT queries are allowed.' }, 400)
        }
        // run select as-is
        const rows = await sql.unsafe(query)
        // @ts-ignore
        return resJson({ ok: true, rows })
      }

      case 'synthesize_superheroes': {
        const rows = Number(body?.rows || 50)
        const res = await synthesizeSuperheroes(rows)
        return resJson(res)
      }

      case 'analyze_table': {
        const t = String(body?.table || '')
        if (!t) return resJson({ ok: false, error: 'Missing table' }, 400)
        const data = await analyzeTable(t)
        return resJson(data)
      }

      case 'insights_table': {
        const t = String(body?.table || '')
        if (!t) return resJson({ ok: false, error: 'Missing table' }, 400)
        const data = await insightsForTable(t)
        return resJson(data)
      }

      default:
        return resJson({ ok: false, error: 'Unknown action' }, 400)
    }
  } catch (err: any) {
    console.error(err)
    return resJson({ ok: false, error: err?.message || 'Server error' }, 500)
  }
}
