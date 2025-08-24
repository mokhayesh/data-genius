'use client';

import * as React from 'react';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

async function callQuickAction(payload: any) {
  const res = await fetch('/api/data-genius/quick-actions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/** ---- Helpers to render tables safely ---- */
function escapeHtml(v: any) {
  const s = String(v ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rowsToTableHTML(rows: any[]): string {
  if (!rows?.length) return '—';

  const colSet = new Set<string>();
  for (const r of rows) Object.keys(r ?? {}).forEach(k => colSet.add(k));
  const cols = Array.from(colSet);

  const thead =
    `<thead><tr>` +
    cols
      .map(
        c =>
          `<th class="px-3 py-2 border-b border-[#1b2540] text-left text-xs tracking-wide text-slate-300 font-medium whitespace-nowrap">${escapeHtml(
            c,
          )}</th>`,
      )
      .join('') +
    `</tr></thead>`;

  const tbody =
    `<tbody>` +
    rows
      .map(
        r =>
          `<tr>` +
          cols
            .map(
              c =>
                `<td class="px-3 py-2 border-b border-[#0f1a32] text-xs align-top">${escapeHtml(
                  r?.[c],
                )}</td>`,
            )
            .join('') +
          `</tr>`,
      )
      .join('') +
    `</tbody>`;

  return `<div class="overflow-x-auto"><table class="min-w-full border-collapse text-slate-100">${thead}${tbody}</table></div>`;
}

export default function DataGeniusPage() {
  const [persona, setPersona] = React.useState('Data Analyst');
  const [language, setLanguage] = React.useState('English (US)');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [tables, setTables] = React.useState<string[]>([]);
  const [selectedTable, setSelectedTable] = React.useState<string>('');
  const [customSql, setCustomSql] = React.useState('SELECT * FROM superheroes LIMIT 5;');

  const [busy, setBusy] = React.useState(false);

  // new: controls
  const [sampleCount, setSampleCount] = React.useState(5);
  const [generateCount, setGenerateCount] = React.useState(50);

  // load tables initially
  React.useEffect(() => {
    (async () => {
      try {
        const data = await callQuickAction({ action: 'list_tables' });
        const ts: string[] = data?.tables || [];
        setTables(ts);
        if (!selectedTable && ts.length) setSelectedTable(ts[0]);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushUser(text: string) {
    setMessages(m => [...m, { id: crypto.randomUUID(), role: 'user', content: escapeHtml(text) }]);
  }
  function pushAssistant(html: string) {
    setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: html }]);
  }

  // ---- Quick action handlers ----
  async function doListTables() {
    pushUser('List tables');
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'list_tables' });
      const ts: string[] = data?.tables || [];
      setTables(ts);
      if (!selectedTable && ts.length) setSelectedTable(ts[0]);
      pushAssistant(`<strong>Tables</strong><br>${(ts || []).join('<br>') || '—'}`);
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  async function doShowSchema() {
    if (!selectedTable) return pushAssistant('❗ Select a table first');
    pushUser(`Show schema: ${selectedTable}`);
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'schema', table: selectedTable });
      const cols = data?.columns || [];
      const html =
        cols.length === 0
          ? '—'
          : rowsToTableHTML(
              cols.map((c: any) => ({
                column_name: c.column_name,
                data_type: c.data_type,
                is_nullable: c.is_nullable,
              })),
            );
      pushAssistant(`<strong>${escapeHtml(selectedTable)} schema</strong><br>${html}`);
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  async function doSample() {
    if (!selectedTable) return pushAssistant('❗ Select a table first');
    pushUser(`Sample ${sampleCount} from ${selectedTable}`);
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'sample', table: selectedTable, limit: sampleCount });
      const rows = data?.rows || [];
      const html =
        rows.length > 0
          ? `${rowsToTableHTML(rows)}<div class="mt-2 text-[11px] text-slate-400">Rows: ${rows.length}</div>`
          : '—';
      pushAssistant(html);
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  async function doRunCustom() {
    pushUser(customSql);
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'run_sql', sql: customSql });
      const rows = data?.rows || [];
      const html =
        rows.length > 0
          ? `${rowsToTableHTML(rows)}<div class="mt-2 text-[11px] text-slate-400">Rows: ${rows.length}</div>`
          : '—';
      pushAssistant(html);
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  async function doSynthesize() {
    pushUser(`Generate synthetic data (superheroes) — ${generateCount} rows`);
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'synthesize_superheroes', rows: generateCount });
      // refresh tables after creation
      const t = await callQuickAction({ action: 'list_tables' });
      const ts: string[] = t?.tables || [];
      setTables(ts);
      if (ts.includes('superheroes')) setSelectedTable('superheroes');
      pushAssistant(
        `✅ Created/seeded table <strong>${escapeHtml(data?.table || 'superheroes')}</strong>. Rows inserted: <strong>${
          data?.inserted ?? 'n/a'
        }</strong>.`,
      );
      // auto-run a quick sample
      setTimeout(() => doSample(), 200);
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  async function doAnalyze() {
    if (!selectedTable) return pushAssistant('❗ Select a table first');
    pushUser(`Analyze table: ${selectedTable}`);
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'analyze_table', table: selectedTable });
      const blocks: string[] = [];

      const summary = data?.summary || [];
      if (summary.length) {
        blocks.push(`<div class="mb-3"><div class="font-semibold mb-1">Summary</div>${rowsToTableHTML(summary)}</div>`);
      }

      const numeric = data?.numeric || [];
      if (numeric.length) {
        blocks.push(`<div class="mb-3"><div class="font-semibold mb-1">Numeric Stats</div>${rowsToTableHTML(numeric)}</div>`);
      }

      const cats = data?.topCategories || [];
      if (cats.length) {
        blocks.push(
          `<div class="mb-3"><div class="font-semibold mb-1">Top Categories</div>${rowsToTableHTML(cats)}</div>`,
        );
      }

      pushAssistant(blocks.join('') || '—');
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  async function doInsights() {
    if (!selectedTable) return pushAssistant('❗ Select a table first');
    pushUser(`Generate insights: ${selectedTable}`);
    setBusy(true);
    try {
      const data = await callQuickAction({ action: 'insights_table', table: selectedTable });
      const blocks: string[] = [];

      if (data?.topNetWorth?.length) {
        blocks.push(
          `<div class="mb-3"><div class="font-semibold mb-1">Top Net Worth</div>${rowsToTableHTML(
            data.topNetWorth,
          )}</div>`,
        );
      }
      if (data?.powerDistribution?.length) {
        blocks.push(
          `<div class="mb-3"><div class="font-semibold mb-1">Power Distribution</div>${rowsToTableHTML(
            data.powerDistribution,
          )}</div>`,
        );
      }
      if (data?.moviesStats?.length) {
        blocks.push(
          `<div class="mb-3"><div class="font-semibold mb-1">Movies Stats</div>${rowsToTableHTML(
            data.moviesStats,
          )}</div>`,
        );
      }
      if (data?.sample?.length) {
        blocks.push(
          `<div class="mb-3"><div class="font-semibold mb-1">Sample</div>${rowsToTableHTML(data.sample)}</div>`,
        );
      }

      pushAssistant(blocks.join('') || '—');
    } catch (err: any) {
      pushAssistant(`❌ Error: ${escapeHtml(err?.message || String(err))}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          {/* LEFT: Controls */}
          <div className="rounded-2xl border border-[#1b2540] bg-[#0f172a] p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-blue-600 grid place-items-center font-semibold">DG</div>
              <div>
                <div className="font-semibold">Data Genius</div>
                <div className="text-xs text-slate-400">with Simba</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-sm">
                Persona
                <select
                  className="mt-1 h-10 w-full rounded-md bg-[#0b1220] border border-[#1b2540] px-2"
                  value={persona}
                  onChange={e => setPersona(e.target.value)}
                >
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>Data Engineer</option>
                  <option>Data Architect</option>
                </select>
              </label>

              <label className="text-sm">
                Language
                <select
                  className="mt-1 h-10 w-full rounded-md bg-[#0b1220] border border-[#1b2540] px-2"
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Français</option>
                  <option>Español</option>
                  <option>Deutsch</option>
                  <option>العربية</option>
                  <option>中文</option>
                  <option>हिंदी</option>
                </select>
              </label>

              <div className="pt-2 border-t border-[#1b2540]" />

              <div className="text-sm font-medium">Quick actions</div>

              <button disabled={busy} onClick={doListTables} className="h-10 rounded-md bg-[#15213c] hover:bg-[#1a2749] px-3 text-sm">
                List tables
              </button>

              {/* Generate synthetic controls */}
              <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
                <label className="text-sm">
                  Rows to generate
                  <input
                    type="number"
                    min={1}
                    max={2000}
                    value={generateCount}
                    onChange={e => setGenerateCount(Math.max(1, Math.min(2000, Number(e.target.value) || 1)))}
                    className="mt-1 h-10 w-full rounded-md bg-[#0b1220] border border-[#1b2540] px-2"
                  />
                </label>
                <button disabled={busy} onClick={doSynthesize} className="h-10 rounded-md bg-[#2b1738] hover:bg-[#3a1f4c] px-3 text-sm">
                  Generate data
                </button>
              </div>

              <label className="text-sm">
                Table
                <div className="mt-1 flex gap-2">
                  <select
                    className="h-10 flex-1 rounded-md bg-[#0b1220] border border-[#1b2540] px-2"
                    value={selectedTable}
                    onChange={e => setSelectedTable(e.target.value)}
                  >
                    {tables.length === 0 && <option value="">—</option>}
                    {tables.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button disabled={!selectedTable || busy} onClick={doShowSchema} className="h-10 rounded-md bg-[#15213c] px-3 text-sm">
                    Show schema
                  </button>
                </div>
              </label>

              <div className="grid grid-cols-[1fr,auto] gap-2 items-end">
                <label className="text-sm">
                  Sample rows
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={sampleCount}
                    onChange={e => setSampleCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                    className="mt-1 h-10 w-full rounded-md bg-[#0b1220] border border-[#1b2540] px-2"
                  />
                </label>
                <button disabled={!selectedTable || busy} onClick={doSample} className="h-10 rounded-md bg-[#15213c] px-3 text-sm">
                  Sample
                </button>
              </div>

              {/* New actions */}
              <div className="grid grid-cols-2 gap-2">
                <button disabled={!selectedTable || busy} onClick={doAnalyze} className="h-10 rounded-md bg-[#1d2b4a] px-3 text-sm">
                  Analyze table
                </button>
                <button disabled={!selectedTable || busy} onClick={doInsights} className="h-10 rounded-md bg-[#1d2b4a] px-3 text-sm">
                  Generate insights
                </button>
              </div>

              <div className="pt-2 border-t border-[#1b2540]" />

              <div className="text-sm font-medium">Custom SQL (SELECT only)</div>
              <textarea
                value={customSql}
                onChange={e => setCustomSql(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-md bg-[#0b1220] border border-[#1b2540] p-2 text-sm"
              />
              <button disabled={busy} onClick={doRunCustom} className="h-10 rounded-md bg-blue-600 hover:bg-blue-700 px-3 text-sm">
                Run custom SQL
              </button>
            </div>
          </div>

          {/* RIGHT: Chat area */}
          <div className="flex flex-col rounded-2xl border border-[#1b2540] bg-[#0f172a]">
            <div className="border-b border-[#1b2540] px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Ask Simba</h1>
                <p className="text-xs text-slate-400">
                  Charts: [CHART: …], Images: [IMAGE: …] &nbsp;|&nbsp; Persona: <em>{persona}</em> · Language: <em>{language}</em>
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-950/40 px-3 py-1 text-xs text-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Live
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-6">Generate synthetic data, list tables, or run a sample.</div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-xl border ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-[#0b1220] text-slate-100 border-[#1b2540]'
                      } p-4`}
                      dangerouslySetInnerHTML={{ __html: m.content }}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#1b2540] p-4 text-xs text-slate-500">
              Tip: Generate data first, then choose a table and <strong>Sample</strong> rows.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
