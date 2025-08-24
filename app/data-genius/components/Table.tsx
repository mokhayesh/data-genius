// ===================== file: app/data-genius/components/Table.tsx =====================
'use client';
import React from 'react';

export type TableData = { headers: string[]; rows: (string|number)[][] };

export default function Table({data}:{data:TableData}){
  const {headers, rows} = data;
  return (
    <div className="dg-scroll">
      <table className="dg-table">
        <thead><tr>{headers.map(h=> <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i)=> (
            <tr key={i}>{r.map((c,j)=> <td key={j}>{String(c)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function downloadCSV(filename:string, table: TableData){
  const {headers, rows} = table;
  const csv = [headers.join(','), ...rows.map(r => r.map(v => JSON.stringify(String(v))).join(','))].join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

export function downloadTXT(filename:string, table: TableData){
  const {headers, rows} = table;
  const txt = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
  const blob = new Blob([txt],{type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
