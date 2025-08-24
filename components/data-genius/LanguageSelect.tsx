'use client'
import * as React from 'react'

const languages = [
  'English (US)', 'English (UK)', 'Español', 'Français', 'Deutsch', 'العربية', '中文', 'हिंदी'
]

export default function LanguageSelect({ value, onChange }:{ value: string; onChange: (val: string)=>void }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      Language
      <select
        className="mt-1 w-full h-11 rounded-xl border border-surface-ring bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      >
        {languages.map(x => <option key={x}>{x}</option>)}
      </select>
    </label>
  )
}