import React, { useEffect, useState } from 'react';
import { ingestWaterQuality, getWaterQualityIngestLog, canWrite } from '../services/api';

const SAMPLE_PAYLOAD = JSON.stringify({
  source: 'sensor-stream-demo',
  readings: [
    {
      pen_id: 'PEN-NOR-001-P02',
      ts: new Date().toISOString(),
      dissolved_oxygen_mg_l: 8.4,
      temp_c: 9.6,
      ph: 8.1,
      salinity_ppt: 33.2,
      turbidity_ntu: 1.2,
    },
    {
      pen_id: 'PEN-NOR-001-P02',
      ts: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      dissolved_oxygen_mg_l: 8.5,
      temp_c: 9.7,
    },
  ],
  notes: 'Demo batch ingest',
}, null, 2);

export default function WaterQualityIngestPage() {
  const [payload, setPayload] = useState(SAMPLE_PAYLOAD);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const writer = canWrite();

  const loadLog = async () => {
    try {
      const rows = await getWaterQualityIngestLog(50);
      setLog(Array.isArray(rows) ? rows : []);
    } catch (e) { /* table may not exist yet */ setLog([]); }
  };
  useEffect(() => { loadLog(); }, []);

  const submit = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      let body;
      try { body = JSON.parse(payload); }
      catch (_) { throw new Error('Payload must be valid JSON'); }
      const r = await ingestWaterQuality(body);
      setResult(r);
      loadLog();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Sensor Ingest · Water Quality</h2>
          <p>Batch ingest DO / temp / pH / salinity / turbidity telemetry from on-pen sensors.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn ai" disabled={!writer || busy} onClick={submit}>
            {busy ? <><span className="spinner" />Ingesting...</> : 'Submit Batch'}
          </button>
        </div>
      </div>

      {!writer && (
        <div className="card" style={{ marginBottom: 12 }}>
          Read-only role — ingest requires manager or admin.
        </div>
      )}

      <div className="card">
        <label style={{ fontWeight: 600 }}>JSON Payload</label>
        <textarea rows={16} value={payload} onChange={(e) => setPayload(e.target.value)} style={{ width: '100%', fontFamily: 'monospace' }} />
      </div>

      {error && <div className="ai-error" style={{ marginTop: 12 }}>{error}</div>}

      {result && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Last Ingest Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Recent Ingest Batches</h3>
        {log.length === 0 ? <div className="empty-state">No batches logged yet.</div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>When</th><th>Source</th><th>Pen</th>
                <th>Received</th><th>Inserted</th><th>Failed</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {log.map((row) => (
                <tr key={row.id}>
                  <td>{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</td>
                  <td>{row.source}</td>
                  <td>{row.pen_id || '—'}</td>
                  <td>{row.rows_received}</td>
                  <td>{row.rows_inserted}</td>
                  <td>{row.rows_failed}</td>
                  <td>{row.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
