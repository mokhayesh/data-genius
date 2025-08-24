'use client'
import * as React from 'react'
import Card from '@/components/ui/Card'

export type TableData = {
  title?: string
  columns: { key: string; label: string }[]
  // each row is a dict whose keys match columns[].key
  rows: Record<string, React.ReactNode>[]
  notes?: string[] | string
}

export default function TableView({ title, columns, rows, notes }: TableData) {
  return (
    <Card className="p-4">
      {title && <h3 className="text-sm font-semibold mb-3">{title}</h3>}

      <div className="overflow-x-auto rounded-xl border border-surface-ring">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {columns.map(c => (
                <th key={c.key} className="px-3 py-2 text-left font-medium border-b border-surface-ring">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={columns.length}>No results.</td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-slate-50/40">
                {columns.map(c => (
                  <td key={c.key} className="px-3 py-2 align-top border-b border-surface-ring">
                    {r[c.key] as any}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!!notes && (
        <div className="mt-3 text-xs text-slate-500 space-y-1">
          {(Array.isArray(notes) ? notes : [notes]).map((n, i) => <p key={i}>• {n}</p>)}
        </div>
      )}
    </Card>
  )
}
