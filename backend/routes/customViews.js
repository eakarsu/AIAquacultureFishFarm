// Custom Farm Analytics views — aggregated time-series read-only endpoints.
// Mounted at /api/custom-views (auth required at server.js layer).

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 1) Biomass per pen over time
router.get('/biomass-by-pen', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pen_id,
             estimated_at,
             total_kg
        FROM biomass_estimates
       WHERE estimated_at IS NOT NULL
       ORDER BY estimated_at ASC
    `);

    // Pivot into {bucket, [pen_id]: total_kg, ...} keyed by ISO date so recharts can render multi-line
    const buckets = new Map(); // bucket -> { bucket, ...pens }
    const penIds = new Set();
    for (const r of rows) {
      const bucket = new Date(r.estimated_at).toISOString().slice(0, 10);
      if (!buckets.has(bucket)) buckets.set(bucket, { bucket });
      const row = buckets.get(bucket);
      row[r.pen_id] = Number(r.total_kg) || 0;
      penIds.add(r.pen_id);
    }
    const series = Array.from(buckets.values()).sort((a, b) => a.bucket.localeCompare(b.bucket));
    res.json({ pens: Array.from(penIds), series });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2) Sea-lice trend (avg lice_per_fish per day with threshold)
router.get('/sea-lice-trend', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT date_trunc('day', sampled_at) AS bucket,
             ROUND(AVG(lice_per_fish)::numeric, 3) AS avg_lice,
             MAX(lice_per_fish)                    AS max_lice,
             COUNT(*)                              AS samples
        FROM sea_lice_counts
       WHERE sampled_at IS NOT NULL
       GROUP BY 1
       ORDER BY 1 ASC
    `);
    const threshold = 0.5;
    res.json({
      threshold,
      series: rows.map((r) => ({
        bucket: new Date(r.bucket).toISOString().slice(0, 10),
        avg_lice: Number(r.avg_lice) || 0,
        max_lice: Number(r.max_lice) || 0,
        samples: Number(r.samples) || 0,
        threshold,
      })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3) Water-quality multi-parameter (temp / oxygen / salinity) per day
router.get('/water-params', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT date_trunc('day', ts) AS bucket,
             parameter,
             ROUND(AVG(value)::numeric, 2) AS avg_value
        FROM water_quality
       WHERE ts IS NOT NULL
         AND parameter IN ('temperature','dissolved_oxygen','salinity')
       GROUP BY 1, 2
       ORDER BY 1 ASC
    `);
    const map = new Map(); // bucket -> {bucket, temperature, dissolved_oxygen, salinity}
    for (const r of rows) {
      const bucket = new Date(r.bucket).toISOString().slice(0, 10);
      if (!map.has(bucket)) map.set(bucket, { bucket });
      map.get(bucket)[r.parameter] = Number(r.avg_value) || 0;
    }
    res.json({
      parameters: ['temperature', 'dissolved_oxygen', 'salinity'],
      series: Array.from(map.values()).sort((a, b) => a.bucket.localeCompare(b.bucket)),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4) Mortality count per pen per ISO week
router.get('/mortality-heatmap', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pen_id,
             to_char(date_trunc('week', ts), 'IYYY-"W"IW') AS week,
             COALESCE(SUM(count), 0) AS total_count
        FROM mortality_logs
       WHERE ts IS NOT NULL
       GROUP BY pen_id, week
       ORDER BY week ASC, pen_id ASC
    `);
    // Pivot into {week, [pen_id]: count, ...}
    const map = new Map();
    const pens = new Set();
    for (const r of rows) {
      if (!map.has(r.week)) map.set(r.week, { week: r.week });
      map.get(r.week)[r.pen_id] = Number(r.total_count) || 0;
      pens.add(r.pen_id);
    }
    res.json({
      pens: Array.from(pens),
      series: Array.from(map.values()).sort((a, b) => a.week.localeCompare(b.week)),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
