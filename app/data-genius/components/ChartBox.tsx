'use client';

import React from 'react';
import 'chart.js/auto';
import { Bar, Line, Scatter } from 'react-chartjs-2';

export type ChartSpec = {
  type: 'bar' | 'line' | 'scatter';
  x: (string | number)[];
  y: number[];
  title?: string;
  xlabel?: string;
  ylabel?: string;
};

export function parseChartTag(tag: string): ChartSpec | null {
  // tag examples:
  // [CHART: type=bar; x=["A","B","C"]; y=[10,20,15]; title="Sales"; xlabel="Month"; ylabel="Units"]
  const body = tag.replace(/^\[CHART:\s*/i, '').replace(/\]$/, '');
  const parts = body.split(';').map(s => s.trim()).filter(Boolean);
  const spec: any = {};
  for (const p of parts) {
    const [kRaw, vRaw] = p.split('=');
    if (!kRaw || vRaw == null) continue;
    const k = kRaw.trim().toLowerCase();
    let v: any = vRaw.trim();
    if (/^\[.*\]$/.test(v)) {
      try { v = JSON.parse(v); } catch {}
    } else if (/^".*"$/.test(v)) {
      v = v.slice(1, -1);
    }
    spec[k] = v;
  }
  const type = (spec.type || 'line').toLowerCase();
  const x = Array.isArray(spec.x) ? spec.x : [];
  const y = Array.isArray(spec.y) ? spec.y.map((n: any) => Number(n)) : [];
  if (!x.length || !y.length) return null;
  return {
    type: (['bar','line','scatter'].includes(type) ? type : 'line') as ChartSpec['type'],
    x, y,
    title: spec.title || 'Data Visualization',
    xlabel: spec.xlabel || 'X-Axis',
    ylabel: spec.ylabel || 'Y-Axis',
  };
}

export default function ChartBox({ spec }: { spec: ChartSpec }) {
  const data = {
    labels: spec.type === 'scatter' ? undefined : spec.x as string[],
    datasets: [
      {
        label: spec.ylabel || 'Value',
        data:
          spec.type === 'scatter'
            ? (spec.x as (number | string)[]).map((xi, i) => ({
                x: typeof xi === 'number' ? xi : i,
                y: spec.y[i],
              }))
            : spec.y,
      },
    ],
  };

  const options: any = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: !!spec.title, text: spec.title },
    },
    scales: {
      x: { title: { display: !!spec.xlabel, text: spec.xlabel } },
      y: { title: { display: !!spec.ylabel, text: spec.ylabel } },
    },
  };

  if (spec.type === 'bar') return <Bar data={data} options={options} />;
  if (spec.type === 'scatter') return <Scatter data={data} options={options} />;
  return <Line data={data} options={options} />;
}
