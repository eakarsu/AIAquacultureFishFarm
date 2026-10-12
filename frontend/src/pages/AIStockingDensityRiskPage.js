import React, { useEffect, useState } from 'react';
import AIFieldPresets from '../components/AIFieldPresets';
import AIResultView from '../components/AIResultView';
import { API_BASE, aiStockingDensityRisk, getAIHistory } from '../services/api';

export const stockingExamples = [
  { label: 'Demo AI · Low-density estimate', values: { pen_id: 'PEN-NOR-001-P02', biomass_kg: 10000, pen_volume_m3: 10000, water_temp_c: 12, dissolved_oxygen_mg_l: 7 } },
  { label: 'Demo AI · Elevated-density estimate', values: { pen_id: 'PEN-AUS-001-P05', biomass_kg: 80000, pen_volume_m3: 5000, water_temp_c: 16, dissolved_oxygen_mg_l: 6 } },
  { label: 'Demo AI · Zero-biomass estimate', values: { pen_id: 'PEN-CAN-001-P01', biomass_kg: 0, pen_volume_m3: 10000, water_temp_c: 12, dissolved_oxygen_mg_l: 7 } },
];
export default function AIStockingDensityRiskPage() {
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [readiness, setReadiness] = useState(null);
  const [retry, setRetry] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  useEffect(() => {
    let live = true;
    const controller = new AbortController();
    setError(''); setReadiness(null);
    fetch(`${API_BASE}/health`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Estimator availability check failed');
      const value = (await response.json()).experimentalStockingEstimator;
      if (!value || typeof value.available !== 'boolean') throw new Error('Estimator availability could not be verified');
      if (live) setReadiness(value);
    }).catch((failure) => { if (live) setError(failure.message); });
    return () => { live = false; controller.abort(); };
  }, [retry]);
  const run = async () => {
    if (!readiness?.available) return;
    setLoading(true); setError('');
    try { setResult(await aiStockingDensityRisk(JSON.parse(payload))); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  };
  const fill = (sample) => {
    setPayload(JSON.stringify(sample.values, null, 2));
    setResult(null);
    setError('');
  };
  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const rows = await getAIHistory('stocking-density-risk', 50);
      setHistoryRows(Array.isArray(rows) ? rows : []);
    } catch (failure) {
      setHistoryRows([]);
      setHistoryError(failure.message);
    } finally {
      setHistoryLoading(false);
    }
  };
  return <div className="page sr-ai-workspace">
    <div className="page-header">
      <h2>Stocking Density · Local Estimate</h2>
      <button type="button" className="btn secondary" onClick={openHistory}>History</button>
    </div>
    <p>This experimental fixed-formula calculator does not call OpenRouter. Examples are fictional and do not represent measurements or a verified fish-health assessment.</p>
    <div className="card">
      <AIFieldPresets fields={[{ key: 'payload', label: 'Telemetry snapshot', type: 'json' }]} samples={stockingExamples} onFill={fill} disabled={loading} context="Stocking estimate" />
      <p>Each button fills the complete JSON request, including a seed-backed pen ID and optional temperature and oxygen values.</p>
      <label>Pen telemetry and biomass snapshot</label>
      <textarea data-ai-field="payload" rows={10} value={payload} onChange={(event) => setPayload(event.target.value)} />
      <p role="status">{readiness?.reason || (error ? 'Availability check failed.' : 'Checking estimator availability…')}</p>
      <button className="btn primary" onClick={run} disabled={loading || !readiness?.available || !payload.trim()}>{loading ? 'Calculating…' : 'Calculate Local Estimate'}</button>
    </div>
    {error && <div className="alert danger" role="alert">{error} <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry availability</button></div>}
    <AIResultView result={result} title="Stocking Density · Local Estimate" />
    {historyOpen && (
      <div className="modal-overlay" onClick={() => setHistoryOpen(false)}>
        <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 900 }}>
          <div className="modal-header">
            <h3>Stocking Density · History</h3>
            <button className="modal-close" onClick={() => setHistoryOpen(false)}>×</button>
          </div>
          <div className="modal-body">
            {historyLoading && <div className="empty-state">Loading history...</div>}
            {historyError && <div className="ai-error">{historyError}</div>}
            {!historyLoading && !historyError && historyRows.length === 0 && <div className="empty-state">No past results yet.</div>}
            {historyRows.map((row) => (
              <div key={row.id} className="history-entry">
                <div className="history-entry-meta">
                  <span className="history-entry-id">#{row.id}</span>
                  <span className="history-entry-time">{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</span>
                </div>
                {row.input && <details><summary>Input parameters</summary><AIResultView result={row.input} title="Input" /></details>}
                <AIResultView result={row.output} title="Stocking Density · Local Estimate" />
              </div>
            ))}
          </div>
          <div className="modal-footer"><button className="btn secondary" onClick={() => setHistoryOpen(false)}>Close</button></div>
        </div>
      </div>
    )}
  </div>;
}
