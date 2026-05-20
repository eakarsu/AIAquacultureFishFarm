import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

export default function SeaLiceTrend() {
  const [data, setData] = useState({ threshold: 0.5, series: [] });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/sea-lice-trend`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.error || `HTTP ${r.status}`)))))
      .then((j) => setData(j))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading sea-lice trend...</div>;
  if (err) return <div className="card" style={{ color: '#ef4444' }}>Error: {err}</div>;

  const breaches = data.series.filter((p) => p.avg_lice >= data.threshold).length;

  return (
    <div className="card" data-testid="sea-lice-trend">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Sea Lice Trend (avg per fish)</h3>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          threshold {data.threshold} · {breaches} day(s) above threshold
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data.series} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="liceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#fb7185" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, (max) => Math.max(1, max + 0.2)]} />
          <Tooltip formatter={(v) => Number(v).toFixed(3)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine
            y={data.threshold}
            stroke="#dc2626"
            strokeDasharray="5 4"
            label={{ value: `Threshold ${data.threshold}`, fill: '#dc2626', fontSize: 11, position: 'insideTopRight' }}
          />
          <Area
            type="monotone"
            dataKey="avg_lice"
            stroke="#fb7185"
            fill="url(#liceFill)"
            strokeWidth={2}
            name="Avg lice / fish"
          />
          <Area
            type="monotone"
            dataKey="max_lice"
            stroke="#7c3aed"
            fill="transparent"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            name="Max lice / fish"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
