// ===================== file: app/api/data-genius/image/route.ts =====================
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request){
  try{
    const { prompt } = await req.json();
    const r = await client.images.generate({ model: 'gpt-image-1', prompt, size: '512x512', n: 1 });
    const b64 = r.data?.[0]?.b64_json;
    if(!b64) return NextResponse.json({ error:'no image' }, { status:500 });
    return NextResponse.json({ dataUrl: `data:image/png;base64,${b64}` });
  }catch(err:any){
    return NextResponse.json({ error: err?.message||'server error' }, { status: 500 });
  }
}