const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'aquaculture_farm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS farms                 CASCADE;
      DROP TABLE IF EXISTS net_pens              CASCADE;
      DROP TABLE IF EXISTS fish_groups           CASCADE;
      DROP TABLE IF EXISTS feed_inventory        CASCADE;
      DROP TABLE IF EXISTS treatments            CASCADE;
      DROP TABLE IF EXISTS mortality_logs        CASCADE;
      DROP TABLE IF EXISTS water_quality         CASCADE;
      DROP TABLE IF EXISTS biomass_estimates     CASCADE;
      DROP TABLE IF EXISTS sea_lice_counts       CASCADE;
      DROP TABLE IF EXISTS ai_results            CASCADE;

      DROP TABLE IF EXISTS users                 CASCADE;
      DROP TABLE IF EXISTS notifications         CASCADE;
      DROP TABLE IF EXISTS attachments           CASCADE;
      DROP TABLE IF EXISTS webhooks              CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries    CASCADE;

      DROP TABLE IF EXISTS vessels               CASCADE;
      DROP TABLE IF EXISTS divers                CASCADE;
      DROP TABLE IF EXISTS harvests              CASCADE;
      DROP TABLE IF EXISTS customers             CASCADE;
      DROP TABLE IF EXISTS certifications        CASCADE;
      DROP TABLE IF EXISTS predator_incidents    CASCADE;
      DROP TABLE IF EXISTS environmental_impacts CASCADE;
      DROP TABLE IF EXISTS vendors               CASCADE;
      DROP TABLE IF EXISTS audit_log             CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema1 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema1);
    const schema2 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_schema.sql'), 'utf8');
    await client.query(schema2);

    console.log('[seed] inserting farms...');
    const farms = [
      ['FRM-NOR-001', 'Hardangerfjord North',    'Hardangerfjord, NO',           12, 'Atlantic Salmon',   'active'],
      ['FRM-NOR-002', 'Bomlafjord South',         'Bomlafjord, NO',               10, 'Atlantic Salmon',   'active'],
      ['FRM-NOR-003', 'Trondheimsfjord East',     'Trondheimsfjord, NO',           8, 'Atlantic Salmon',   'fallow'],
      ['FRM-SCO-001', 'Loch Linnhe',              'Loch Linnhe, Scotland',         9, 'Atlantic Salmon',   'active'],
      ['FRM-SCO-002', 'Shetland Voe West',        'Shetland, Scotland',           11, 'Atlantic Salmon',   'active'],
      ['FRM-CHL-001', 'Aysen Region Site 1',      'Aysen, Chile',                 14, 'Atlantic Salmon',   'active'],
      ['FRM-CHL-002', 'Los Lagos Site 4',         'Los Lagos, Chile',             16, 'Coho Salmon',       'active'],
      ['FRM-CAN-001', 'Bay of Fundy West',        'Bay of Fundy, NB Canada',       7, 'Atlantic Salmon',   'active'],
      ['FRM-CAN-002', 'Vancouver Island North',   'Vancouver Island, BC Canada',   8, 'Chinook Salmon',    'maintenance'],
      ['FRM-AUS-001', 'Tasmania Macquarie',       'Macquarie Harbour, Tasmania',  10, 'Atlantic Salmon',   'active'],
      ['FRM-FAR-001', 'Faroese Sundalagid',       'Sundalagid, Faroe Islands',     6, 'Atlantic Salmon',   'active'],
      ['FRM-ICE-001', 'Icelandic Westfjords',     'Westfjords, Iceland',           5, 'Atlantic Salmon',   'active'],
      ['FRM-JPN-001', 'Yatsushiro Sea',           'Yatsushiro, Japan',             8, 'Yellowtail',        'active'],
      ['FRM-GRE-001', 'Argolic Gulf',             'Argolic Gulf, Greece',         10, 'European Sea Bass', 'active'],
      ['FRM-TUR-001', 'Aegean Cesme',             'Cesme, Turkiye',               12, 'Gilthead Sea Bream','active'],
    ];
    for (const f of farms) {
      await client.query(
        `INSERT INTO farms (farm_id,name,location,pen_count,species,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        f
      );
    }

    console.log('[seed] inserting net_pens...');
    const pens = [
      ['PEN-NOR-001-P01', 'FRM-NOR-001', 50000, 35, 185000, 'stocked'],
      ['PEN-NOR-001-P02', 'FRM-NOR-001', 50000, 35, 178000, 'stocked'],
      ['PEN-NOR-002-P03', 'FRM-NOR-002', 48000, 30, 162000, 'stocked'],
      ['PEN-SCO-001-P01', 'FRM-SCO-001', 42000, 28, 145000, 'stocked'],
      ['PEN-SCO-002-P04', 'FRM-SCO-002', 46000, 32, 158000, 'stocked'],
      ['PEN-CHL-001-P02', 'FRM-CHL-001', 55000, 30, 198000, 'stocked'],
      ['PEN-CHL-001-P04', 'FRM-CHL-001', 55000, 30,      0, 'fallow'],
      ['PEN-CHL-002-P07', 'FRM-CHL-002', 52000, 28, 175000, 'harvest_ready'],
      ['PEN-CAN-001-P01', 'FRM-CAN-001', 40000, 25, 132000, 'stocked'],
      ['PEN-CAN-002-P03', 'FRM-CAN-002', 38000, 22,  98000, 'maintenance'],
      ['PEN-AUS-001-P05', 'FRM-AUS-001', 60000, 38, 220000, 'stocked'],
      ['PEN-FAR-001-P02', 'FRM-FAR-001', 45000, 32, 150000, 'stocked'],
      ['PEN-ICE-001-P01', 'FRM-ICE-001', 44000, 30, 142000, 'stocked'],
      ['PEN-GRE-001-P03', 'FRM-GRE-001', 30000, 18, 240000, 'stocked'],
      ['PEN-TUR-001-P06', 'FRM-TUR-001', 32000, 20, 265000, 'harvest_ready'],
    ];
    for (const p of pens) {
      await client.query(
        `INSERT INTO net_pens (pen_id,farm_id,volume_m3,depth_m,fish_count,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting fish_groups...');
    const groups = [
      ['FG-NOR-001-S22', 'PEN-NOR-001-P01', 'Atlantic Salmon',     185000, 4200, '2025-04-15'],
      ['FG-NOR-002-S22', 'PEN-NOR-001-P02', 'Atlantic Salmon',     178000, 4500, '2025-03-20'],
      ['FG-NOR-003-S23', 'PEN-NOR-002-P03', 'Atlantic Salmon',     162000, 3800, '2025-05-10'],
      ['FG-SCO-001-A22', 'PEN-SCO-001-P01', 'Atlantic Salmon',     145000, 3600, '2025-06-01'],
      ['FG-SCO-002-A23', 'PEN-SCO-002-P04', 'Atlantic Salmon',     158000, 4100, '2025-04-25'],
      ['FG-CHL-001-S22', 'PEN-CHL-001-P02', 'Atlantic Salmon',     198000, 4400, '2025-04-02'],
      ['FG-CHL-002-S22', 'PEN-CHL-002-P07', 'Coho Salmon',         175000, 4900, '2025-02-15'],
      ['FG-CAN-001-S23', 'PEN-CAN-001-P01', 'Atlantic Salmon',     132000, 3400, '2025-07-08'],
      ['FG-CAN-002-S23', 'PEN-CAN-002-P03', 'Chinook Salmon',       98000, 2900, '2025-08-12'],
      ['FG-AUS-001-S22', 'PEN-AUS-001-P05', 'Atlantic Salmon',     220000, 4700, '2025-03-30'],
      ['FG-FAR-001-S23', 'PEN-FAR-001-P02', 'Atlantic Salmon',     150000, 3900, '2025-05-22'],
      ['FG-ICE-001-S23', 'PEN-ICE-001-P01', 'Atlantic Salmon',     142000, 3700, '2025-06-18'],
      ['FG-GRE-001-B23', 'PEN-GRE-001-P03', 'European Sea Bass',   240000,  420, '2025-09-05'],
      ['FG-TUR-001-B22', 'PEN-TUR-001-P06', 'Gilthead Sea Bream',  265000,  480, '2025-08-28'],
      ['FG-JPN-001-Y23', 'PEN-NOR-001-P01', 'Yellowtail',          120000, 2800, '2025-07-15'],
    ];
    for (const g of groups) {
      await client.query(
        `INSERT INTO fish_groups (group_id,pen_id,species,count,avg_weight_g,stocked_at) VALUES ($1,$2,$3,$4,$5,$6)`,
        g
      );
    }

    console.log('[seed] inserting feed_inventory...');
    const feed = [
      ['INV-FD-0001', 'Skretting Optiline grower 6mm',      180000, 'Hardangerfjord depot',  'BATCH-SK-22841', '2026-09-15'],
      ['INV-FD-0002', 'EWOS Adapt 8mm finisher',            240000, 'Bomlafjord depot',      'BATCH-EW-77120', '2026-10-22'],
      ['INV-FD-0003', 'BioMar Power smolt 3mm',              45000, 'Trondheim hatchery',    'BATCH-BM-55119', '2026-07-30'],
      ['INV-FD-0004', 'Skretting Spirit grower 9mm',        165000, 'Loch Linnhe depot',     'BATCH-SK-22912', '2026-11-08'],
      ['INV-FD-0005', 'Cargill EWOS Boost 12mm harvest',     95000, 'Shetland Voe depot',    'BATCH-CA-91044', '2026-08-19'],
      ['INV-FD-0006', 'BioMar Apex pigment-enriched 9mm',   210000, 'Aysen depot',           'BATCH-BM-55228', '2026-12-04'],
      ['INV-FD-0007', 'Skretting Optiline 6mm low-FCR',     135000, 'Los Lagos depot',       'BATCH-SK-22999', '2026-10-15'],
      ['INV-FD-0008', 'BioMar Larviva start 0.5mm fry',       8200, 'Fundy hatchery',        'BATCH-BM-LR017', '2026-06-12'],
      ['INV-FD-0009', 'EWOS Clear health-promoter 9mm',      78000, 'Vancouver Island depot','BATCH-EW-77228', '2026-09-28'],
      ['INV-FD-0010', 'Skretting Spirit 12mm finisher',     192000, 'Tasmania depot',        'BATCH-SK-23004', '2026-11-21'],
      ['INV-FD-0011', 'BioMar Power 6mm grower',            104000, 'Faroese depot',         'BATCH-BM-55301', '2026-10-09'],
      ['INV-FD-0012', 'BioMar Symbio coldwater 9mm',         88000, 'Iceland depot',         'BATCH-BM-55315', '2026-12-30'],
      ['INV-FD-0013', 'Marubeni yellowtail premium 8mm',     62000, 'Yatsushiro depot',      'BATCH-MR-12044', '2026-09-02'],
      ['INV-FD-0014', 'Aller Aqua bass-bream 4mm',          145000, 'Argolic depot',         'BATCH-AA-66711', '2026-10-17'],
      ['INV-FD-0015', 'Skretting bass-bream 5mm finisher',  158000, 'Cesme depot',           'BATCH-SK-23119', '2026-11-30'],
    ];
    for (const f of feed) {
      await client.query(
        `INSERT INTO feed_inventory (inv_id,type,qty_kg,location,batch,expiry) VALUES ($1,$2,$3,$4,$5,$6)`,
        f
      );
    }

    console.log('[seed] inserting treatments...');
    const treatments = [
      ['TRT-2026-0001', 'PEN-NOR-001-P01', 'Slice (emamectin benzoate) in-feed',  '50 ug/kg biomass x 7 days',     '2026-04-22 06:00+00', 'completed'],
      ['TRT-2026-0002', 'PEN-NOR-001-P02', 'AlphaMax (deltamethrin) bath',        '2 ug/L x 30 min',               '2026-04-28 04:30+00', 'scheduled'],
      ['TRT-2026-0003', 'PEN-NOR-002-P03', 'Freshwater bath in wellboat',         'Salinity 0 ppt x 3 hr',         '2026-05-02 02:00+00', 'completed'],
      ['TRT-2026-0004', 'PEN-SCO-001-P01', 'Salmosan (azamethiphos) bath',        '0.1 mg/L x 60 min',             '2026-05-05 05:00+00', 'in_progress'],
      ['TRT-2026-0005', 'PEN-SCO-002-P04', 'Thermolicer thermal delousing',       '34C x 30 sec exposure',         '2026-05-08 07:00+00', 'scheduled'],
      ['TRT-2026-0006', 'PEN-CHL-001-P02', 'Imvixa (lufenuron) in-feed',          '30 mg/kg biomass x 7 days',     '2026-04-25 06:00+00', 'completed'],
      ['TRT-2026-0007', 'PEN-CHL-002-P07', 'Hydrogen peroxide bath',              '1500 ppm x 20 min',             '2026-05-10 03:00+00', 'scheduled'],
      ['TRT-2026-0008', 'PEN-CAN-001-P01', 'SLICE in-feed prophylactic',          '50 ug/kg biomass x 7 days',     '2026-05-12 06:00+00', 'scheduled'],
      ['TRT-2026-0009', 'PEN-CAN-002-P03', 'Florfenicol antibiotic in-feed',      '10 mg/kg biomass x 10 days',    '2026-04-30 06:00+00', 'completed'],
      ['TRT-2026-0010', 'PEN-AUS-001-P05', 'Hydrolicer mechanical delousing',     'High-pressure flush',           '2026-05-15 05:00+00', 'scheduled'],
      ['TRT-2026-0011', 'PEN-FAR-001-P02', 'AlphaMax bath',                       '2 ug/L x 30 min',               '2026-05-04 04:00+00', 'completed'],
      ['TRT-2026-0012', 'PEN-ICE-001-P01', 'Optilice IPN vaccine boost',          '0.1 mL/fish IP',                '2026-05-20 09:00+00', 'scheduled'],
      ['TRT-2026-0013', 'PEN-GRE-001-P03', 'Praziquantel oral parasite',          '50 mg/kg biomass x 3 days',     '2026-05-06 06:00+00', 'completed'],
      ['TRT-2026-0014', 'PEN-TUR-001-P06', 'Formalin bath gill-fluke',            '170 ppm x 60 min',              '2026-05-18 04:30+00', 'scheduled'],
      ['TRT-2026-0015', 'PEN-NOR-001-P01', 'Cleanerfish lumpfish stock-in',       '6% biomass ratio',              '2026-05-22 08:00+00', 'scheduled'],
    ];
    for (const t of treatments) {
      await client.query(
        `INSERT INTO treatments (treatment_id,pen_id,product,dosage,applied_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        t
      );
    }

    console.log('[seed] inserting mortality_logs...');
    const mortality = [
      ['MOR-2026-0001', 'PEN-NOR-001-P01', 142, 'background_attrition',     '2026-05-14 08:00+00', 'closed'],
      ['MOR-2026-0002', 'PEN-NOR-001-P02', 320, 'gill_health_HSMI_suspect', '2026-05-15 09:00+00', 'investigating'],
      ['MOR-2026-0003', 'PEN-NOR-002-P03',  98, 'background_attrition',     '2026-05-14 10:00+00', 'closed'],
      ['MOR-2026-0004', 'PEN-SCO-001-P01', 215, 'AGD_amoebic_gill_disease', '2026-05-15 11:00+00', 'open'],
      ['MOR-2026-0005', 'PEN-SCO-002-P04', 188, 'jellyfish_bloom_strike',   '2026-05-13 14:00+00', 'closed'],
      ['MOR-2026-0006', 'PEN-CHL-001-P02', 410, 'caligus_lice_secondary',   '2026-05-16 07:00+00', 'open'],
      ['MOR-2026-0007', 'PEN-CHL-002-P07', 156, 'background_attrition',     '2026-05-14 06:30+00', 'closed'],
      ['MOR-2026-0008', 'PEN-CAN-001-P01',  84, 'background_attrition',     '2026-05-14 12:00+00', 'closed'],
      ['MOR-2026-0009', 'PEN-CAN-002-P03', 520, 'BKD_bacterial_kidney',     '2026-05-12 09:00+00', 'investigating'],
      ['MOR-2026-0010', 'PEN-AUS-001-P05', 245, 'POMV_pilchard_orthomyxo',  '2026-05-15 08:30+00', 'open'],
      ['MOR-2026-0011', 'PEN-FAR-001-P02', 112, 'background_attrition',     '2026-05-14 09:30+00', 'closed'],
      ['MOR-2026-0012', 'PEN-ICE-001-P01',  76, 'background_attrition',     '2026-05-14 10:30+00', 'closed'],
      ['MOR-2026-0013', 'PEN-GRE-001-P03', 380, 'photobacterium_pasteurelosis','2026-05-15 13:00+00', 'open'],
      ['MOR-2026-0014', 'PEN-TUR-001-P06', 425, 'vibrio_anguillarum',       '2026-05-16 14:30+00', 'investigating'],
      ['MOR-2026-0015', 'PEN-AUS-001-P05', 198, 'algal_bloom_karenia',      '2026-05-11 16:00+00', 'closed'],
    ];
    for (const m of mortality) {
      await client.query(
        `INSERT INTO mortality_logs (log_id,pen_id,count,cause,ts,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        m
      );
    }

    console.log('[seed] inserting water_quality...');
    const wq = [
      ['WQ-2026-00001', 'PEN-NOR-001-P01', 'dissolved_oxygen', 8.2,  'mg/L',  '2026-05-16 08:00+00'],
      ['WQ-2026-00002', 'PEN-NOR-001-P02', 'temperature',      9.4,  'C',     '2026-05-16 08:00+00'],
      ['WQ-2026-00003', 'PEN-NOR-002-P03', 'salinity',        33.8,  'ppt',   '2026-05-16 08:15+00'],
      ['WQ-2026-00004', 'PEN-SCO-001-P01', 'dissolved_oxygen', 6.4,  'mg/L',  '2026-05-16 09:00+00'],
      ['WQ-2026-00005', 'PEN-SCO-002-P04', 'turbidity',        3.1,  'NTU',   '2026-05-16 09:15+00'],
      ['WQ-2026-00006', 'PEN-CHL-001-P02', 'dissolved_oxygen', 5.8,  'mg/L',  '2026-05-16 10:00+00'],
      ['WQ-2026-00007', 'PEN-CHL-002-P07', 'temperature',     13.2,  'C',     '2026-05-16 10:15+00'],
      ['WQ-2026-00008', 'PEN-CAN-001-P01', 'pH',               7.9,  'pH',    '2026-05-16 11:00+00'],
      ['WQ-2026-00009', 'PEN-CAN-002-P03', 'algae_chl_a',     12.4,  'ug/L',  '2026-05-16 11:15+00'],
      ['WQ-2026-00010', 'PEN-AUS-001-P05', 'dissolved_oxygen', 4.9,  'mg/L',  '2026-05-16 12:00+00'],
      ['WQ-2026-00011', 'PEN-FAR-001-P02', 'temperature',      8.1,  'C',     '2026-05-16 12:15+00'],
      ['WQ-2026-00012', 'PEN-ICE-001-P01', 'salinity',        34.2,  'ppt',   '2026-05-16 13:00+00'],
      ['WQ-2026-00013', 'PEN-GRE-001-P03', 'dissolved_oxygen', 7.1,  'mg/L',  '2026-05-16 13:15+00'],
      ['WQ-2026-00014', 'PEN-TUR-001-P06', 'temperature',     19.8,  'C',     '2026-05-16 14:00+00'],
      ['WQ-2026-00015', 'PEN-AUS-001-P05', 'algae_chl_a',     28.6,  'ug/L',  '2026-05-16 14:15+00'],
    ];
    for (const w of wq) {
      await client.query(
        `INSERT INTO water_quality (reading_id,pen_id,parameter,value,units,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        w
      );
    }

    console.log('[seed] inserting biomass_estimates...');
    const biomass = [
      ['BIO-2026-0001', 'PEN-NOR-001-P01',  777000, 4.20, '2026-05-15 09:00+00', 'stereo_vision'],
      ['BIO-2026-0002', 'PEN-NOR-001-P02',  801000, 4.50, '2026-05-15 09:30+00', 'stereo_vision'],
      ['BIO-2026-0003', 'PEN-NOR-002-P03',  615600, 3.80, '2026-05-15 10:00+00', 'sonar'],
      ['BIO-2026-0004', 'PEN-SCO-001-P01',  522000, 3.60, '2026-05-15 10:30+00', 'stereo_vision'],
      ['BIO-2026-0005', 'PEN-SCO-002-P04',  647800, 4.10, '2026-05-15 11:00+00', 'hybrid'],
      ['BIO-2026-0006', 'PEN-CHL-001-P02',  871200, 4.40, '2026-05-15 11:30+00', 'stereo_vision'],
      ['BIO-2026-0007', 'PEN-CHL-002-P07',  857500, 4.90, '2026-05-15 12:00+00', 'stereo_vision'],
      ['BIO-2026-0008', 'PEN-CAN-001-P01',  448800, 3.40, '2026-05-15 12:30+00', 'sonar'],
      ['BIO-2026-0009', 'PEN-CAN-002-P03',  284200, 2.90, '2026-05-15 13:00+00', 'manual_sample'],
      ['BIO-2026-0010', 'PEN-AUS-001-P05', 1034000, 4.70, '2026-05-15 13:30+00', 'stereo_vision'],
      ['BIO-2026-0011', 'PEN-FAR-001-P02',  585000, 3.90, '2026-05-15 14:00+00', 'hybrid'],
      ['BIO-2026-0012', 'PEN-ICE-001-P01',  525400, 3.70, '2026-05-15 14:30+00', 'stereo_vision'],
      ['BIO-2026-0013', 'PEN-GRE-001-P03',  100800, 0.42, '2026-05-15 15:00+00', 'sonar'],
      ['BIO-2026-0014', 'PEN-TUR-001-P06',  127200, 0.48, '2026-05-15 15:30+00', 'stereo_vision'],
      ['BIO-2026-0015', 'PEN-NOR-001-P01',  336000, 2.80, '2026-05-15 16:00+00', 'manual_sample'],
    ];
    for (const b of biomass) {
      await client.query(
        `INSERT INTO biomass_estimates (estimate_id,pen_id,total_kg,avg_kg,estimated_at,method) VALUES ($1,$2,$3,$4,$5,$6)`,
        b
      );
    }

    console.log('[seed] inserting sea_lice_counts...');
    const lice = [
      ['SLC-2026-0001', 'PEN-NOR-001-P01', 0.28, '2026-05-15 07:00+00', 'logged',     'monitor'],
      ['SLC-2026-0002', 'PEN-NOR-001-P02', 0.62, '2026-05-15 07:30+00', 'flagged',    'treat_scheduled'],
      ['SLC-2026-0003', 'PEN-NOR-002-P03', 0.14, '2026-05-15 08:00+00', 'logged',     'monitor'],
      ['SLC-2026-0004', 'PEN-SCO-001-P01', 0.45, '2026-05-15 08:30+00', 'logged',     'monitor'],
      ['SLC-2026-0005', 'PEN-SCO-002-P04', 0.81, '2026-05-15 09:00+00', 'flagged',    'thermolicer_run'],
      ['SLC-2026-0006', 'PEN-CHL-001-P02', 1.12, '2026-05-15 09:30+00', 'breach',     'emergency_treatment'],
      ['SLC-2026-0007', 'PEN-CHL-002-P07', 0.34, '2026-05-15 10:00+00', 'logged',     'monitor'],
      ['SLC-2026-0008', 'PEN-CAN-001-P01', 0.22, '2026-05-15 10:30+00', 'logged',     'monitor'],
      ['SLC-2026-0009', 'PEN-CAN-002-P03', 0.18, '2026-05-15 11:00+00', 'logged',     'monitor'],
      ['SLC-2026-0010', 'PEN-AUS-001-P05', 0.06, '2026-05-15 11:30+00', 'logged',     'monitor'],
      ['SLC-2026-0011', 'PEN-FAR-001-P02', 0.51, '2026-05-15 12:00+00', 'logged',     'monitor'],
      ['SLC-2026-0012', 'PEN-ICE-001-P01', 0.09, '2026-05-15 12:30+00', 'logged',     'monitor'],
      ['SLC-2026-0013', 'PEN-GRE-001-P03', 0.00, '2026-05-15 13:00+00', 'logged',     'na_species'],
      ['SLC-2026-0014', 'PEN-TUR-001-P06', 0.00, '2026-05-15 13:30+00', 'logged',     'na_species'],
      ['SLC-2026-0015', 'PEN-NOR-001-P01', 0.78, '2026-05-15 14:00+00', 'flagged',    'cleanerfish_boost'],
    ];
    for (const l of lice) {
      await client.query(
        `INSERT INTO sea_lice_counts (count_id,pen_id,lice_per_fish,sampled_at,status,action) VALUES ($1,$2,$3,$4,$5,$6)`,
        l
      );
    }

    console.log('[seed] inserting users...');
    const users = [
      ['admin@aquafarm.io',   'admin123',   'Admin',          'admin'],
      ['manager@aquafarm.io', 'manager123', 'Farm Manager',   'manager'],
      ['viewer@aquafarm.io',  'viewer123',  'Viewer',         'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)`,
        u
      );
    }

    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Sea lice breach',  'PEN-CHL-001-P02 sea lice 1.12/fish - emergency treatment', 'critical', 'sea_lice_counts'],
      [1, 'HSMI suspect',     'PEN-NOR-001-P02 elevated mortality, HSMI suspect',          'high',     'mortality_logs'],
      [1, 'Low DO',           'PEN-AUS-001-P05 dissolved oxygen 4.9 mg/L',                 'high',     'water_quality'],
      [2, 'BKD investigation','PEN-CAN-002-P03 BKD investigation open',                    'high',     'mortality_logs'],
      [2, 'Pen harvest ready','PEN-TUR-001-P06 reached harvest weight',                    'medium',   'biomass_estimates'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`,
        n
      );
    }

    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['Farm Ops Notifier',     'https://httpbin.org/post', 'sec_farmops_2026', 'mortality.created,sea_lice.breach', true],
      ['Processor Coordination','https://httpbin.org/post', 'sec_proc_2026',    'harvest.created',                   true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`,
        w
      );
    }

    console.log('[seed] inserting vessels...');
    const vessels = [
      ['VSL-NOR-001', 'Hardanger Wellboat I',      'wellboat',          3500, 'full',      'available'],
      ['VSL-NOR-002', 'Bomla Feed Barge',          'feed_barge',        2200, 'high',      'on_site'],
      ['VSL-NOR-003', 'Trondheim Service Boat',    'service_vessel',     180, 'medium',    'available'],
      ['VSL-SCO-001', 'Linnhe Net Cleaner',        'net_cleaner',         95, 'medium',    'maintenance'],
      ['VSL-SCO-002', 'Shetland Workboat',         'workboat',           150, 'full',      'available'],
      ['VSL-CHL-001', 'Aysen Wellboat II',         'wellboat',          4200, 'full',      'on_assignment'],
      ['VSL-CHL-002', 'Los Lagos Harvest Vessel',  'harvest_vessel',    1800, 'full',      'available'],
      ['VSL-CAN-001', 'Fundy Service Boat',        'service_vessel',     200, 'low',       'available'],
      ['VSL-CAN-002', 'Vancouver Dive Tender',     'dive_tender',        120, 'medium',    'on_assignment'],
      ['VSL-AUS-001', 'Macquarie Thermolicer',     'thermolicer',        850, 'high',      'on_site'],
      ['VSL-FAR-001', 'Sundalagid Feed Barge',     'feed_barge',        1900, 'full',      'available'],
      ['VSL-ICE-001', 'Westfjords Workboat',       'workboat',           160, 'medium',    'available'],
      ['VSL-JPN-001', 'Yatsushiro Harvest Vessel', 'harvest_vessel',    1200, 'high',      'on_assignment'],
      ['VSL-GRE-001', 'Argolic Net Cleaner',       'net_cleaner',         85, 'low',       'maintenance'],
      ['VSL-TUR-001', 'Cesme Wellboat',            'wellboat',          3200, 'full',      'available'],
    ];
    for (const v of vessels) {
      await client.query(
        `INSERT INTO vessels (vessel_id,name,type,capacity,fuel_status,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        v
      );
    }

    console.log('[seed] inserting divers...');
    const divers = [
      ['DVR-001', 'Lars Aune',         'HSE Surface Air, Net Inspection L2',   1240, '2026-05-14', 'active'],
      ['DVR-002', 'Ingrid Solberg',    'HSE Saturation, Mooring Specialist',    980, '2026-05-13', 'active'],
      ['DVR-003', 'Calum MacKay',      'IMCA SCUBA, Net Repair',                 720, '2026-05-12', 'active'],
      ['DVR-004', 'Fiona Mackenzie',   'IMCA Air, Mortality Removal',            650, '2026-05-10', 'on_leave'],
      ['DVR-005', 'Diego Martinez',    'Buzo Mariscador, Hydrolicer Ops',       1480, '2026-05-15', 'active'],
      ['DVR-006', 'Sofia Ramirez',     'Buzo Comercial Class III',               890, '2026-05-14', 'active'],
      ['DVR-007', 'Tom Boudreau',      'DCBC SCUBA, Net Inspection L2',          540, '2026-05-11', 'active'],
      ['DVR-008', 'Sarah Thompson',    'DCBC Surface Air, Mooring',              760, '2026-05-09', 'active'],
      ['DVR-009', 'Brett OHara',       'ADAS Part 1, Net Repair',                920, '2026-05-15', 'active'],
      ['DVR-010', 'Trondur Hansen',    'NDC Air, Cleanerfish handling',          610, '2026-05-13', 'active'],
      ['DVR-011', 'Sigrun Olafsdottir','SUBI SCUBA, Cold-water spec',            480, '2026-05-12', 'active'],
      ['DVR-012', 'Hiroshi Tanaka',    'Japan Class I, Predator deterrent',      730, '2026-05-14', 'active'],
      ['DVR-013', 'Konstantinos Papas','PADI Pro, Net inspection L1',            390, '2026-05-10', 'active'],
      ['DVR-014', 'Aylin Kara',        'CMAS 3-star, Cage maintenance',          420, '2026-05-15', 'training'],
      ['DVR-015', 'Marcus Olsen',      'HSE Saturation, Lead Diver',            2100, '2026-05-15', 'active'],
    ];
    for (const d of divers) {
      await client.query(
        `INSERT INTO divers (diver_id,name,certifications,hours_total,last_dive,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        d
      );
    }

    console.log('[seed] inserting harvests...');
    const harvests = [
      ['HRV-2026-0001', 'PEN-CHL-002-P07', 240.50, '2026-05-20 06:00+00', 'AquaChile Processing Puerto Montt',  'scheduled'],
      ['HRV-2026-0002', 'PEN-TUR-001-P06',  85.20, '2026-05-22 05:00+00', 'Camli Yem Processing Cesme',          'scheduled'],
      ['HRV-2026-0003', 'PEN-NOR-001-P02', 220.00, '2026-05-25 07:00+00', 'Leroy Seafood Hardangerfjord',        'scheduled'],
      ['HRV-2026-0004', 'PEN-AUS-001-P05', 310.40, '2026-04-12 06:00+00', 'Tassal Triabunna',                    'completed'],
      ['HRV-2026-0005', 'PEN-NOR-002-P03', 195.80, '2026-04-18 06:30+00', 'Mowi Eggesbo',                        'completed'],
      ['HRV-2026-0006', 'PEN-SCO-002-P04', 162.30, '2026-04-22 07:00+00', 'Scottish Sea Farms Cairndow',         'completed'],
      ['HRV-2026-0007', 'PEN-FAR-001-P02', 148.10, '2026-04-25 06:00+00', 'Bakkafrost Glyvrar',                  'completed'],
      ['HRV-2026-0008', 'PEN-ICE-001-P01', 124.60, '2026-04-28 06:30+00', 'Arnarlax Bildudalur',                 'completed'],
      ['HRV-2026-0009', 'PEN-CHL-001-P02', 215.40, '2026-05-02 06:00+00', 'Salmones Camanchaca Tome',            'completed'],
      ['HRV-2026-0010', 'PEN-CAN-001-P01', 138.20, '2026-05-05 06:00+00', 'Cooke Aquaculture Blacks Harbour',    'completed'],
      ['HRV-2026-0011', 'PEN-GRE-001-P03', 102.50, '2026-05-08 05:30+00', 'Avramar Sagiada',                     'completed'],
      ['HRV-2026-0012', 'PEN-SCO-001-P01', 130.20, '2026-05-28 07:00+00', 'Mowi Scotland Fort William',          'scheduled'],
      ['HRV-2026-0013', 'PEN-NOR-001-P01', 185.60, '2026-06-02 06:00+00', 'SalMar Froya',                        'scheduled'],
      ['HRV-2026-0014', 'PEN-CAN-002-P03',  72.40, '2026-06-08 06:00+00', 'Grieg Seafood Campbell River',        'scheduled'],
      ['HRV-2026-0015', 'PEN-AUS-001-P05', 285.30, '2026-06-12 06:00+00', 'Huon Aquaculture Parramatta Creek',   'scheduled'],
    ];
    for (const h of harvests) {
      await client.query(
        `INSERT INTO harvests (harvest_id,pen_id,tons,harvested_at,processor,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        h
      );
    }

    console.log('[seed] inserting customers...');
    const customers = [
      ['CUS-0001', 'Costco Wholesale',          'USA',   'CON-CW-2026-01', 'retail_wholesale',   'active'],
      ['CUS-0002', 'Marks and Spencer',         'UK',    'CON-MS-2026-04', 'retail_premium',     'active'],
      ['CUS-0003', 'Carrefour',                 'FR',    'CON-CF-2026-02', 'retail_supermarket', 'active'],
      ['CUS-0004', 'Aeon Group',                'JP',    'CON-AE-2026-09', 'retail_supermarket', 'active'],
      ['CUS-0005', 'Whole Foods Market',        'USA',   'CON-WF-2026-03', 'retail_premium',     'active'],
      ['CUS-0006', 'Sushiro',                   'JP',    'CON-SU-2026-07', 'foodservice_chain',  'active'],
      ['CUS-0007', 'Wegmans',                   'USA',   'CON-WE-2026-11', 'retail_premium',     'active'],
      ['CUS-0008', 'Tesco',                     'UK',    'CON-TS-2026-05', 'retail_supermarket', 'active'],
      ['CUS-0009', 'Edeka',                     'DE',    'CON-ED-2026-06', 'retail_supermarket', 'active'],
      ['CUS-0010', 'Albert Heijn',              'NL',    'CON-AH-2026-08', 'retail_supermarket', 'active'],
      ['CUS-0011', 'Carrasco Distribucion',     'CL',    'CON-CD-2026-12', 'distributor',        'active'],
      ['CUS-0012', 'BIM Turkiye',               'TR',    'CON-BM-2026-13', 'retail_supermarket', 'active'],
      ['CUS-0013', 'Sygnal Foods Korea',        'KR',    'CON-SK-2026-14', 'distributor',        'on_hold'],
      ['CUS-0014', 'Coles Group',               'AU',    'CON-CL-2026-15', 'retail_supermarket', 'active'],
      ['CUS-0015', 'Russian Fish Distributor',  'RU',    'CON-RF-2025-04', 'distributor',        'suspended'],
    ];
    for (const c of customers) {
      await client.query(
        `INSERT INTO customers (customer_id,name,country,contract_id,type,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting certifications...');
    const certs = [
      ['CRT-0001', 'FRM-NOR-001', 'ASC Salmon Standard',          '2024-06-15', '2027-06-14', 'active'],
      ['CRT-0002', 'FRM-NOR-001', 'GlobalG.A.P. Aquaculture',     '2024-09-10', '2026-09-09', 'active'],
      ['CRT-0003', 'FRM-NOR-002', 'ASC Salmon Standard',          '2024-08-22', '2027-08-21', 'active'],
      ['CRT-0004', 'FRM-SCO-001', 'RSPCA Assured',                '2025-01-12', '2026-12-31', 'active'],
      ['CRT-0005', 'FRM-SCO-002', 'ASC Salmon Standard',          '2024-04-04', '2026-06-30', 'expiring'],
      ['CRT-0006', 'FRM-CHL-001', 'BAP 4-Star',                   '2024-11-30', '2027-11-29', 'active'],
      ['CRT-0007', 'FRM-CHL-002', 'ASC Salmon Standard',          '2025-02-18', '2028-02-17', 'active'],
      ['CRT-0008', 'FRM-CAN-001', 'BAP 4-Star',                   '2024-07-09', '2027-07-08', 'active'],
      ['CRT-0009', 'FRM-CAN-002', 'GlobalG.A.P. Aquaculture',     '2025-03-25', '2027-03-24', 'active'],
      ['CRT-0010', 'FRM-AUS-001', 'ASC Salmon Standard',          '2024-05-14', '2026-05-13', 'lapsed'],
      ['CRT-0011', 'FRM-FAR-001', 'GlobalG.A.P. Aquaculture',     '2024-12-01', '2026-11-30', 'active'],
      ['CRT-0012', 'FRM-ICE-001', 'BAP 4-Star',                   '2025-01-30', '2028-01-29', 'active'],
      ['CRT-0013', 'FRM-GRE-001', 'ASC Seabass/Seabream',         '2024-08-05', '2026-12-31', 'active'],
      ['CRT-0014', 'FRM-TUR-001', 'BAP 3-Star',                   '2024-10-18', '2027-10-17', 'active'],
      ['CRT-0015', 'FRM-NOR-001', 'Debio Organic Aquaculture',    '2025-04-02', '2027-04-01', 'active'],
    ];
    for (const c of certs) {
      await client.query(
        `INSERT INTO certifications (cert_id,farm_id,standard,issued_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        c
      );
    }

    console.log('[seed] inserting predator_incidents...');
    const predators = [
      ['PRD-2026-0001', 'PEN-NOR-001-P01', 'Grey seal',                  'medium',   '2026-05-10 22:30+00', 'mitigated'],
      ['PRD-2026-0002', 'PEN-NOR-001-P02', 'Grey seal',                  'high',     '2026-05-12 02:15+00', 'open'],
      ['PRD-2026-0003', 'PEN-SCO-001-P01', 'Common seal',                'medium',   '2026-05-13 04:00+00', 'mitigated'],
      ['PRD-2026-0004', 'PEN-SCO-002-P04', 'Cormorant flock',            'low',      '2026-05-09 06:00+00', 'mitigated'],
      ['PRD-2026-0005', 'PEN-CHL-001-P02', 'South American sea lion',    'high',     '2026-05-11 23:45+00', 'open'],
      ['PRD-2026-0006', 'PEN-CHL-002-P07', 'Marine otter',               'medium',   '2026-05-14 05:30+00', 'investigating'],
      ['PRD-2026-0007', 'PEN-CAN-001-P01', 'Harbor seal',                'medium',   '2026-05-12 21:00+00', 'mitigated'],
      ['PRD-2026-0008', 'PEN-CAN-002-P03', 'Bald eagle',                 'low',      '2026-05-13 09:00+00', 'closed'],
      ['PRD-2026-0009', 'PEN-AUS-001-P05', 'New Zealand fur seal',       'high',     '2026-05-15 03:00+00', 'open'],
      ['PRD-2026-0010', 'PEN-FAR-001-P02', 'Grey seal',                  'medium',   '2026-05-10 04:30+00', 'mitigated'],
      ['PRD-2026-0011', 'PEN-ICE-001-P01', 'Harbour porpoise',           'low',      '2026-05-09 22:00+00', 'closed'],
      ['PRD-2026-0012', 'PEN-AUS-001-P05', 'Broadnose sevengill shark',  'critical', '2026-05-16 01:00+00', 'open'],
      ['PRD-2026-0013', 'PEN-GRE-001-P03', 'Loggerhead turtle',          'low',      '2026-05-11 12:00+00', 'closed'],
      ['PRD-2026-0014', 'PEN-TUR-001-P06', 'Mediterranean monk seal',    'medium',   '2026-05-14 23:00+00', 'investigating'],
      ['PRD-2026-0015', 'PEN-NOR-001-P01', 'Grey seal',                  'high',     '2026-05-15 02:00+00', 'investigating'],
    ];
    for (const p of predators) {
      await client.query(
        `INSERT INTO predator_incidents (incident_id,pen_id,predator,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        p
      );
    }

    console.log('[seed] inserting environmental_impacts...');
    const impacts = [
      ['EIM-2026-0001', 'FRM-NOR-001', 'benthic_enrichment',            'medium',   '2026-04-22 10:00+00', 'mitigating'],
      ['EIM-2026-0002', 'FRM-NOR-002', 'sediment_organic_carbon_high',  'low',      '2026-04-25 11:00+00', 'monitoring'],
      ['EIM-2026-0003', 'FRM-NOR-003', 'fallow_recovery_active',        'low',      '2026-03-15 09:00+00', 'monitoring'],
      ['EIM-2026-0004', 'FRM-SCO-001', 'nitrogen_loading_above_limit',  'high',     '2026-05-02 12:00+00', 'open'],
      ['EIM-2026-0005', 'FRM-SCO-002', 'wrasse_genetic_concern',        'medium',   '2026-04-18 13:30+00', 'investigating'],
      ['EIM-2026-0006', 'FRM-CHL-001', 'algal_bloom_chrysochromulina',  'critical', '2026-05-12 06:00+00', 'open'],
      ['EIM-2026-0007', 'FRM-CHL-002', 'antibiotic_residue_sediment',   'high',     '2026-04-30 09:00+00', 'mitigating'],
      ['EIM-2026-0008', 'FRM-CAN-001', 'lobster_bycatch_concern',       'low',      '2026-05-04 14:00+00', 'monitoring'],
      ['EIM-2026-0009', 'FRM-CAN-002', 'wild_stock_genetic_interaction','high',     '2026-04-28 10:30+00', 'open'],
      ['EIM-2026-0010', 'FRM-AUS-001', 'low_DO_event_macquarie',        'critical', '2026-05-14 03:00+00', 'open'],
      ['EIM-2026-0011', 'FRM-FAR-001', 'benthic_recovery_track',        'low',      '2026-04-20 11:00+00', 'monitoring'],
      ['EIM-2026-0012', 'FRM-ICE-001', 'escape_event_minor',            'medium',   '2026-04-15 22:00+00', 'mitigated'],
      ['EIM-2026-0013', 'FRM-GRE-001', 'posidonia_meadow_proximity',    'medium',   '2026-04-12 09:00+00', 'monitoring'],
      ['EIM-2026-0014', 'FRM-TUR-001', 'discharge_above_phosphorus',    'high',     '2026-05-05 13:00+00', 'mitigating'],
      ['EIM-2026-0015', 'FRM-AUS-001', 'POMV_disease_outbreak',         'high',     '2026-05-10 08:00+00', 'investigating'],
    ];
    for (const i of impacts) {
      await client.query(
        `INSERT INTO environmental_impacts (impact_id,farm_id,type,severity,opened_at,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        i
      );
    }

    console.log('[seed] inserting vendors...');
    const vendors = [
      ['VND-001', 'Skretting',                'Salmon and finfish feed',                'NO', 4.7, 'preferred'],
      ['VND-002', 'BioMar',                   'Salmon and finfish feed',                'DK', 4.6, 'preferred'],
      ['VND-003', 'EWOS (Cargill)',           'Salmon feed and health additives',       'NO', 4.5, 'approved'],
      ['VND-004', 'AKVA Group',               'Net pens, feed barges, sensors',         'NO', 4.4, 'approved'],
      ['VND-005', 'Pharmaq (Zoetis)',         'Aquaculture vaccines',                   'NO', 4.8, 'preferred'],
      ['VND-006', 'Optimar',                  'Harvest and processing equipment',       'NO', 4.3, 'approved'],
      ['VND-007', 'Steinsvik (Scale AQ)',     'Underwater cameras, lice counters',      'NO', 4.5, 'preferred'],
      ['VND-008', 'Egersund Net',             'Nets, predator nets, mooring',           'NO', 4.2, 'approved'],
      ['VND-009', 'Morenot Aquaculture',      'Nets, anti-fouling',                     'NO', 4.0, 'approved'],
      ['VND-010', 'Bakkafrost Smolt AS',      'Smolt supply',                           'FO', 4.4, 'approved'],
      ['VND-011', 'AquaGen',                  'Genetics, ova',                          'NO', 4.6, 'preferred'],
      ['VND-012', 'Benchmark Genetics',       'Salmon genetics',                        'NO', 4.3, 'approved'],
      ['VND-013', 'Sterner AS',               'Water treatment, UV systems',            'NO', 4.1, 'approved'],
      ['VND-014', 'Hydroniq',                 'Cooling, oxygenation',                   'NO', 3.9, 'approved'],
      ['VND-015', 'CageEye',                  'Hydroacoustic monitoring',               'NO', 3.7, 'watch'],
    ];
    for (const v of vendors) {
      await client.query(
        `INSERT INTO vendors (vendor_id,name,service,country,rating,status) VALUES ($1,$2,$3,$4,$5,$6)`,
        v
      );
    }

    console.log('[seed] inserting audit_log...');
    const audit = [
      ['AUD-0001', 'admin@aquafarm.io',   'PEN-NOR-001-P02',           'sea_lice_count.flagged',   'success', '2026-05-15 07:30+00'],
      ['AUD-0002', 'manager@aquafarm.io', 'PEN-SCO-001-P01',           'treatment.scheduled',      'success', '2026-05-05 05:00+00'],
      ['AUD-0003', 'admin@aquafarm.io',   'FRM-AUS-001',               'environmental_impact.open','success', '2026-05-14 03:00+00'],
      ['AUD-0004', 'manager@aquafarm.io', 'PEN-CHL-001-P02',           'sea_lice_count.breach',    'success', '2026-05-15 09:30+00'],
      ['AUD-0005', 'admin@aquafarm.io',   'CRT-0010',                  'certification.lapsed',     'flagged', '2026-05-13 18:00+00'],
      ['AUD-0006', 'manager@aquafarm.io', 'HRV-2026-0001',             'harvest.scheduled',        'success', '2026-05-16 14:00+00'],
      ['AUD-0007', 'admin@aquafarm.io',   'VND-015',                   'vendor.watch',             'flagged', '2026-05-12 11:00+00'],
      ['AUD-0008', 'viewer@aquafarm.io',  'dashboard',                 'page.viewed',              'success', '2026-05-16 09:00+00'],
      ['AUD-0009', 'manager@aquafarm.io', 'PEN-CAN-002-P03',           'mortality.investigating',  'success', '2026-05-12 09:00+00'],
      ['AUD-0010', 'admin@aquafarm.io',   'TRT-2026-0007',             'treatment.scheduled',      'success', '2026-05-10 03:00+00'],
      ['AUD-0011', 'manager@aquafarm.io', 'INV-FD-0002',               'feed_inventory.updated',   'success', '2026-05-14 16:00+00'],
      ['AUD-0012', 'admin@aquafarm.io',   'DVR-015',                   'diver.dive_logged',        'success', '2026-05-15 17:00+00'],
      ['AUD-0013', 'manager@aquafarm.io', 'PEN-AUS-001-P05',           'predator_incident.opened', 'success', '2026-05-16 01:00+00'],
      ['AUD-0014', 'admin@aquafarm.io',   'webhook.farm_ops_notifier', 'webhook.test',             'success', '2026-05-16 10:00+00'],
      ['AUD-0015', 'admin@aquafarm.io',   'CUS-0015',                  'customer.suspended',       'success', '2026-04-10 12:00+00'],
    ];
    for (const a of audit) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result,ts) VALUES ($1,$2,$3,$4,$5,$6)`,
        a
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
