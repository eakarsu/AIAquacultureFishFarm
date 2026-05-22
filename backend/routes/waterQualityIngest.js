// Batch sensor ingest endpoint for water quality telemetry.
// Mounted alongside /api/water-quality CRUD. Accepts arrays of readings from
// DO / temp / pH / salinity sensors and persists each as a water_quality row.
// Logs the batch in sensor_ingest_log (table from migration 003).

const express = require('express');
const pool = require('../config/database');
const { requireWriter } = require('../middleware/auth');

const router = express.Router();

// Normalize a single reading. Accepts shapes like:
//   { pen_id, parameter, value, units, ts }
//   { pen_id, ts, dissolved_oxygen_mg_l, temp_c, ph, salinity_ppt, turbidity_ntu }
// In the second shape we expand into multiple parameter rows.
function expandReading(r, source) {
  if (!r || typeof r !== 'object') return [];
  const ts = r.ts || r.timestamp || r.recorded_at || new Date().toISOString();
  const pen_id = r.pen_id || r.pen || null;
  const out = [];

  // Direct single-parameter shape
  if (r.parameter && r.value !== undefined) {
    out.push({
      reading_id: r.reading_id || null,
      pen_id,
      parameter: r.parameter,
      value: r.value,
      units: r.units || null,
      ts,
      notes: r.notes || (source ? `ingest:${source}` : null),
    });
    return out;
  }

  // Wide-shape multi-parameter readings
  const MAP = [
    ['dissolved_oxygen_mg_l', 'dissolved_oxygen', 'mg/L'],
    ['do_mg_l',               'dissolved_oxygen', 'mg/L'],
    ['temp_c',                'temperature',      'C'],
    ['temperature_c',         'temperature',      'C'],
    ['ph',                    'ph',               'pH'],
    ['salinity_ppt',          'salinity',         'ppt'],
    ['salinity',              'salinity',         'ppt'],
    ['turbidity_ntu',         'turbidity',        'NTU'],
    ['chlorophyll_a_ug_l',    'chlorophyll_a',    'ug/L'],
    ['chl_a_ug_l',            'chlorophyll_a',    'ug/L'],
  ];
  for (const [field, parameter, units] of MAP) {
    if (r[field] !== undefined && r[field] !== null && r[field] !== '') {
      out.push({
        reading_id: null,
        pen_id,
        parameter,
        value: r[field],
        units,
        ts,
        notes: source ? `ingest:${source}` : null,
      });
    }
  }
  return out;
}

router.post('/', requireWriter, async (req, res) => {
  try {
    const body = req.body || {};
    const source = (body.source || 'sensor-bulk').toString().slice(0, 80);
    const readings = Array.isArray(body.readings) ? body.readings : (Array.isArray(body) ? body : []);
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ error: 'readings array is required' });
    }

    const expanded = [];
    for (const r of readings) {
      for (const row of expandReading(r, source)) expanded.push(row);
    }
    if (expanded.length === 0) {
      return res.status(400).json({ error: 'no recognizable parameter rows extracted' });
    }

    let inserted = 0;
    const errors = [];
    for (const row of expanded) {
      try {
        await pool.query(
          `INSERT INTO water_quality (reading_id, pen_id, parameter, value, units, ts, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [row.reading_id, row.pen_id, row.parameter, row.value, row.units, row.ts, row.notes]
        );
        inserted++;
      } catch (e) {
        errors.push({ row, reason: e.message });
      }
    }

    // Log the ingest batch (best-effort)
    try {
      const firstPen = expanded[0] && expanded[0].pen_id ? expanded[0].pen_id : null;
      await pool.query(
        `INSERT INTO sensor_ingest_log (source, pen_id, rows_received, rows_inserted, rows_failed, notes)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [source, firstPen, readings.length, inserted, errors.length, body.notes || null]
      );
    } catch (e) { /* table may not exist on stale schemas — non-fatal */ }

    res.json({
      source,
      readings_received: readings.length,
      rows_expanded: expanded.length,
      inserted,
      failed: errors.length,
      errors: errors.slice(0, 20),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/log', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
    const r = await pool.query(
      'SELECT * FROM sensor_ingest_log ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
