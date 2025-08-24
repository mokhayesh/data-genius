// app/api/data-genius/select/route.ts
import type { NextRequest } from 'next/server'
import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL in environment')
}

// Neon/postgres client
const sql = postgres(DATABASE_URL, { ssl: 'require' })

export async function POST(req: NextRequest) {
  try {
    const { sql: sqlText } = await req.json()

    if (typeof sqlText !== 'string' || !sqlText.trim()) {
      return Response.json({ ok: false, error: 'Missing sql' }, { status: 400 })
    }

    // Allow SELECT only (simple guard)
    const normalized = sqlText.trim().toLowerCase()
    if (!normalized.startsWith('select')) {
      return Response.json(
        { ok: false, error: 'Only SELECT queries are allowed.' },
        { status: 400 }
      )
    }

    // Limit if not provided
    const limited =
      /\blimit\s+\d+\b/i.test(sqlText) ? sqlText : `${sqlText.trim()} LIMIT 1000`

    // Run raw query (unsafe is OK here because we block non-select and do not inject vars)
    const rows = await sql.unsafe(limited)

    // Derive columns from first row
    const columns = rows.length ? Object.keys(rows[0]) : []

    return Response.json({ ok: true, columns, rows })
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err?.message ?? 'Query failed' },
      { status: 500 }
    )
  }
}
