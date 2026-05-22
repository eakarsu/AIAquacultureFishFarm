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

  'fish-health-diagnostic': [
    {
      label: 'AGD suspect - PEN-SCO-001-P01',
      values: { pen_id: 'PEN-SCO-001-P01', symptoms: 'Gill paleness, mucus patches, lethargy, surface gasping in mornings.', image_refs: ['camera/PEN-SCO-001-P01_2026-05-20_0700.jpg'], notes: 'Gill score 3 on 18% of sample, water temp 10.5C.' },
    },
    {
      label: 'BKD investigation - PEN-CAN-002-P03',
      values: { pen_id: 'PEN-CAN-002-P03', symptoms: 'Exophthalmia, kidney swelling on post-mortem, dark skin, lethargy.', image_refs: [], notes: 'Chinook cohort, 520 mortality in single day.' },
    },
    {
      label: 'POMV suspect - PEN-AUS-001-P05',
      values: { pen_id: 'PEN-AUS-001-P05', symptoms: 'Anemia, pale gills, splenomegaly on necropsy, scale loss.', image_refs: ['camera/PEN-AUS-001-P05_2026-05-19_1400.jpg'], notes: 'Macquarie Harbour, low-DO event 4d ago.' },
    },
    {
      label: 'Sea bass Vibrio - PEN-TUR-001-P06',
      values: { pen_id: 'PEN-TUR-001-P06', symptoms: 'Hemorrhagic skin lesions, ulcers around mouth, abdominal distension.', image_refs: [], notes: 'Aegean sea bream 480g, partial vaccine cover.' },
    },
    {
      label: 'Image-only diagnostic',
      values: { pen_id: '', symptoms: 'Multiple fish floating belly-up with no obvious external lesions.', image_refs: ['unknown/floater_001.jpg', 'unknown/floater_002.jpg'], notes: 'No pen ID known, ad-hoc photo sent from manager phone.' },
    },
  ],

  'biomass-forecast': [
    {
      label: 'PEN-NOR-001-P02 - 8 weeks',
      values: { pen_id: 'PEN-NOR-001-P02', horizon_weeks: 8, notes: 'Norwegian salmon grower, current avg 4.3 kg, target harvest 5.0 kg.' },
    },
    {
      label: 'PEN-CHL-002-P07 - 12 weeks Coho',
      values: { pen_id: 'PEN-CHL-002-P07', horizon_weeks: 12, notes: 'Chilean Coho, harvest weight 5.0 kg target by Q3.' },
    },
    {
      label: 'PEN-AUS-001-P05 - 6 weeks post-DO',
      values: { pen_id: 'PEN-AUS-001-P05', horizon_weeks: 6, notes: 'Tasmania POMV / low-DO history, growth may be suppressed.' },
    },
    {
      label: 'PEN-TUR-001-P06 - 10 weeks bream',
      values: { pen_id: 'PEN-TUR-001-P06', horizon_weeks: 10, notes: 'Aegean sea bream 480g, warming water, hot-season size grade.' },
    },
    {
      label: 'PEN-CAN-001-P01 - 8 weeks Fundy',
      values: { pen_id: 'PEN-CAN-001-P01', horizon_weeks: 8, notes: 'Bay of Fundy Atlantic salmon, summer growth phase.' },
    },
  ],

  'harvest-timing': [
    {
      label: 'PEN-NOR-001-P02 - 5.0 kg target',
      values: { pen_id: 'PEN-NOR-001-P02', target_avg_weight_g: 5000, market_notes: 'Nasdaq Salmon Index trending up through Q2.', notes: 'Leroy / Mowi processor priority.' },
    },
    {
      label: 'PEN-CHL-001-P02 - caligus breach',
      values: { pen_id: 'PEN-CHL-001-P02', target_avg_weight_g: 4500, market_notes: 'Coho FOB Tome 7.8 USD/kg.', notes: 'Caligus breach - consider early harvest.' },
    },
    {
      label: 'PEN-AUS-001-P05 - POMV accelerate',
      values: { pen_id: 'PEN-AUS-001-P05', target_avg_weight_g: 4700, market_notes: 'Coles Australia premium hold.', notes: 'POMV risk - accelerate harvest if welfare deteriorates.' },
    },
    {
      label: 'PEN-TUR-001-P06 - bream 480g',
      values: { pen_id: 'PEN-TUR-001-P06', target_avg_weight_g: 480, market_notes: 'Avramar EU summer demand.', notes: 'Sea bream hot-season size grade.' },
    },
    {
      label: 'PEN-GRE-001-P03 - bass batch',
      values: { pen_id: 'PEN-GRE-001-P03', target_avg_weight_g: 420, market_notes: 'Spanish/Italian retail steady.', notes: 'Argolic bass batch ready window 2 weeks.' },
    },
  ],

  'mortality-predict': [
    { label: 'All active pens - 30d outlook', values: { notes: '' } },
    { label: 'PEN-SCO-001-P01 AGD focus', values: { pen_id: 'PEN-SCO-001-P01', notes: 'Open AGD investigation - want forward 30d mortality.' } },
    { label: 'PEN-AUS-001-P05 POMV', values: { pen_id: 'PEN-AUS-001-P05', notes: 'POMV outbreak + low-DO history.' } },
    { label: 'PEN-CHL-001-P02 caligus', values: { pen_id: 'PEN-CHL-001-P02', notes: 'Caligus breach + algal bloom risk.' } },
    { label: 'PEN-CAN-002-P03 BKD', values: { pen_id: 'PEN-CAN-002-P03', notes: 'BKD investigation - 14d outlook critical.' } },
  ],

  'sustainability-score': [
    { label: 'All farms - composite', values: { notes: '' } },
    { label: 'FRM-NOR-001 Hardangerfjord', values: { farm_id: 'FRM-NOR-001', notes: 'ASC certified, recent benthic survey below limit.' } },
    { label: 'FRM-CHL-001 Aysen', values: { farm_id: 'FRM-CHL-001', notes: 'Active Chrysochromulina bloom, caligus breach.' } },
    { label: 'FRM-AUS-001 Macquarie', values: { farm_id: 'FRM-AUS-001', notes: 'POMV + low-DO + ASC lapsed.' } },
    { label: 'FRM-SCO-001 Loch Linnhe', values: { farm_id: 'FRM-SCO-001', notes: 'Nitrogen flagged + AGD investigation.' } },
  ],

  'pen-camera-analyze': [
    {
      label: 'PEN-NOR-001-P02 routine frame',
      values: { pen_id: 'PEN-NOR-001-P02', frame_refs: ['camera/PEN-NOR-001-P02_2026-05-20_0800.jpg'], frame_description: 'Mid-water column shot, school visible at 10m, normal schooling pattern, light fouling on inner net.', notes: '' },
    },
    {
      label: 'PEN-SCO-001-P01 AGD inspection',
      values: { pen_id: 'PEN-SCO-001-P01', frame_refs: ['camera/PEN-SCO-001-P01_2026-05-20_0700.jpg'], frame_description: 'Surface gasping behavior visible, slow swimming, gill paleness on close-ups.', notes: 'AGD investigation context.' },
    },
    {
      label: 'PEN-CHL-001-P02 algal bloom',
      values: { pen_id: 'PEN-CHL-001-P02', frame_refs: ['camera/PEN-CHL-001-P02_2026-05-20_1200.jpg'], frame_description: 'Greenish water column above 5m, reduced visibility, fish congregating deeper.', notes: 'Chrysochromulina bloom suspected.' },
    },
    {
      label: 'PEN-AUS-001-P05 net check post-shark',
      values: { pen_id: 'PEN-AUS-001-P05', frame_refs: ['camera/PEN-AUS-001-P05_2026-05-20_1500.jpg', 'camera/PEN-AUS-001-P05_2026-05-20_1502.jpg'], frame_description: 'Visible scuff marks on inner predator net at 8m depth, no breach apparent, normal schooling.', notes: 'Post broadnose sevengill shark interaction.' },
    },
    {
      label: 'PEN-TUR-001-P06 monk seal check',
      values: { pen_id: 'PEN-TUR-001-P06', frame_refs: ['camera/PEN-TUR-001-P06_2026-05-20_1000.jpg'], frame_description: 'Mediterranean monk seal visible outside predator net at 5m, no breach, fish remain calm.', notes: 'Protected species - non-lethal only.' },
    },
  ],

  'escape-detect': [
    {
      label: 'PEN-NOR-001-P02 routine baseline',
      values: {
        pen_id: 'PEN-NOR-001-P02',
        signals: [
          { source: 'acoustic_tag', delta: 0.01, direction: 'flat', note: 'No change in tagged fish count.' },
          { source: 'sonar', delta: 0.005, direction: 'flat', note: 'Sonar count within 0.5% baseline.' },
          { source: 'net_tension', delta: 0.02, direction: 'up', note: 'Slight tension increase but within seasonal range.' },
        ],
        notes: 'Routine quarterly check.',
      },
    },
    {
      label: 'PEN-AUS-001-P05 post-shark breach concern',
      values: {
        pen_id: 'PEN-AUS-001-P05',
        signals: [
          { source: 'acoustic_tag', delta: -0.018, direction: 'down', note: 'Acoustic tag count down 1.8% in 6h.' },
          { source: 'sonar', delta: -0.025, direction: 'down', note: 'Sonar count down 2.5% in 6h, abrupt.' },
          { source: 'net_tension', delta: -0.4, direction: 'down', note: 'Net tension drop on south face suggesting breach.' },
          { source: 'camera', delta: 0, direction: 'flat', note: 'Camera offline since shark interaction.' },
        ],
        notes: 'Post broadnose sevengill shark interaction; assess escape likelihood.',
      },
    },
    {
      label: 'PEN-CHL-001-P02 storm aftermath',
      values: {
        pen_id: 'PEN-CHL-001-P02',
        signals: [
          { source: 'acoustic_tag', delta: -0.006, direction: 'down', note: 'Small acoustic tag dip post-storm.' },
          { source: 'sonar', delta: -0.012, direction: 'down', note: 'Sonar reading down 1.2%.' },
          { source: 'net_tension', delta: 0.18, direction: 'up', note: 'Net tension spike during storm, now elevated.' },
        ],
        notes: 'Aysen storm 12h ago, mooring inspected.',
      },
    },
    {
      label: 'PEN-SCO-002-P04 sea lice + handling',
      values: {
        pen_id: 'PEN-SCO-002-P04',
        signals: [
          { source: 'acoustic_tag', delta: -0.003, direction: 'flat', note: 'Within baseline.' },
          { source: 'sonar', delta: -0.004, direction: 'flat', note: 'No significant delta.' },
          { source: 'net_tension', delta: 0.05, direction: 'up', note: 'Tension uptick during thermolicer prep.' },
        ],
        notes: 'Thermolicer prep - want clean baseline before run.',
      },
    },
    {
      label: 'PEN-CAN-001-P01 Fundy strong current',
      values: {
        pen_id: 'PEN-CAN-001-P01',
        signals: [
          { source: 'net_tension', delta: 0.62, direction: 'up', note: 'Net tension peak during 4 kt tide.' },
          { source: 'sonar', delta: -0.008, direction: 'flat', note: 'Sonar steady.' },
          { source: 'acoustic_tag', delta: 0.002, direction: 'flat', note: 'No loss detected.' },
        ],
        notes: 'Bay of Fundy peak tidal current; routine integrity check.',
      },
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

// ─────────────────────────────────────────────────────────────────────────────
// Apply pass 7 — backlog AI endpoints
// ─────────────────────────────────────────────────────────────────────────────

// 17. fish-health-diagnostic — symptoms + image refs + water quality
router.post('/fish-health-diagnostic', async (req, res) => {
  try {
    const { pen_id, symptoms, image_refs, notes } = req.body || {};
    if (!symptoms && !pen_id) {
      return res.status(400).json({ error: 'symptoms or pen_id is required' });
    }
    const ctx = { pen_id: pen_id || null, symptoms: symptoms || '', image_refs: Array.isArray(image_refs) ? image_refs : [], notes: notes || '' };
    if (pen_id) {
      const [pen, group, water, mort, lice, trt] = await Promise.all([
        pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]),
        pool.query('SELECT * FROM fish_groups WHERE pen_id = $1 ORDER BY id DESC LIMIT 1', [pen_id]),
        pool.query('SELECT * FROM water_quality WHERE pen_id = $1 ORDER BY ts DESC LIMIT 10', [pen_id]),
        pool.query('SELECT * FROM mortality_logs WHERE pen_id = $1 ORDER BY ts DESC LIMIT 10', [pen_id]),
        pool.query('SELECT * FROM sea_lice_counts WHERE pen_id = $1 ORDER BY sampled_at DESC LIMIT 5', [pen_id]),
        pool.query('SELECT * FROM treatments WHERE pen_id = $1 ORDER BY applied_at DESC LIMIT 5', [pen_id]),
      ]);
      ctx.pen = pen.rows[0] || null;
      ctx.latest_group = group.rows[0] || null;
      ctx.recent_water_quality = water.rows;
      ctx.recent_mortality = mort.rows;
      ctx.recent_sea_lice = lice.rows;
      ctx.recent_treatments = trt.rows;
    }
    const result = await ai.fishHealthDiagnostic(ctx);
    await record('fish-health-diagnostic', { pen_id, symptoms, image_refs, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 18. biomass-forecast — N-week per-pen projection
router.post('/biomass-forecast', async (req, res) => {
  try {
    const { pen_id, horizon_weeks, notes } = req.body || {};
    if (!pen_id) return res.status(400).json({ error: 'pen_id is required' });
    const horizon = Math.min(Math.max(parseInt(horizon_weeks, 10) || 8, 1), 52);
    const [pen, group, biomass, water] = await Promise.all([
      pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]),
      pool.query('SELECT * FROM fish_groups WHERE pen_id = $1 ORDER BY id DESC LIMIT 1', [pen_id]),
      pool.query('SELECT * FROM biomass_estimates WHERE pen_id = $1 ORDER BY estimated_at DESC LIMIT 12', [pen_id]),
      pool.query('SELECT * FROM water_quality WHERE pen_id = $1 ORDER BY ts DESC LIMIT 30', [pen_id]),
    ]);
    const ctx = {
      pen_id,
      horizon_weeks: horizon,
      pen: pen.rows[0] || null,
      latest_group: group.rows[0] || null,
      historical_biomass: biomass.rows,
      recent_water_quality: water.rows,
      notes: notes || '',
    };
    const result = await ai.biomassForecast(ctx);
    await record('biomass-forecast', { pen_id, horizon_weeks: horizon, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 19. harvest-timing — per-pen optimal harvest date
router.post('/harvest-timing', async (req, res) => {
  try {
    const { pen_id, target_avg_weight_g, market_notes, notes } = req.body || {};
    if (!pen_id) return res.status(400).json({ error: 'pen_id is required' });
    const [pen, group, biomass] = await Promise.all([
      pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]),
      pool.query('SELECT * FROM fish_groups WHERE pen_id = $1 ORDER BY id DESC LIMIT 1', [pen_id]),
      pool.query('SELECT * FROM biomass_estimates WHERE pen_id = $1 ORDER BY estimated_at DESC LIMIT 6', [pen_id]),
    ]);
    const ctx = {
      pen_id,
      target_avg_weight_g: target_avg_weight_g || null,
      pen: pen.rows[0] || null,
      latest_group: group.rows[0] || null,
      recent_biomass: biomass.rows,
      market_notes: market_notes || '',
      notes: notes || '',
    };
    const result = await ai.harvestTiming(ctx);
    await record('harvest-timing', { pen_id, target_avg_weight_g, market_notes, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 20. mortality-predict — forward 7/14/30 day mortality forecast
router.post('/mortality-predict', async (req, res) => {
  try {
    const { pen_id, notes } = req.body || {};
    let pens = [];
    if (pen_id) {
      const r = await pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]);
      pens = r.rows;
    } else {
      const r = await pool.query("SELECT * FROM net_pens WHERE status IN ('stocked','harvest_ready') ORDER BY id ASC LIMIT 20");
      pens = r.rows;
    }
    const penIds = pens.map((p) => p.pen_id).filter(Boolean);
    let mort = { rows: [] };
    let water = { rows: [] };
    let lice = { rows: [] };
    if (penIds.length > 0) {
      [mort, water, lice] = await Promise.all([
        pool.query('SELECT * FROM mortality_logs WHERE pen_id = ANY($1) ORDER BY ts DESC LIMIT 100', [penIds]),
        pool.query('SELECT * FROM water_quality WHERE pen_id = ANY($1) ORDER BY ts DESC LIMIT 80', [penIds]),
        pool.query('SELECT * FROM sea_lice_counts WHERE pen_id = ANY($1) ORDER BY sampled_at DESC LIMIT 40', [penIds]),
      ]);
    }
    const ctx = {
      pens,
      recent_mortality: mort.rows,
      recent_water_quality: water.rows,
      recent_sea_lice: lice.rows,
      notes: notes || '',
    };
    const result = await ai.mortalityPredict(ctx);
    await record('mortality-predict', { pen_id, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 21. sustainability-score — ASC/BAP composite across farms
router.post('/sustainability-score', async (req, res) => {
  try {
    const { farm_id, notes } = req.body || {};
    let farms = [];
    if (farm_id) {
      const r = await pool.query('SELECT * FROM farms WHERE farm_id = $1', [farm_id]);
      farms = r.rows;
    } else {
      const r = await pool.query('SELECT * FROM farms ORDER BY id ASC');
      farms = r.rows;
    }
    const farmIds = farms.map((f) => f.farm_id).filter(Boolean);
    let impacts = { rows: [] };
    let certs = { rows: [] };
    let mort = { rows: [] };
    let trt = { rows: [] };
    if (farmIds.length > 0) {
      [impacts, certs, mort, trt] = await Promise.all([
        pool.query('SELECT * FROM environmental_impacts WHERE farm_id = ANY($1) ORDER BY opened_at DESC LIMIT 30', [farmIds]),
        pool.query('SELECT * FROM certifications WHERE farm_id = ANY($1) ORDER BY expires_at ASC LIMIT 30', [farmIds]),
        pool.query('SELECT * FROM mortality_logs ORDER BY ts DESC LIMIT 40'),
        pool.query('SELECT * FROM treatments ORDER BY applied_at DESC LIMIT 30'),
      ]);
    }
    const ctx = {
      scope: farm_id ? farm_id : 'all_farms',
      farms,
      recent_environmental_impacts: impacts.rows,
      certifications: certs.rows,
      recent_mortality: mort.rows,
      recent_treatments: trt.rows,
      notes: notes || '',
    };
    const result = await ai.sustainabilityScore(ctx);
    await record('sustainability-score', { farm_id, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 22. pen-camera-analyze — image-frame proxy CV (text-based) for pen camera
router.post('/pen-camera-analyze', async (req, res) => {
  try {
    const { pen_id, frame_refs, frame_description, notes } = req.body || {};
    if (!pen_id && !frame_description && (!Array.isArray(frame_refs) || frame_refs.length === 0)) {
      return res.status(400).json({ error: 'pen_id, frame_refs or frame_description is required' });
    }
    const ctx = {
      pen_id: pen_id || null,
      frame_refs: Array.isArray(frame_refs) ? frame_refs : [],
      frame_description: frame_description || '',
      notes: notes || '',
    };
    if (pen_id) {
      const [pen, group, lice] = await Promise.all([
        pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]),
        pool.query('SELECT * FROM fish_groups WHERE pen_id = $1 ORDER BY id DESC LIMIT 1', [pen_id]),
        pool.query('SELECT * FROM sea_lice_counts WHERE pen_id = $1 ORDER BY sampled_at DESC LIMIT 3', [pen_id]),
      ]);
      ctx.pen = pen.rows[0] || null;
      ctx.latest_group = group.rows[0] || null;
      ctx.recent_sea_lice = lice.rows;
    }
    const result = await ai.penCameraAnalyze(ctx);
    await record('pen-camera-analyze', { pen_id, frame_refs, frame_description, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 23. escape-detect — fuse acoustic/sonar/net-tension signals
router.post('/escape-detect', async (req, res) => {
  try {
    const { pen_id, signals, notes } = req.body || {};
    if (!pen_id) return res.status(400).json({ error: 'pen_id is required' });
    const [pen, group, biomass] = await Promise.all([
      pool.query('SELECT * FROM net_pens WHERE pen_id = $1', [pen_id]),
      pool.query('SELECT * FROM fish_groups WHERE pen_id = $1 ORDER BY id DESC LIMIT 1', [pen_id]),
      pool.query('SELECT * FROM biomass_estimates WHERE pen_id = $1 ORDER BY estimated_at DESC LIMIT 3', [pen_id]),
    ]);
    const ctx = {
      pen_id,
      signals: Array.isArray(signals) ? signals : [],
      pen: pen.rows[0] || null,
      latest_group: group.rows[0] || null,
      recent_biomass: biomass.rows,
      notes: notes || '',
    };
    const result = await ai.escapeDetect(ctx);
    await record('escape-detect', { pen_id, signals, notes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// NEEDS-CREDS: regulator live feeds (SEPA, Mattilsynet, SERNAPESCA, EPA Tasmania)
// 503 stubs — no live integration without credentials.
// ─────────────────────────────────────────────────────────────────────────────
const REGULATOR_FEEDS = ['sepa', 'mattilsynet', 'sernapesca', 'epa-tasmania'];
REGULATOR_FEEDS.forEach((slug) => {
  router.get(`/regulator-feed/${slug}`, (req, res) => {
    res.status(503).json({
      error: 'live regulator feed not configured',
      regulator: slug,
      hint: `Set ${slug.toUpperCase().replace(/-/g, '_')}_API_KEY in .env to enable live ingest.`,
      status: 'stub',
    });
  });
});

router.post('/stocking-density-risk', async (req, res) => {
  try {
    const body = req.body || {};
    const penId = body.pen_id || 'unspecified-pen';
    const biomassKg = Number(body.biomass_kg || body.biomassKg || 0);
    const volumeM3 = Number(body.pen_volume_m3 || body.volume_m3 || 1);
    const tempC = Number(body.water_temp_c || 12);
    const doMgL = Number(body.dissolved_oxygen_mg_l || 7);
    const density = biomassKg / Math.max(volumeM3, 1);
    let score = Math.round(density * 4 + Math.max(0, tempC - 14) * 5 + Math.max(0, 7 - doMgL) * 12);
    score = Math.max(0, Math.min(100, score));
    const riskBand = score >= 70 ? 'critical' : score >= 45 ? 'elevated' : 'managed';
    const actions = [
      density > 22 ? 'Reduce feed ramp and prepare split or harvest option.' : 'Maintain current stocking plan with weekly biomass checks.',
      doMgL < 6.5 ? 'Move aeration and oxygen contingency checks to daily cadence.' : 'Keep dissolved oxygen surveillance on standard cadence.',
      tempC > 15 ? 'Review thermal stress threshold before any grading or treatment activity.' : 'No thermal restriction triggered.',
    ];
    const result = {
      pen_id: penId,
      density_kg_m3: Number(density.toFixed(2)),
      risk_score: score,
      risk_band: riskBand,
      actions,
      generated_at: new Date().toISOString(),
    };
    await record('stocking-density-risk', body, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
