import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload = {
  prompt?: string
  persona?: string
  language?: string
}

async function handleJson(req: NextRequest) {
  const body = (await req.json()) as Payload
  return {
    prompt: body.prompt ?? '',
    persona: body.persona ?? 'architect',
    language: body.language ?? 'English (US)',
    files: { data: [], images: [] }, // not sent in JSON mode
  }
}

async function handleFormData(req: NextRequest) {
  const form = await req.formData()
  const prompt = (form.get('prompt') as string) || ''
  const persona = (form.get('persona') as string) || 'architect'
  const language = (form.get('language') as string) || 'English (US)'

  const data: File[] = []
  const images: File[] = []
  for (const [key, val] of form.entries()) {
    if (val instanceof File) {
      if (key === 'data') data.push(val)
      if (key === 'images') images.push(val)
    }
  }
  return { prompt, persona, language, files: { data, images } }
}

export async function POST(req: NextRequest) {
  // Accept JSON and multipart
  const ct = req.headers.get('content-type') || ''
  let prompt = ''
  let persona = 'architect'
  let language = 'English (US)'
  let files: { data: File[]; images: File[] } = { data: [], images: [] }

  try {
    if (ct.includes('application/json')) {
      ({ prompt, persona, language, files } = await handleJson(req))
    } else if (ct.includes('multipart/form-data')) {
      ({ prompt, persona, language, files } = await handleFormData(req))
    } else {
      return new NextResponse('Unsupported content-type', { status: 415 })
    }
  } catch (e: any) {
    return new NextResponse(`Bad request: ${e?.message || e}`, { status: 400 })
  }

  if (!prompt.trim()) {
    return NextResponse.json({ reply: 'Please provide a prompt.' })
  }

  // If you have an OpenAI key, use it; otherwise return a stub so the UI still works.
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    const reply =
      `💡 (stub) Received: "${prompt}" as **${persona}** in **${language}**.` +
      (files.data.length || files.images.length
        ? `\n\nFiles: ${files.data.length} data, ${files.images.length} image(s).`
        : '')
    return NextResponse.json({ reply })
  }

  try {
    // Minimal non-streaming call; change model if you prefer.
    const sys = `You are Simba, a data assistant. Persona: ${persona}. Reply in ${language}. Be concise.`
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return new NextResponse(`Upstream error: ${text}`, { status: 502 })
    }

    const data = await res.json()
    const reply =
      data?.choices?.[0]?.message?.content ??
      'I could not produce a reply.'

    return NextResponse.json({ reply })
  } catch (err: any) {
    return new NextResponse(`Server error: ${err?.message || err}`, {
      status: 500,
    })
  }
}
