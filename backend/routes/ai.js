const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

const SAMPLES = {
  'biomass-vision-estimate': [
    {
      label: 'Pen 4 stereo-vision sample',
      values: {
        pen_id: 'PEN-NOR-001-P02',
        method: 'stereo_vision',
        notes: 'Stereo camera ran 6 hr at 5 m depth, captured 12,400 length measurements. Cohort stocked 2025-03-20.',
      },
    },
    {
      label: 'PEN-CHL-002-P07 Coho harvest-ready check',
      values: {
        pen_id: 'PEN-CHL-002-P07',
        method: 'hybrid',
        notes: 'Coho cohort, sonar + stereo. Target harvest weight 5.0 kg. Last manual sample showed CV ~14%.',
      },
    },
    {
      label: 'PEN-AUS-001-P05 Tasmania post-harvest',
      values: {
        pen_id: 'PEN-AUS-001-P05',
        method: 'stereo_vision',
        notes: 'Macquarie Harbour. Recent low-DO event reduced growth; reassess biomass before next ration set.',
      },
    },
    {
      label: 'PEN-TUR-001-P06 Sea bream sonar',
      values: {
        pen_id: 'PEN-TUR-001-P06',
        method: 'sonar',
        notes: 'Aegean sea bream cohort, harvest weight 480 g, sonar count + sample weighing batch.',
      },
    },
    {
      label: 'PEN-CAN-001-P01 Fundy mid-cycle',
      values: {
        pen_id: 'PEN-CAN-001-P01',
        method: 'stereo_vision',
        notes: 'Bay of Fundy Atlantic salmon, summer growth phase, fresh stereo session 30,000 frames.',
      },
    },
  ],

  'sea-lice-counts-classify': [
    { label: 'Default - last 30 days of counts', values: {} },
    {
      label: 'Bias toward Norway sites',
      values: { notes: 'Focus the assessment on Norwegian sites where threshold is 0.5 adult female lice/fish during smolt migration.' },
    },
    {
      label: 'Pen 4 sea lice count rising, 0.8/fish',
      values: { notes: 'PEN-SCO-002-P04 trending up from 0.4 to 0.81 over 14 days. Considering thermolicer run.' },
    },
    {
      label: 'Chile caligus breach',
      values: { notes: 'PEN-CHL-001-P02 Caligus rogercresseyi at 1.12/fish, regulatory threshold breached, emergency action required.' },
    },
    {
      label: 'Scotland early-season check',
      values: { notes: 'Scottish sites early in production cycle, focus on smolt-protection lice limits and cleanerfish ratios.' },
    },
  ],

  'feed-conversion-optimize': [
    {
      label: 'Hardangerfjord North - grower phase',
      values: { notes: 'FRM-NOR-001 pens averaging FCR 1.18, target 1.10. Cohorts at 3.8-4.5 kg average, using Skretting Optiline 6mm.' },
    },
    {
      label: 'Aysen Chile - high-temperature feed loss',
      values: { notes: 'FRM-CHL-001 reporting elevated pellet sinking past nets at 13C water; want to cut waste and protect FCR.' },
    },
    {
      label: 'Loch Linnhe - AGD-stressed cohort',
      values: { notes: 'FRM-SCO-001 PEN-SCO-001-P01 has open AGD investigation, appetite suppressed, need ration plan that protects FCR without overfeeding.' },
    },
    {
      label: 'Tasmania - recovering from low-DO event',
      values: { notes: 'FRM-AUS-001 PEN-AUS-001-P05 just had DO drop to 4.9 mg/L; ramp ration carefully, expect appetite to return over 5 days.' },
    },
    {
      label: 'Argolic sea bream - bass/bream switch feed',
      values: { notes: 'FRM-GRE-001 finishing 420 g sea bass cohort with Aller Aqua 4mm; want FCR optimization before harvest.' },
    },
  ],

  'mortality-anomaly-detect': [
    { label: 'Default - last 30 days of mortality logs', values: {} },
    { label: 'Default - last 30 days of mortality logs', values: {} },
    {
      label: 'Focus on PEN-CAN-002-P03 BKD',
      values: { notes: 'PEN-CAN-002-P03 reported 520 fish lost on 2026-05-12 with BKD suspected. Need anomaly framing and follow-up actions.' },
    },
    {
      label: 'Tasmania POMV outbreak',
      values: { notes: 'PEN-AUS-001-P05 POMV (Pilchard Orthomyxovirus) outbreak suspect; want anomaly + farm baseline check.' },
    },
    {
      label: 'Greek pasteurellosis spike',
      values: { notes: 'PEN-GRE-001-P03 Photobacterium pasteurelosis suspected, 380 sea bass mortality in single day.' },
    },
  ],

  'treatment-recommend': [
    {
      label: 'Sea lice 0.81/fish PEN-SCO-002-P04',
      values: {
        issue: 'Sea lice (Lepeophtheirus salmonis) at 0.81 adult female/fish trending up in PEN-SCO-002-P04, Shetland.',
        pen_notes: 'Pen volume 46,000 m3, fish count 158,000, avg 4.1 kg, water temp 9C, no active treatments in last 60 days.',
      },
    },
    {
      label: 'AGD outbreak PEN-SCO-001-P01',
      values: {
        issue: 'Amoebic Gill Disease (AGD) clinical signs in PEN-SCO-001-P01 Loch Linnhe; gross gill score 3 on 18% of sampled fish.',
        pen_notes: 'Pen volume 42,000 m3, fish count 145,000, avg 3.6 kg, water temp 10.5C, salinity 32 ppt.',
      },
    },
    {
      label: 'BKD investigation PEN-CAN-002-P03',
      values: {
        issue: 'Bacterial Kidney Disease (BKD) suspected in PEN-CAN-002-P03 Chinook cohort after spike in mortality.',
        pen_notes: 'Pen 38,000 m3, fish count 98,000, avg 2.9 kg, water temp 11.5C, no antibiotics used in last 90 days.',
      },
    },
    {
      label: 'Vibrio in Cesme sea bream',
      values: {
        issue: 'Vibrio anguillarum suspected in PEN-TUR-001-P06 sea bream cohort.',
        pen_notes: 'Pen 32,000 m3, 265,000 sea bream avg 480 g, water temp 19.8C, partial vaccine cover.',
      },
    },
    {
      label: 'POMV outbreak PEN-AUS-001-P05',
      values: {
        issue: 'POMV (Pilchard Orthomyxovirus) confirmed in PEN-AUS-001-P05 Tasmania; want supportive husbandry plan.',
        pen_notes: 'Pen 60,000 m3, fish count 220,000, avg 4.7 kg, water temp 14C, low DO event 4 days ago.',
      },
    },
  ],

  'executive-brief': [
    { label: 'Default snapshot - no bias',                values: { notes: '' } },
    { label: 'Bias toward Norway portfolio',              values: { notes: 'Bias the brief toward the Norwegian sites (Hardangerfjord, Bomlafjord, Trondheimsfjord).' } },
    { label: 'Bias toward Chile portfolio',               values: { notes: 'Focus on Aysen and Los Lagos portfolio plus the active caligus breach at PEN-CHL-001-P02.' } },
    { label: 'Bias toward Scotland AGD season',           values: { notes: 'Focus on Scottish sites and the AGD investigation in Loch Linnhe.' } },
    { label: 'Bias toward Tasmania POMV / low-DO event',  values: { notes: 'Focus on Tasmania Macquarie Harbour, the low-DO event and the POMV investigation.' } },
  ],

  'harvest-schedule': [
    {
      label: 'Next 30 days - all harvest_ready pens',
      values: { window: 'Next 30 days', constraints: 'Two harvest vessels available, processor capacity 320 tons/day across Leroy / Mowi / AquaChile.' },
    },
    {
      label: 'Chile dual-pen surge',
      values: { window: '2026-05-20 to 2026-06-15', constraints: 'AquaChile Puerto Montt only, single wellboat VSL-CHL-001 available, max 250 tons/day plant capacity.' },
    },
    {
      label: 'Mediterranean sea bass/bream batch',
      values: { window: '2026-05-20 to 2026-06-05', constraints: 'PEN-TUR-001-P06 and PEN-GRE-001-P03 ready; one harvest vessel per region, processors Camli Yem and Avramar.' },
    },
    {
      label: 'Tasmania POMV - accelerate harvest',
      values: { window: 'Next 14 days', constraints: 'PEN-AUS-001-P05 POMV risk - accelerate harvest, Tassal Triabunna plant 240 tons/day, single thermolicer / harvest vessel.' },
    },
    {
      label: 'Norway Q3 plan',
      values: { window: '2026-06-01 to 2026-06-30', constraints: 'PEN-NOR-001-P01, PEN-NOR-001-P02 ready; Leroy and SalMar processors, two wellboats VSL-NOR-001 and one harvest vessel charter.' },
    },
  ],

  'water-quality-anomaly': [
    { label: 'Default - last 7 days of water_quality readings', values: {} },
    {
      label: 'Tasmania low-DO event',
      values: { notes: 'PEN-AUS-001-P05 dropped to 4.9 mg/L dissolved oxygen and 28.6 ug/L chl-a; assess hypoxia + bloom risk and recommend actions.' },
    },
    {
      label: 'Aysen algal bloom Chrysochromulina',
      values: { notes: 'FRM-CHL-001 area reporting Chrysochromulina bloom; cross-reference with PEN-CHL-001-P02 DO 5.8 mg/L.' },
    },
    {
      label: 'Aegean warming Cesme',
      values: { notes: 'PEN-TUR-001-P06 water temp 19.8C and rising; want assessment of bream stress + harvest acceleration trigger.' },
    },
    {
      label: 'Loch Linnhe turbidity / salinity',
      values: { notes: 'Recent rain in Loch Linnhe; salinity / turbidity assessment for PEN-SCO-001-P01.' },
    },
  ],

  'predator-deterrent-plan': [
    {
      label: 'Grey seal breach - PEN-NOR-001-P02',
      values: {
        incident: 'Grey seal entered predator net at PEN-NOR-001-P02, 2026-05-12 02:15 local. No fish escape yet but two visible bite marks on inner net.',
        farm_notes: 'FRM-NOR-001 Hardangerfjord, depth 35m, exposed to seal colony on east shore. Predator net Egersund 100mm mesh, anti-fouled.',
      },
    },
    {
      label: 'South American sea lion - Aysen',
      values: {
        incident: 'Repeat South American sea lion attacks at PEN-CHL-001-P02 over 5 nights.',
        farm_notes: 'FRM-CHL-001, sheltered fjord, double-net configuration, acoustic deterrent in place but ineffective.',
      },
    },
    {
      label: 'NZ fur seal - Macquarie Harbour',
      values: {
        incident: 'New Zealand fur seal repeated attacks at PEN-AUS-001-P05.',
        farm_notes: 'FRM-AUS-001 Tasmania, exposed pen at harbour mouth, weather-locked night shifts limit response.',
      },
    },
    {
      label: 'Broadnose sevengill shark - critical',
      values: {
        incident: 'Broadnose sevengill shark intrusion at PEN-AUS-001-P05, large enough to cause significant net damage.',
        farm_notes: 'FRM-AUS-001 Macquarie Harbour, single predator net, no shark-specific deterrent in place.',
      },
    },
    {
      label: 'Mediterranean monk seal - protected species',
      values: {
        incident: 'Mediterranean monk seal interaction at PEN-TUR-001-P06; strictly protected, lethal deterrent not permitted.',
        farm_notes: 'FRM-TUR-001 Aegean, working with Turkish ministry on non-lethal deterrent options only.',
      },
    },
  ],

  'environmental-risk-brief': [
    {
      label: 'FRM-NOR-001 Hardangerfjord baseline',
      values: { farm_id: 'FRM-NOR-001', notes: 'Norway National salmon fjord, ASC certified, recent benthic survey results below limit.' },
    },
    {
      label: 'FRM-CHL-001 Aysen algal bloom',
      values: { farm_id: 'FRM-CHL-001', notes: 'Active Chrysochromulina bloom; want oceanographic + disease + chemical risk overview.' },
    },
    {
      label: 'FRM-AUS-001 Macquarie low-DO + POMV',
      values: { farm_id: 'FRM-AUS-001', notes: 'Macquarie Harbour low-DO and POMV incidents open; comprehensive environmental brief.' },
    },
    {
      label: 'FRM-SCO-001 Loch Linnhe nitrogen',
      values: { farm_id: 'FRM-SCO-001', notes: 'Nitrogen loading flagged above limit on last SEPA inspection; AGD outbreak compounds risk.' },
    },
    {
      label: 'FRM-TUR-001 Cesme phosphorus',
      values: { farm_id: 'FRM-TUR-001', notes: 'Discharge above phosphorus threshold open; warm-water bream production.' },
    },
  ],

  'vessel-shift-schedule': [
    {
      label: 'Norway 7-day shift plan',
      values: { window: '2026-05-18 to 2026-05-24', notes: 'Tasks: feed delivery FRM-NOR-001 and FRM-NOR-002 daily, harvest run HRV-2026-0003 on 2026-05-25, net cleaning Loch Linnhe.' },
    },
    {
      label: 'Chile 7-day shift plan',
      values: { window: '2026-05-18 to 2026-05-24', notes: 'Wellboat treatment run PEN-CHL-001-P02 hydrogen peroxide, harvest run HRV-2026-0001 on 2026-05-20, feed deliveries Aysen + Los Lagos.' },
    },
    {
      label: 'Tasmania accelerated harvest',
      values: { window: '2026-05-18 to 2026-05-24', notes: 'POMV-driven accelerated harvest, thermolicer run, harvest vessel charter; minimize concurrent ops to limit stress.' },
    },
    {
      label: 'Mediterranean dual-region',
      values: { window: '2026-05-18 to 2026-05-31', notes: 'Greek + Turkish sea bass/bream harvest, vessel transfer between Argolic and Cesme, net cleaning Argolic.' },
    },
    {
      label: 'Canada Bay of Fundy + Vancouver Island',
      values: { window: '2026-05-18 to 2026-05-31', notes: 'SLICE treatment Fundy, dive tender Vancouver Island BKD investigation, harvest run Cooke Aquaculture.' },
    },
  ],

  'diver-safety-brief': [
    {
      label: 'Net inspection L2 - Hardangerfjord',
      values: {
        dive_objective: 'Quarterly net integrity inspection at PEN-NOR-001-P02 after grey seal incident.',
        site_notes: 'FRM-NOR-001 Hardangerfjord, depth 35m, water temp 9.4C, visibility 4-6m, current 0.4 kt, weather calm.',
      },
    },
    {
      label: 'Mortality removal - Aysen bloom',
      values: {
        dive_objective: 'Mortality basket removal at PEN-CHL-001-P02 after caligus secondary mortality + algal bloom.',
        site_notes: 'FRM-CHL-001 Aysen fjord, depth 30m, current bloom in surface 5m, lower DO at depth, water temp 11C.',
      },
    },
    {
      label: 'Mooring inspection - Tasmania',
      values: {
        dive_objective: 'Mooring inspection at FRM-AUS-001 after low-DO event and predator pressure.',
        site_notes: 'Macquarie Harbour mouth, depth 38m, current 1.2 kt, visibility 3m due to bloom, weather rolling 2m swell.',
      },
    },
    {
      label: 'Net repair - Bay of Fundy',
      values: {
        dive_objective: 'Net repair after small puncture on PEN-CAN-001-P01.',
        site_notes: 'Bay of Fundy, strong tidal current up to 4 kt at peak, work in slack water only, depth 25m, temp 8C.',
      },
    },
    {
      label: 'Predator net check - Cesme',
      values: {
        dive_objective: 'Predator net inspection at PEN-TUR-001-P06 after Mediterranean monk seal interaction.',
        site_notes: 'Cesme Aegean, depth 20m, water temp 19.8C, visibility 8m, calm conditions.',
      },
    },
  ],

  'customer-quality-report': [
    {
      label: 'Costco Wholesale Q2 batch report',
      values: { customer_id: 'CUS-0001', period: 'Q2 2026', notes: 'High-volume premium fresh salmon contract, audit-grade quality summary.' },
    },
    {
      label: 'Marks and Spencer premium audit',
      values: { customer_id: 'CUS-0002', period: 'Q2 2026', notes: 'M&S premium standards, RSPCA Assured chain-of-custody, full traceability.' },
    },
    {
      label: 'Sushiro yellowtail freshness',
      values: { customer_id: 'CUS-0006', period: 'Q2 2026', notes: 'Foodservice chain, yellowtail freshness scores, hama-yaki spec.' },
    },
    {
      label: 'Coles Group Tasmania batch',
      values: { customer_id: 'CUS-0014', period: 'Q2 2026', notes: 'Coles Australia, Tasmania-origin only, POMV transparency disclosure.' },
    },
    {
      label: 'Carrefour FR retail',
      values: { customer_id: 'CUS-0003', period: 'Q2 2026', notes: 'Carrefour France, ASC chain-of-custody, fat content + color score reporting.' },
    },
  ],

  'certification-readiness': [
    { label: 'Default - all active certifications', values: { notes: '' } },
    {
      label: 'Focus on lapsed ASC at FRM-AUS-001',
      values: { notes: 'CRT-0010 lapsed; rebuild readiness pack for ASC re-audit at Macquarie Harbour despite POMV.' },
    },
    {
      label: 'Norway organic Debio',
      values: { notes: 'CRT-0015 Debio Organic at FRM-NOR-001; readiness for annual surveillance audit.' },
    },
    {
      label: 'Scotland RSPCA + ASC dual',
      values: { notes: 'FRM-SCO-001 RSPCA Assured + Loch Linnhe AGD investigation; readiness implications.' },
    },
    {
      label: 'Aegean BAP 3-Star upgrade to 4-Star',
      values: { notes: 'FRM-TUR-001 BAP 3-Star; readiness gap to BAP 4-Star and impact of phosphorus issue.' },
    },
  ],

  'vendor-quality-score': [
    { label: 'Default - score all 15 vendors', values: {} },
    { label: 'Focus on feed vendors',          values: { notes: 'Focus only on Skretting, BioMar, EWOS and the FCR / pellet integrity dimension.' } },
    { label: 'Focus on equipment vendors',     values: { notes: 'Focus on AKVA, Steinsvik, Egersund, Morenot, Optimar and equipment reliability + spares.' } },
    { label: 'Genetics + smolt suppliers',     values: { notes: 'Focus on AquaGen, Benchmark Genetics, Bakkafrost Smolt AS, smolt quality scoring.' } },
    { label: 'Flag concentration risk',        values: { notes: 'Highlight supply concentration risk in feed (Norway-heavy) and genetics (Norway-heavy).' } },
  ],

  'market-price-forecast': [
    {
      label: 'Atlantic Salmon - 12 weeks',
      values: { species: 'Atlantic Salmon', horizon_weeks: 12, notes: 'Nasdaq Salmon Index baseline 8.4 USD/kg; consider Norway harvest pull, Chile production, EU demand.' },
    },
    {
      label: 'Coho Salmon - 8 weeks',
      values: { species: 'Coho Salmon', horizon_weeks: 8, notes: 'Chilean Coho, FOB Tome, Japan and Russia demand mix.' },
    },
    {
      label: 'Sea Bass - 16 weeks',
      values: { species: 'European Sea Bass', horizon_weeks: 16, notes: 'Greek and Turkish supply pressure, EU summer demand, Italian retail price baseline.' },
    },
    {
      label: 'Sea Bream - 16 weeks',
      values: { species: 'Gilthead Sea Bream', horizon_weeks: 16, notes: 'Aegean production, Spanish demand, hot-season size grade mix.' },
    },
    {
      label: 'Yellowtail - 12 weeks',
      values: { species: 'Yellowtail (Buri)', horizon_weeks: 12, notes: 'Japanese domestic plus US sushi-grade export demand.' },
    },
  ],
};

