'use client'
import * as React from 'react'
import Button from '@/components/ui/Button'

const actions = [
  // NEW domain actions
  'Profiling',
  'Data Quality',
  'Anomaly Detection',
  'Cataloging',
  'Compliance',

  // Keep originals
  'Summarize dataset',
  'Find outliers',
  'Build chart',
  'Suggest schema',
  'Generate SQL',
]

export default function QuickActions({ onPick }:{ onPick:(t:string)=>void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(a => (
        <Button key={a} size="sm" variant="secondary" onClick={()=>onPick(a)}>
          {a}
        </Button>
      ))}
    </div>
  )
}
