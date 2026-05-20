import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

const PALETTE = [
  '#0ea5e9', '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#ef4444',
  '#22d3ee', '#a3e635', '#fb7185', '#3b82f6', '#8b5cf6', '#22c55e',
  '#14b8a6', '#facc15', '#f97316', '#dc2626', '#a78bfa', '#94a3b8',
];

export default function PenBiomassChart() {
  const [data, setData] = useState({ pens: [], series: [] });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/biomass-by-pen`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.error || `HTTP ${r.status}`)))))
      .then((j) => setData(j))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading biomass series...</div>;
  if (err) return <div className="card" style={{ color: '#ef4444' }}>Error: {err}</div>;

  return (
    <div className="card" data-testid="pen-biomass-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Pen Biomass Over Time</h3>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {data.pens.length} pens · {data.series.length} buckets
        </span>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data.series} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString()} kg`} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {data.pens.map((pen, i) => (
            <Line
              key={pen}
              type="monotone"
              dataKey={pen}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