router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) return res.json({ features: Object.keys(SAMPLES) });
    const samples = SAMPLES[feature];
    if (!samples) return res.status(404).json({ error: `unknown feature: ${feature}` });
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 1. biomass-vision-estimate
router.post('/biomass-vision-estimate', async (req, res) => {
  try {
    let { pen_id, method, notes, pen_context } = req.body || {};
    let ctx = pen_context || {};
    if (!Object.keys(ctx).length && pen_id) {
      const [pen, group, biomass] = await Promise.all([
        pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]),
        pool.query('SELECT * FROM fish_groups WHERE pen_id = $1 ORDER BY id DESC LIMIT 1', [pen_id]),
        pool.query('SELECT * FROM biomass_estimates WHERE pen_id = $1 ORDER BY estimated_at DESC LIMIT 3', [pen_id]),
      ]);
      ctx = { pen_id, pen: pen.rows[0] || null, latest_group: group.rows[0] || null, recent_estimates: biomass.rows };
    }
    if (!Object.keys(ctx).length) {
      const r = await pool.query("SELECT * FROM net_pens WHERE status='stocked' ORDER BY id ASC LIMIT 1");
      ctx = { pen: r.rows[0] || null };
    }
    if (method) ctx.method = method;
    if (notes) ctx.notes = notes;
    const result = await ai.biomassVisionEstimate(ctx);
    await record('biomass-vision-estimate', { pen_id, method, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. sea-lice-counts-classify
router.post('/sea-lice-counts-classify', async (req, res) => {
  try {
    let { counts, notes } = req.body || {};
    if (!Array.isArray(counts) || counts.length === 0) {
      const r = await pool.query('SELECT * FROM sea_lice_counts ORDER BY sampled_at DESC LIMIT 30');
      counts = r.rows;
    }
    const input = notes ? counts.concat([{ analyst_notes: notes }]) : counts;
    const result = await ai.seaLiceCountsClassify(input);
    await record('sea-lice-counts-classify', { count: counts.length, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. feed-conversion-optimize
router.post('/feed-conversion-optimize', async (req, res) => {
  try {
    let ctx = req.body?.context || {};
    if (!Object.keys(ctx).length) {
      const [pens, feed, groups] = await Promise.all([
        pool.query("SELECT * FROM net_pens WHERE status IN ('stocked','harvest_ready') ORDER BY id ASC LIMIT 20"),
        pool.query('SELECT * FROM feed_inventory ORDER BY id ASC LIMIT 20'),
        pool.query('SELECT * FROM fish_groups ORDER BY id ASC LIMIT 20'),
      ]);
      ctx = { pens: pens.rows, feed_inventory: feed.rows, fish_groups: groups.rows };
    }
    if (req.body?.notes) ctx.notes = req.body.notes;
    const result = await ai.feedConversionOptimize(ctx);
    await record('feed-conversion-optimize', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. mortality-anomaly-detect
router.post('/mortality-anomaly-detect', async (req, res) => {
  try {
    let { logs, notes } = req.body || {};
    if (!Array.isArray(logs) || logs.length === 0) {
      const r = await pool.query('SELECT * FROM mortality_logs ORDER BY ts DESC LIMIT 40');
      logs = r.rows;
    }
    const input = notes ? logs.concat([{ analyst_notes: notes }]) : logs;
    const result = await ai.mortalityAnomalyDetect(input);
    await record('mortality-anomaly-detect', { count: logs.length, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. treatment-recommend
router.post('/treatment-recommend', async (req, res) => {
  try {
    const { issue, pen_notes, pen_id } = req.body || {};
    if (!issue) return res.status(400).json({ error: 'issue is required' });
    let pen_context = { notes: pen_notes || '' };
    if (pen_id) {
      const r = await pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]);
      pen_context.pen = r.rows[0] || null;
    }
    const result = await ai.treatmentRecommend(issue, pen_context);
    await record('treatment-recommend', { issue, pen_id, pen_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. executive-brief
router.post('/executive-brief', async (req, res) => {
  try {
    const [farms, pens, biomass, lice, mortality, harvests, impacts] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM farms"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='harvest_ready') AS harvest_ready, COALESCE(SUM(fish_count),0) AS fish_count FROM net_pens"),
      pool.query("SELECT COALESCE(SUM(total_kg),0) AS total_kg FROM biomass_estimates"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='breach') AS breach, COUNT(*) FILTER (WHERE status='flagged') AS flagged FROM sea_lice_counts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE status='investigating') AS investigating FROM mortality_logs"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='scheduled') AS scheduled, COUNT(*) FILTER (WHERE status='completed') AS completed FROM harvests"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE status='open') AS open FROM environmental_impacts"),
    ]);
    const snapshot = {
      farms: farms.rows[0],
      net_pens: pens.rows[0],
      biomass_kg: biomass.rows[0].total_kg,
      sea_lice: lice.rows[0],
      mortality: mortality.rows[0],
      harvests: harvests.rows[0],
      environmental_impacts: impacts.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.executiveBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. harvest-schedule
router.post('/harvest-schedule', async (req, res) => {
  try {
    const { window, constraints } = req.body || {};
    const [pens, vessels, harvests] = await Promise.all([
      pool.query("SELECT * FROM net_pens WHERE status IN ('harvest_ready','stocked') ORDER BY id ASC LIMIT 30"),
      pool.query("SELECT * FROM vessels WHERE type IN ('harvest_vessel','wellboat') AND status='available'"),
      pool.query("SELECT * FROM harvests WHERE status='scheduled' ORDER BY harvested_at ASC LIMIT 30"),
    ]);
    const result = await ai.harvestSchedule(pens.rows, { window, constraints, vessels: vessels.rows, existing_scheduled: harvests.rows });
    await record('harvest-schedule', { window, constraints }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. water-quality-anomaly
router.post('/water-quality-anomaly', async (req, res) => {
  try {
    let { readings, notes } = req.body || {};
    if (!Array.isArray(readings) || readings.length === 0) {
      const r = await pool.query('SELECT * FROM water_quality ORDER BY ts DESC LIMIT 50');
      readings = r.rows;
    }
    const input = notes ? readings.concat([{ analyst_notes: notes }]) : readings;
    const result = await ai.waterQualityAnomaly(input);
    await record('water-quality-anomaly', { count: readings.length, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. predator-deterrent-plan
router.post('/predator-deterrent-plan', async (req, res) => {
  try {
    const { incident, farm_notes, incident_id } = req.body || {};
    if (!incident) return res.status(400).json({ error: 'incident is required' });
    let farm_context = { notes: farm_notes || '' };
    if (incident_id) {
      const r = await pool.query('SELECT * FROM predator_incidents WHERE incident_id = $1', [incident_id]);
      farm_context.incident_row = r.rows[0] || null;
    }
    const result = await ai.predatorDeterrentPlan(incident, farm_context);
    await record('predator-deterrent-plan', { incident, incident_id, farm_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 10. environmental-risk-brief
router.post('/environmental-risk-brief', async (req, res) => {
  try {
    const { farm_id, notes } = req.body || {};
    let farm = farm_id || null;
    let impacts = [];
    if (farm_id) {
      const f = await pool.query('SELECT * FROM farms WHERE farm_id = $1', [farm_id]);
      farm = f.rows[0] || farm_id;
      const i = await pool.query('SELECT * FROM environmental_impacts WHERE farm_id = $1 ORDER BY opened_at DESC LIMIT 20', [farm_id]);
      impacts = i.rows;
    } else {
      const i = await pool.query('SELECT * FROM environmental_impacts ORDER BY opened_at DESC LIMIT 30');
      impacts = i.rows;
    }
    const ctxFarm = typeof farm === 'object' && farm !== null
      ? { ...farm, analyst_notes: notes || '' }
      : { farm_id: farm, analyst_notes: notes || '' };
    const result = await ai.environmentalRiskBrief(ctxFarm, impacts);
    await record('environmental-risk-brief', { farm_id, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11. vessel-shift-schedule
router.post('/vessel-shift-schedule', async (req, res) => {
  try {
    const { window, notes, tasks } = req.body || {};
    const v = await pool.query('SELECT * FROM vessels ORDER BY id ASC');
    let taskList = tasks;
    if (!Array.isArray(taskList) || taskList.length === 0) {
      const [harv, trt] = await Promise.all([
        pool.query("SELECT * FROM harvests WHERE status='scheduled' ORDER BY harvested_at ASC LIMIT 10"),
        pool.query("SELECT * FROM treatments WHERE status='scheduled' ORDER BY applied_at ASC LIMIT 10"),
      ]);
      taskList = [
        ...harv.rows.map((h) => ({ kind: 'harvest', ...h })),
        ...trt.rows.map((t) => ({ kind: 'treatment', ...t })),
      ];
    }
    if (notes) taskList = taskList.concat([{ analyst_notes: notes, window }]);
    const result = await ai.vesselShiftSchedule(v.rows, taskList);
    await record('vessel-shift-schedule', { window, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12. diver-safety-brief
router.post('/diver-safety-brief', async (req, res) => {
  try {
    const { dive_objective, site_notes, diver_id } = req.body || {};
    if (!dive_objective) return res.status(400).json({ error: 'dive_objective is required' });
    let ctx = { dive_objective, site_notes: site_notes || '' };
    if (diver_id) {
      const d = await pool.query('SELECT * FROM divers WHERE diver_id = $1', [diver_id]);
      ctx.diver = d.rows[0] || null;
    }
    const result = await ai.diverSafetyBrief(ctx);
    await record('diver-safety-brief', { dive_objective, diver_id, site_notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13. customer-quality-report
router.post('/customer-quality-report', async (req, res) => {
  try {
    const { customer_id, period, notes } = req.body || {};
    let customer = customer_id || 'Unknown';
    if (customer_id) {
      const c = await pool.query('SELECT * FROM customers WHERE customer_id = $1', [customer_id]);
      if (c.rows.length) customer = c.rows[0];
    }
    const h = await pool.query("SELECT * FROM harvests WHERE status='completed' ORDER BY harvested_at DESC LIMIT 8");
    const ctxCustomer = typeof customer === 'object' && customer !== null
      ? { ...customer, period: period || '', analyst_notes: notes || '' }
      : { customer_id: customer, period: period || '' };
    const result = await ai.customerQualityReport(ctxCustomer, h.rows);
    await record('customer-quality-report', { customer_id, period, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14. certification-readiness
router.post('/certification-readiness', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM certifications ORDER BY expires_at ASC');
    const farms = await pool.query('SELECT * FROM farms ORDER BY id ASC');
    const result = await ai.certificationReadiness(r.rows, { farms: farms.rows, notes: req.body?.notes || '' });
    await record('certification-readiness', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15. vendor-quality-score
router.post('/vendor-quality-score', async (req, res) => {
  try {
    const v = await pool.query('SELECT * FROM vendors ORDER BY id ASC');
    const rows = req.body?.notes ? v.rows.concat([{ analyst_notes: req.body.notes }]) : v.rows;
    const result = await ai.vendorQualityScore(rows);
    await record('vendor-quality-score', { notes: req.body?.notes || null }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16. market-price-forecast
router.post('/market-price-forecast', async (req, res) => {
  try {
    const { species, horizon_weeks, notes } = req.body || {};
    if (!species) return res.status(400).json({ error: 'species is required' });
    const result = await ai.marketPriceForecast(species, horizon_weeks || 12, { notes: notes || '' });
    await record('market-price-forecast', { species, horizon_weeks, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
