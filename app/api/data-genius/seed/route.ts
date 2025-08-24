// app/api/data-genius/seed/route.ts
export const runtime = 'edge'

import { neon } from '@neondatabase/serverless'

function requiredEnv(name: string) {
  const v = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!v) throw new Error(`Missing ${name} in environment`)
  return v
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const expected = process.env.SEED_TOKEN || 'supersecret123'
    if (token !== expected) {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const sql = neon(requiredEnv('DATABASE_URL'))

    // Create table if it doesn't exist
    await sql/* sql */`
      CREATE TABLE IF NOT EXISTS superheroes (
        id SERIAL PRIMARY KEY,
        hero_name TEXT NOT NULL,
        real_name TEXT,
        address TEXT,
        net_worth NUMERIC,
        movies INT,
        super_power TEXT
      );
    `

    // Seed synthetic rows (idempotent-ish: only seed if table is empty)
    const [{ count }] = await sql/* sql */`
      SELECT COUNT(*)::int AS count FROM superheroes;
    `
    if ((count ?? 0) === 0) {
      await sql/* sql */`
        INSERT INTO superheroes (hero_name, real_name, address, net_worth, movies, super_power)
        VALUES
          ('Night Falcon', 'Nadia Faris', '1011 Moon Ave, Gotham, NJ', 85000000, 5, 'Shadow flight'),
          ('Volt Guardian', 'Evan Park', '44 Grid St, Neo City, CA', 320000000, 7, 'Electro-kinetics'),
          ('Crimson Atlas', 'Ava Chen', '9 Summit Rd, Starfall, WA', 1500000000, 4, 'Atlas strength'),
          ('Silver Mirage', 'Jamal Reed', '777 Mirage Blvd, Oasis, AZ', 42000000, 3, 'Invisibility'),
          ('Aurora Gale', 'Mina Alvarez', '300 Polar Way, Northport, AK', 96000000, 6, 'Cryokinesis & wind'),
          ('Quantum Lynx', 'Leo Vargas', '12 Planck Ct, Hadron, IL', 275000000, 2, 'Quantum tunneling'),
          ('Solar Seraph', 'Priya Rao', '108 Helios Ln, Suncrest, FL', 2100000000, 9, 'Solar flare'),
          ('Echo Rune', 'Owen Brooks', '5 Archive Sq, Arcanum, MA', 12000000, 1, 'Spell echo'),
          ('Nebula Warden', 'Kei Sato', '88 Orbit Cir, Kepler, TX', 670000000, 8, 'Gravity wells'),
          ('Iron Kestrel', 'Zara Malik', '14 Aerie Dr, Gearford, CO', 540000000, 5, 'Aero exosuit')
      `;
    }

    return Response.json({
      ok: true,
      seeded: count === 0,
      message:
        count === 0
          ? 'Created superheroes table and inserted sample data.'
          : 'Superheroes table already had data; skipped insert.',
    })
  } catch (err: any) {
    return Response.json({ ok: false, error: err?.message || 'Seed failed' }, { status: 500 })
  }
}

// Optional GET to check row count quickly
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL as string)
    const [{ count }] = await sql/* sql */`SELECT COUNT(*)::int AS count FROM superheroes;`
    return Response.json({ ok: true, count })
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
