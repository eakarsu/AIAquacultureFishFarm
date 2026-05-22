import React, { useEffect, useState } from 'react';
import { listRegulatoryReports, downloadRegulatoryReport } from '../services/api';

const REGULATORS = ['sepa', 'mattilsynet', 'sernapesca', 'epa-tasmania'];

export default function RegulatoryReportsPage() {
  const [reports, setReports] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [regulator, setRegulator] = useState('sepa');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    listRegulatoryReports()
      .then((d) => setReports(Array.isArray(d?.reports) ? d.reports : []))
      .catch(() => setReports([]));
  }, []);

  const download = async (slug) => {
    setBusy(slug); setError(null);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (slug === 'sea-lice') params.regulator = regulator;
      const csv = await downloadRegulatoryReport(slug, params);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Regulatory Reports</h2>
          <p>CSV exports for SEPA / Mattilsynet / SERNAPESCA / EPA Tasmania submission workflows.</p>
        </div>
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Sea-lice regulator profile</label>
            <select value={regulator} onChange={(e) => setRegulator(e.target.value)}>
              {REGULATORS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="ai-error" style={{ marginTop: 12 }}>{error}</div>}

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Available Reports</h3>
        {reports.length === 0 ? <div className="empty-state">No reports available.</div> : (
          <table className="data-table">
            <thead><tr><th>Report</th><th>Path</th><th>Params</th><th></th></tr></thead>
            <tbody>
              {reports.map((rep) => (
                <tr key={rep.slug}>
                  <td>{rep.slug}</td>
                  <td><code>{rep.path}</code></td>
                  <td>{(rep.params || []).join(', ')}</td>
                  <td>
                    <button className="btn ai" disabled={busy === rep.slug} onClick={() => download(rep.slug)}>
                      {busy === rep.slug ? 'Downloading...' : 'Download CSV'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Live Regulator Feeds</h3>
        <p>Live submission to SEPA / Mattilsynet / SERNAPESCA / EPA Tasmania requires API credentials.
        Stub endpoints exist at <code>/api/ai/regulator-feed/&lt;slug&gt;</code> (returns 503 until configured).</p>
      </div>
    </div>
  );
}
