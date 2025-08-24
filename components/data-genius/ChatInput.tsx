'use client'
import * as React from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import useSpeech from './hooks/useSpeech'

export default function ChatInput({ onSend }:{ onSend: (text: string)=>void }) {
  const [value, setValue] = React.useState('')
  const speech = useSpeech()

  function submit() {
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  function dictateOnce() {
    if (!speech.sttSupported) return
    speech.start((final) => setValue(v => (v ? v + ' ' : '') + final))
    // stop after ~5s so it feels like push-to-talk
    setTimeout(() => speech.stop(), 5000)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Ask Simba… (charts: [CHART:…], images: [IMAGE:…])"
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit() } }}
      />
      <Button variant="secondary" size="sm" onClick={dictateOnce} disabled={!speech.sttSupported}>
        Mic
      </Button>
      <Button onClick={submit}>Send</Button>
    </div>
  )
}
