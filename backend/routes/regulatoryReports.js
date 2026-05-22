// Regulatory reporting exports (CSV).
// SEPA / Mattilsynet / SERNAPESCA / EPA Tasmania formats vary; we provide
// generic CSV exports that operators can submit / transform. The query
// param ?format=csv (default) returns text/csv; format=json returns JSON.

const express = require('express');
const pool = require('../config/database');

const router = express.Router();

function escapeCsv(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows, columns) {
  const head = columns.join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(row[c])).join(','))
    .join('\n');
  return rows.length === 0 ? head + '\n' : head + '\n' + body + '\n';
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

function parseDateRange(req) {
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  return { from, to };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sea-lice threshold report — SEPA / Mattilsynet style aggregated CSV
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sea-lice', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req);
    const regulator = (req.query.regulator || 'sepa').toString().toLowerCase();
    // Threshold profile by regulator (defaults: 0.5 adult female / fish smolt season, 1.0 outside)
    const thresholds = {
      sepa:        { adult_female_per_fish: 0.5, label: 'SEPA (Scotland)' },
      mattilsynet: { adult_female_per_fish: 0.5, label: 'Mattilsynet (Norway)' },
      sernapesca:  { adult_female_per_fish: 3.0, label: 'SERNAPESCA (Chile, Caligus)' },
      'epa-tasmania': { adult_female_per_fish: 2.0, label: 'EPA Tasmania' },
    };
    const profile = thresholds[regulator] || thresholds.sepa;

    const clauses = [];
    const vals = [];
    if (from) { vals.push(from.toISOString()); clauses.push(`sampled_at >= $${vals.length}`); }
    if (to)   { vals.push(to.toISOString());   clauses.push(`sampled_at <= $${vals.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const r = await pool.query(
      `SELECT count_id, pen_id, lice_per_fish, sampled_at, status, action, notes
       FROM sea_lice_counts ${where}
       ORDER BY sampled_at DESC`,
      vals
    );

    const rows = r.rows.map((row) => ({
      regulator: profile.label,
      threshold_adult_female_per_fish: profile.adult_female_per_fish,
      count_id: row.count_id,
      pen_id: row.pen_id,
      lice_per_fish: row.lice_per_fish,
      threshold_exceeded: Number(row.lice_per_fish) > profile.adult_female_per_fish,
      sampled_at: row.sampled_at,
      status: row.status,
      action: row.action,
      notes: row.notes,
    }));

    if ((req.query.format || 'csv').toLowerCase() === 'json') {
      return res.json({ regulator: profile.label, threshold: profile.adult_female_per_fish, count: rows.length, rows });
    }
    const cols = [
      'regulator', 'threshold_adult_female_per_fish', 'count_id', 'pen_id',
      'lice_per_fish', 'threshold_exceeded', 'sampled_at', 'status', 'action', 'notes',
    ];
    sendCsv(res, `sea-lice-${regulator}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, cols));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// Mortality report
// ─────────────────────────────────────────────────────────────────────────────
router.get('/mortality', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req);
    const clauses = [];
    const vals = [];
    if (from) { vals.push(from.toISOString()); clauses.push(`ts >= $${vals.length}`); }
    if (to)   { vals.push(to.toISOString());   clauses.push(`ts <= $${vals.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const r = await pool.query(
      `SELECT log_id, pen_id, count, cause, ts, status, notes
       FROM mortality_logs ${where}
       ORDER BY ts DESC`,
      vals
    );

    if ((req.query.format || 'csv').toLowerCase() === 'json') {
      return res.json({ count: r.rows.length, rows: r.rows });
    }
    const cols = ['log_id', 'pen_id', 'count', 'cause', 'ts', 'status', 'notes'];
    sendCsv(res, `mortality-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(r.rows, cols));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// Antibiotic / treatment-use report — filters treatments to bath/in_feed/antibiotic
// ─────────────────────────────────────────────────────────────────────────────
router.get('/antibiotic-use', async (req, res) => {
  try {
    const { from, to } = parseDateRange(req);
    const clauses = [];
    const vals = [];
    if (from) { vals.push(from.toISOString()); clauses.push(`applied_at >= $${vals.length}`); }
    if (to)   { vals.push(to.toISOString());   clauses.push(`applied_at <= $${vals.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const r = await pool.query(
      `SELECT treatment_id, pen_id, product, dosage, applied_at, status, notes
       FROM treatments ${where}
       ORDER BY applied_at DESC`,
      vals
    );

    // Heuristic: classify products that look antibiotic / chemotherapeutant.
    const ABX_PATTERNS = /(florfenicol|oxytetracycline|amoxicillin|emamectin|azamethiphos|hydrogen peroxide|deltamethrin|antibiotic|slice|salmosan)/i;
    const rows = r.rows.map((t) => ({
      ...t,
      is_chemotherapeutant: ABX_PATTERNS.test(`${t.product || ''} ${t.notes || ''}`),
    }));

    if ((req.query.format || 'csv').toLowerCase() === 'json') {
      return res.json({ count: rows.length, rows });
    }
    const cols = ['treatment_id', 'pen_id', 'product', 'dosage', 'applied_at', 'status', 'is_chemotherapeutant', 'notes'];
    sendCsv(res, `antibiotic-use-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, cols));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Index — list available reports
router.get('/', (req, res) => {
  res.json({
    reports: [
      { slug: 'sea-lice',        path: '/api/regulatory-reports/sea-lice',        params: ['from','to','regulator','format'], regulators: ['sepa','mattilsynet','sernapesca','epa-tasmania'] },
      { slug: 'mortality',       path: '/api/regulatory-reports/mortality',       params: ['from','to','format'] },
      { slug: 'antibiotic-use',  path: '/api/regulatory-reports/antibiotic-use',  params: ['from','to','format'] },
    ],
    note: 'Live regulator submission feeds require credentials (NEEDS-CREDS). See /api/ai/regulator-feed/<slug> stubs.',
  });
});

module.exports = router;
