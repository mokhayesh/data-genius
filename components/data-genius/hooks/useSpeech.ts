'use client'
import * as React from 'react'

export default function useSpeech() {
  const [ready, setReady] = React.useState(false)
  const [ttsSupported, setTTSSupported] = React.useState(false)
  const [sttSupported, setSTTSupported] = React.useState(false)
  const [listening, setListening] = React.useState(false)

  const recognitionRef = React.useRef<any | null>(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as any

    setTTSSupported(!!w.speechSynthesis)

    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition
    if (Rec) {
      const rec = new Rec()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'
      recognitionRef.current = rec
      setSTTSupported(true)
    }
    setReady(true)
  }, [])

  function speak(text: string) {
    if (typeof window === 'undefined') return
    const w = window as any
    if (!w.speechSynthesis) return
    const u = new w.SpeechSynthesisUtterance(text)
    w.speechSynthesis.cancel()
    w.speechSynthesis.speak(u)
  }
  function cancelSpeak() {
    if (typeof window === 'undefined') return
    const w = window as any
    w.speechSynthesis?.cancel?.()
  }

  function start(onFinal?: (final: string) => void) {
    const rec = recognitionRef.current
    if (!rec) return
    let final = ''
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) final += r[0].transcript
      }
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => {
      setListening(false)
      if (onFinal && final.trim()) onFinal(final.trim())
    }
    setListening(true)
    rec.start()
  }
  function stop() {
    const rec = recognitionRef.current
    if (!rec) return
    rec.stop()
    setListening(false)
  }

  return { ready, ttsSupported, sttSupported, listening, speak, cancelSpeak, start, stop }
}
