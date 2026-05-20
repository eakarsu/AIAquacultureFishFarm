import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#facc15', '#a3e635', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#a78bfa', '#fb7185', '#dc2626',
  '#14b8a6', '#22c55e', '#84cc16', '#0ea5e9', '#22d3ee', '#94a3b8',
];

export default function MortalityHeatmap() {
  const [data, setData] = useState({ pens: [], series: [] });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/mortality-heatmap`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.error || `HTTP ${r.status}`)))))
      .then((j) => setData(j))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading mortality matrix...</div>;
  if (err) return <div className="card" style={{ color: '#ef4444' }}>Error: {err}</div>;

  return (
    <div className="card" data-testid="mortality-heatmap">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Mortality Rate by Pen / Week</h3>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {data.pens.length} pens · {data.series.length} weeks
        </span>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data.series} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString()} fish`} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {data.pens.map((pen, i) => (
            <Bar
              key={pen}
              dataKey={pen}
              stackId="mortality"
              fill={PALETTE[i % PALETTE.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
