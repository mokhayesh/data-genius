// components/data-genius/ResultsTable.tsx
'use client'
import * as React from 'react'

type Props = {
  columns: string[]
  rows: Array<Record<string, any>>
  title?: string
  className?: string
  maxHeight?: number
}

export default function ResultsTable({
  columns,
  rows,
  title = 'Results',
  className,
  maxHeight = 360,
}: Props) {
  if (!columns?.length) {
    return (
      <div className={className}>
        <div className="text-sm text-slate-500">No columns.</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-2 text-sm font-medium text-slate-700">{title}</div>

      <div
        className="rounded-xl border border-slate-200 overflow-auto"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-slate-700">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-semibold border-b border-slate-200">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((r, i) => (
              <tr key={i} className="even:bg-slate-50/40">
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2 align-top border-b border-slate-100">
                    {formatCell(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {rows.length.toLocaleString()} row{rows.length === 1 ? '' : 's'}
      </div>
    </div>
  )
}

function formatCell(v: any) {
  if (v == null) return <span className="text-slate-400">NULL</span>
  if (typeof v === 'object') return <code className="text-xs">{JSON.stringify(v)}</code>
  return String(v)
}
