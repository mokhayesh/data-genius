'use client'
import * as React from 'react'

const personas = [
  { id: 'architect', label: 'Data Architect' },
  { id: 'analyst', label: 'Data Analyst' },
  { id: 'scientist', label: 'Data Scientist' },
  { id: 'engineer', label: 'Data Engineer' },
]

export default function PersonaSelect({ value, onChange }:{ value: string; onChange: (val: string)=>void }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      Persona
      <select
        className="mt-1 w-full h-11 rounded-xl border border-surface-ring bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      >
        {personas.map(p => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
    </label>
  )
}