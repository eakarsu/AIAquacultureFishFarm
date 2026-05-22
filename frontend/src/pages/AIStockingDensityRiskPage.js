import React, { useState } from 'react';
import { aiStockingDensityRisk } from '../services/api';

export default function AIStockingDensityRiskPage() {
  const [payload, setPayload] = useState('{"pen_id":"PEN-NOR-001-P02","biomass_kg":185000,"pen_volume_m3":46000,"water_temp_c":13.8,"dissolved_oxygen_mg_l":6.1}');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await aiStockingDensityRisk(JSON.parse(payload || '{}')));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>AI Stocking Density Risk</h2>
        <button className="btn primary" onClick={run} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Pen'}</button>
      </div>
      <div className="card">
        <label>Pen telemetry and biomass snapshot</label>
        <textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} />
      </div>
      {error && <div className="alert danger">{error}</div>}
      {result && (
        <div className="card">
          <h3>{result.pen_id} density score: {result.risk_score}</h3>
          <p><strong>Band:</strong> {result.risk_band}</p>
          <p><strong>Density:</strong> {result.density_kg_m3} kg/m3</p>
          <ul>{result.actions.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
