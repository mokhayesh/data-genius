// ===================== file: app/data-genius/components/Voice.ts =====================
export function getRecognition(): any | null {
  const w = typeof window !== 'undefined' ? window as any : null;
  if (!w) return null;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function speak(text: string, lang = 'en-US', voiceName?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  if (voiceName) {
    const v = synth.getVoices().find((vv) => vv.name === voiceName);
    if (v) u.voice = v;
  }
  synth.speak(u);
}

export function stopSpeech(){
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}

export function listVoicesFor(langCode: string): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [] as any;
  const synth = window.speechSynthesis;
  const family = langCode.split('-')[0];
  const all = synth.getVoices() || [];
  const exact = all.filter(v => v.lang === langCode);
  const fam = all.filter(v => v.lang?.startsWith(family) && v.lang !== langCode);
  return [...exact, ...fam];
}
