const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      farms, pens, groups, feed, treatments, mortality, water, biomass, lice,
      vessels, divers, harvests, customers, certs, predators, impacts, vendors, audit,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='fallow') AS fallow FROM farms"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='stocked') AS stocked, COUNT(*) FILTER (WHERE status='harvest_ready') AS harvest_ready, COALESCE(SUM(fish_count),0) AS total_fish FROM net_pens"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(count),0) AS total_fish FROM fish_groups"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(qty_kg),0) AS total_kg FROM feed_inventory"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='scheduled') AS scheduled, COUNT(*) FILTER (WHERE status='in_progress') AS in_progress FROM treatments"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE status='investigating') AS investigating, COALESCE(SUM(count),0) AS total_count FROM mortality_logs"),
      pool.query("SELECT COUNT(*) AS total FROM water_quality"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(total_kg),0) AS total_kg FROM biomass_estimates"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='breach') AS breach, COUNT(*) FILTER (WHERE status='flagged') AS flagged FROM sea_lice_counts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available, COUNT(*) FILTER (WHERE status='maintenance') AS maintenance FROM vessels"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM divers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='scheduled') AS scheduled, COUNT(*) FILTER (WHERE status='completed') AS completed, COALESCE(SUM(tons),0) AS total_tons FROM harvests"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='suspended') AS suspended FROM customers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='lapsed') AS lapsed, COUNT(*) FILTER (WHERE status='expiring') AS expiring FROM certifications"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE severity='critical') AS critical FROM predator_incidents"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE severity='critical') AS critical FROM environmental_impacts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='preferred') AS preferred, COUNT(*) FILTER (WHERE status='watch') AS watch FROM vendors"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);
    res.json({
      farms: farms.rows[0],
      net_pens: pens.rows[0],
      fish_groups: groups.rows[0],
      feed_inventory: feed.rows[0],
      treatments: treatments.rows[0],
      mortality_logs: mortality.rows[0],
      water_quality: water.rows[0],
      biomass_estimates: biomass.rows[0],
      sea_lice_counts: lice.rows[0],
      vessels: vessels.rows[0],
      divers: divers.rows[0],
      harvests: harvests.rows[0],
      customers: customers.rows[0],
      certifications: certs.rows[0],
      predator_incidents: predators.rows[0],
      environmental_impacts: impacts.rows[0],
      vendors: vendors.rows[0],
      audit_log: audit.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
