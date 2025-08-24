'use client'
import * as React from 'react'
import Card from '@/components/ui/Card'

export type UploadPanelProps = {
  label: string
  accept?: string
  multiple?: boolean
  // where to POST the files (e.g. /api/uploads/data)
  endpoint: string
  // callback after server confirms upload
  onUploaded?: (result: { name:string; size:number; type:string; savedAs:string; url:string }[]) => void
}

export default function UploadPanel({ label, accept, multiple, endpoint, onUploaded }: UploadPanelProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState<string | null>(null)

  async function send(files: File[]) {
    if (!files.length) return
    setBusy(true); setMsg(null)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res = await fetch(endpoint, { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json?.error || 'Upload failed')
      setMsg(`Uploaded ${json.files.length} file(s).`)
      onUploaded?.(json.files)
    } catch (err:any) {
      setMsg(err?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    send(Array.from(e.dataTransfer.files || []))
  }

  return (
    <Card
      className={`p-4 border-dashed transition ${dragging ? 'border-brand-400 bg-brand-50' : ''}`}
      onDragOver={(e)=>{ e.preventDefault(); setDragging(true) }}
      onDragLeave={()=>setDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-800">{label}</div>
          <p className="text-xs text-slate-500">Drag & drop or pick files.</p>
          {msg && <p className="text-xs mt-1 text-slate-600">{msg}</p>}
        </div>
        <button
          className="h-9 px-3 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
          onClick={()=>inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Uploading…' : 'Choose Files'}
        </button>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e)=> send(Array.from(e.target.files || []))}
        />
      </div>
    </Card>
  )
}
