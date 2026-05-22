import React, { useState } from 'react';
import AIResultDisplay from '../components/AIResultDisplay';
import { aiEscapeDetect, getAISamples, getAIHistory } from '../services/api';

// Custom AIPage variant because signals is a structured JSON array.
// Uses the same visual shell but lets us paste / edit a signals JSON blob.
export default function AIEscapeDetectPage() {
  const [penId, setPenId] = useState('');
  const [signalsText, setSignalsText] = useState(
    '[\n  { "source": "acoustic_tag", "delta": 0, "direction": "flat", "note": "" },\n  { "source": "sonar", "delta": 0, "direction": "flat", "note": "" },\n  { "source": "net_tension", "delta": 0, "direction": "flat", "note": "" }\n]'
  );
  const [notes, setNotes] = useState('');
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  React.useEffect(() => {
    let alive = true;
    getAISamples('escape-detect')
      .then((d) => { if (alive) setSamples(Array.isArray(d?.samples) ? d.samples : []); })
      .catch(() => { if (alive) setSamples([]); });
    return () => { alive = false; };
  }, []);

  const applySample = (s) => {
    const v = (s && s.values) || {};
    setPenId(v.pen_id || '');
    setSignalsText(JSON.stringify(v.signals || [], null, 2));
    setNotes(v.notes || '');
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      let signals = [];
      try { signals = JSON.parse(signalsText || '[]'); }
      catch (_) { throw new Error('Signals must be valid JSON'); }
      const r = await aiEscapeDetect({ pen_id: penId, signals, notes });
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryRows([]);
    try {
      const rows = await getAIHistory('escape-detect', 50);
      setHistoryRows(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setHistoryError(e.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>AI - Escape Detect</h2>
          <p>Fuse acoustic-tag, sonar and net-tension signals to detect a potential escape.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn secondary" onClick={openHistory}>History</button>
          <button className="btn ai" onClick={handleRun} disabled={loading}>
            {loading ? <><span className="spinner" />Running...</> : 'Detect Escape'}
          </button>
        </div>
      </div>

      {samples && samples.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontWeight: 600, marginRight: 8 }}>Sample Fill:</span>
            {samples.slice(0, 5).map((s, idx) => (
              <button key={idx} type="button" className="btn secondary" title={s.label} onClick={() => applySample(s)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Pen ID</label>
            <input value={penId} onChange={(e) => setPenId(e.target.value)} placeholder="e.g. PEN-AUS-001-P05" />
          </div>
          <div className="form-group full-width">
            <label>Signals (JSON array)</label>
            <textarea rows={10} value={signalsText} onChange={(e) => setSignalsText(e.target.value)} />
          </div>
          <div className="form-group full-width">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>

      <AIResultDisplay result={result} loading={loading} error={error} feature="escape-detect" title="AI - Escape Detect" />

      {historyOpen && (
        <div className="modal-overlay" onClick={() => setHistoryOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <h3>AI - Escape Detect · History</h3>
              <button className="modal-close" onClick={() => setHistoryOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {historyLoading && <div className="empty-state">Loading history...</div>}
              {historyError && <div className="ai-error">{historyError}</div>}
              {!historyLoading && !historyError && historyRows.length === 0 && (
                <div className="empty-state">No past results yet.</div>
              )}
              {historyRows.map((row) => (
                <div key={row.id} className="history-entry">
                  <div className="history-entry-meta">
                    <span className="history-entry-id">#{row.id}</span>
                    <span className="history-entry-time">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <AIResultDisplay result={row.output} feature="escape-detect" title="AI - Escape Detect" />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn secondary" onClick={() => setHistoryOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
