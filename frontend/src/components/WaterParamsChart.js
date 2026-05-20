import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

const PARAM_META = {
  temperature:      { color: '#f59e0b', label: 'Temperature (°C)' },
  dissolved_oxygen: { color: '#06b6d4', label: 'Dissolved O2 (mg/L)' },
  salinity:         { color: '#10b981', label: 'Salinity (ppt)' },
};

export default function WaterParamsChart() {
  const [data, setData] = useState({ parameters: [], series: [] });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/water-params`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json().then((j) => (r.ok ? j : Promise.reject(new Error(j.error || `HTTP ${r.status}`)))))
      .then((j) => setData(j))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading water parameters...</div>;
  if (err) return <div className="card" style={{ color: '#ef4444' }}>Error: {err}</div>;

  return (
    <div className="card" data-testid="water-params-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Water Quality Multi-Parameter</h3>
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {data.parameters.length} parameters · {data.series.length} buckets
        </span>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data.series} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => Number(v).toFixed(2)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {data.parameters.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              stroke={(PARAM_META[p] || { color: '#94a3b8' }).color}
              name={(PARAM_META[p] || { label: p }).label}
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
