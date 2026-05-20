// AI helper service for AIAquacultureFishFarm
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');
const path = require('path');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior aquaculture / fish-farming operations analyst supporting a net-pen ' +
  'salmon and finfish farm operations hub. You provide rigorous, husbandry-grade reasoning ' +
  'on biomass, feed conversion, fish health (sea lice, mortality), water quality, harvest ' +
  'scheduling, vessel and diver operations, certifications (ASC/BAP/GlobalG.A.P.), ' +
  'environmental risk and market pricing. Always return strict JSON in the exact schema ' +
  'requested. Treat every input as an operational planning exercise; never recommend ' +
  'actions that would breach animal-welfare or environmental regulations.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3094',
        'X-Title': 'AI Aquaculture Fish Farm',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ──────────────────────────────────────────────────────────────
// AI Feature 1: Biomass Vision Estimate
// ──────────────────────────────────────────────────────────────
async function biomassVisionEstimate(penContext = {}) {
  const sys = `${SYSTEM_PROMPT} Estimate biomass from net-pen stereo-camera / sonar observations. Return strict JSON:
{
  "pen_id": string,
  "estimated_total_kg": number,
  "estimated_fish_count": number,
  "estimated_avg_weight_g": number,
  "weight_distribution": [{ "bucket_g": string, "fraction": number }],
  "method": "stereo_vision"|"sonar"|"hybrid",
  "confidence": number,
  "outliers_flagged": [string],
  "harvest_readiness": "not_ready"|"approaching"|"ready"|"overdue",
  "summary": string
}`;
  const usr = `Pen observation context:\n${JSON.stringify(penContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', weight_distribution: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 2: Sea Lice Counts Classify
// ──────────────────────────────────────────────────────────────
async function seaLiceCountsClassify(counts = []) {
  const sys = `${SYSTEM_PROMPT} Classify sea lice counts across pens and recommend action. Return strict JSON:
{
  "pen_assessments": [{
    "pen_id": string,
    "lice_per_fish": number,
    "stage": "chalimus"|"pre_adult"|"adult_female"|"mixed",
    "trend": "rising"|"stable"|"falling",
    "regulatory_threshold_exceeded": boolean,
    "risk_level": "low"|"medium"|"high"|"critical",
    "recommended_action": string
  }],
  "farm_level_risk": "low"|"medium"|"high"|"critical",
  "treatment_window_open": boolean,
  "non_chemical_options": [string],
  "summary": string
}`;
  const usr = `Recent sea lice counts:\n${JSON.stringify(counts, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', pen_assessments: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 3: Feed Conversion Optimize
// ──────────────────────────────────────────────────────────────
async function feedConversionOptimize(feedingContext = {}) {
  const sys = `${SYSTEM_PROMPT} Optimize feed conversion ratio (FCR) across pens. Return strict JSON:
{
  "current_fcr_estimate": number,
  "target_fcr": number,
  "pen_recommendations": [{
    "pen_id": string,
    "current_ration_kg_per_day": number,
    "recommended_ration_kg_per_day": number,
    "feed_type": string,
    "feeding_window": string,
    "rationale": string
  }],
  "feed_waste_reduction_pct": number,
  "expected_growth_gain_g_per_day": number,
  "cost_savings_estimate_usd": number,
  "summary": string
}`;
  const usr = `Feeding context:\n${JSON.stringify(feedingContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', pen_recommendations: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 4: Mortality Anomaly Detect
// ──────────────────────────────────────────────────────────────
async function mortalityAnomalyDetect(mortalityLogs = []) {
  const sys = `${SYSTEM_PROMPT} Detect mortality anomalies across pens. Return strict JSON:
{
  "anomalies": [{
    "pen_id": string,
    "window": string,
    "baseline_daily_count": number,
    "observed_daily_count": number,
    "z_score": number,
    "suspected_cause": string,
    "severity": "low"|"medium"|"high"|"critical"
  }],
  "farm_baseline_mortality_pct": number,
  "recommended_investigations": [string],
  "regulatory_reporting_required": boolean,
  "summary": string
}`;
  const usr = `Mortality logs:\n${JSON.stringify(mortalityLogs, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', anomalies: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 5: Treatment Recommend
// ──────────────────────────────────────────────────────────────
async function treatmentRecommend(issue, penContext = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend a fish-health treatment plan. Return strict JSON:
{
  "issue": string,
  "primary_recommendation": {
    "product": string,
    "type": "bath"|"in_feed"|"mechanical"|"biological"|"vaccine",
    "dosage": string,
    "duration": string,
    "withdrawal_days": number,
    "expected_efficacy_pct": number
  },
  "alternatives": [{ "product": string, "trade_off": string }],
  "contraindications": [string],
  "monitoring_plan": [string],
  "environmental_precautions": [string],
  "summary": string
}`;
  const usr = `Issue: ${issue}\nPen context:\n${JSON.stringify(penContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', alternatives: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 6: Executive Brief
// ──────────────────────────────────────────────────────────────
async function executiveBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a farm-manager executive brief. Return strict JSON:
{
  "headline": string,
  "operational_picture": string,
  "biomass_outlook": { "total_biomass_tonnes": number, "harvest_ready_pens": number, "narrative": string },
  "fish_health_status": { "sea_lice_risk": "low"|"medium"|"high", "mortality_status": "normal"|"elevated"|"critical", "narrative": string },
  "active_operations_summary": [{ "operation": string, "status": string, "notes": string }],
  "top_risks": [{ "risk": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_7d_outlook": string,
  "summary": string
}`;
  const usr = `Operational snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 7: Harvest Schedule
// ──────────────────────────────────────────────────────────────
async function harvestSchedule(pens = [], constraints = {}) {
  const sys = `${SYSTEM_PROMPT} Build a harvest schedule across pens. Return strict JSON:
{
  "schedule": [{
    "pen_id": string,
    "harvest_date": string,
    "estimated_tonnes": number,
    "vessel_assigned": string,
    "processor": string,
    "rationale": string
  }],
  "total_tonnes_in_window": number,
  "processor_capacity_utilization_pct": number,
  "vessel_conflicts": [string],
  "market_timing_notes": string,
  "summary": string
}`;
  const usr = `Pens ready for harvest:\n${JSON.stringify(pens, null, 2)}\n\nConstraints:\n${JSON.stringify(constraints, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', schedule: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 8: Water Quality Anomaly
// ──────────────────────────────────────────────────────────────
async function waterQualityAnomaly(readings = []) {
  const sys = `${SYSTEM_PROMPT} Detect water-quality anomalies (DO, temp, salinity, turbidity, algae). Return strict JSON:
{
  "anomalies": [{
    "pen_id": string,
    "parameter": string,
    "current_value": number,
    "units": string,
    "safe_range": string,
    "severity": "low"|"medium"|"high"|"critical",
    "fish_welfare_impact": string,
    "recommended_action": string
  }],
  "algae_bloom_risk": "low"|"medium"|"high",
  "hypoxia_risk": "low"|"medium"|"high",
  "summary": string
}`;
  const usr = `Water quality readings:\n${JSON.stringify(readings, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', anomalies: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 9: Predator Deterrent Plan
// ──────────────────────────────────────────────────────────────
async function predatorDeterrentPlan(incident, farmContext = {}) {
  const sys = `${SYSTEM_PROMPT} Build a non-lethal predator deterrent plan (seals, sea lions, birds, sharks). Return strict JSON:
{
  "predator": string,
  "threat_assessment": "low"|"medium"|"high"|"critical",
  "deterrent_layers": [{
    "layer": string,
    "method": string,
    "expected_efficacy_pct": number,
    "estimated_cost_usd": number,
    "lead_time_days": number
  }],
  "infrastructure_upgrades": [string],
  "regulatory_considerations": [string],
  "summary": string
}`;
  const usr = `Incident: ${issueToString(incident)}\nFarm context:\n${JSON.stringify(farmContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', deterrent_layers: [] });
}

function issueToString(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch (_) { return String(v); }
}

// ──────────────────────────────────────────────────────────────
// AI Feature 10: Environmental Risk Brief
// ──────────────────────────────────────────────────────────────
async function environmentalRiskBrief(farm, impacts = []) {
  const sys = `${SYSTEM_PROMPT} Build an environmental risk brief for a farm site. Return strict JSON:
{
  "farm": string,
  "overall_risk": "low"|"medium"|"high"|"critical",
  "risk_matrix": [{
    "risk": string,
    "category": "benthic"|"chemical"|"escape"|"disease"|"genetic"|"oceanographic",
    "likelihood": "low"|"medium"|"high",
    "impact": "low"|"medium"|"high"|"critical",
    "score": number
  }],
  "mitigations": [{ "risk": string, "mitigation": string, "cost_estimate_usd": number, "lead_time_days": number }],
  "compliance_status": { "EIA_current": boolean, "benthic_survey_due": string, "discharge_within_limits": boolean },
  "summary": string
}`;
  const usr = `Farm: ${issueToString(farm)}\nRecent impacts:\n${JSON.stringify(impacts, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', risk_matrix: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 11: Vessel Shift Schedule
// ──────────────────────────────────────────────────────────────
async function vesselShiftSchedule(vessels = [], tasks = []) {
  const sys = `${SYSTEM_PROMPT} Build a 7-day vessel shift schedule for net cleaning, feed delivery, harvest, treatment and inspection runs. Return strict JSON:
{
  "shifts": [{
    "vessel_id": string,
    "vessel_name": string,
    "shift_window": string,
    "tasks": [string],
    "crew_count": number,
    "fuel_burn_liters": number
  }],
  "unassigned_tasks": [string],
  "fuel_total_liters": number,
  "vessel_utilization_pct": number,
  "summary": string
}`;
  const usr = `Vessels:\n${JSON.stringify(vessels, null, 2)}\n\nTasks:\n${JSON.stringify(tasks, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', shifts: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 12: Diver Safety Brief
// ──────────────────────────────────────────────────────────────
async function diverSafetyBrief(diveContext = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a pre-dive safety brief for net inspection / mortality removal / mooring check dives. Return strict JSON:
{
  "dive_objective": string,
  "max_depth_m": number,
  "bottom_time_minutes": number,
  "decompression_required": boolean,
  "current_conditions": { "visibility_m": number, "current_kt": number, "temp_c": number, "weather": string },
  "risk_level": "low"|"medium"|"high"|"critical",
  "required_personnel": [{ "role": string, "count": number, "min_cert": string }],
  "equipment_checklist": [string],
  "emergency_plan": string,
  "abort_criteria": [string],
  "summary": string
}`;
  const usr = `Dive context:\n${JSON.stringify(diveContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', equipment_checklist: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 13: Customer Quality Report
// ──────────────────────────────────────────────────────────────
async function customerQualityReport(customer, harvests = []) {
  const sys = `${SYSTEM_PROMPT} Generate a customer-facing quality / batch report. Return strict JSON:
{
  "customer": string,
  "reporting_period": string,
  "batches": [{
    "harvest_id": string,
    "tons_delivered": number,
    "avg_weight_g": number,
    "fat_content_pct": number,
    "color_score": number,
    "rejection_rate_pct": number
  }],
  "quality_summary": string,
  "complaints_open": number,
  "corrective_actions": [string],
  "summary": string
}`;
  const usr = `Customer: ${issueToString(customer)}\nHarvests:\n${JSON.stringify(harvests, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', batches: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 14: Certification Readiness
// ──────────────────────────────────────────────────────────────
async function certificationReadiness(certifications = [], farmContext = {}) {
  const sys = `${SYSTEM_PROMPT} Score readiness for ASC / BAP / GlobalG.A.P. / RSPCA Assured certification audits. Return strict JSON:
{
  "overall_readiness_pct": number,
  "by_standard": [{
    "standard": string,
    "expires_at": string,
    "readiness_pct": number,
    "open_findings": number,
    "critical_gaps": [string],
    "next_audit_window": string
  }],
  "priority_actions": [{ "action": string, "owner": string, "due": string, "impact": "low"|"medium"|"high" }],
  "summary": string
}`;
  const usr = `Certifications:\n${JSON.stringify(certifications, null, 2)}\n\nFarm context:\n${JSON.stringify(farmContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', by_standard: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 15: Vendor Quality Score
// ──────────────────────────────────────────────────────────────
async function vendorQualityScore(vendors = []) {
  const sys = `${SYSTEM_PROMPT} Score feed / equipment / smolt / processing vendors on quality, reliability and risk. Return strict JSON:
{
  "scored": [{
    "vendor_id": string,
    "name": string,
    "service": string,
    "composite_score": number,
    "quality_score": number,
    "on_time_pct": number,
    "risk_flags": [string],
    "recommendation": "preferred"|"approved"|"watch"|"phase_out"
  }],
  "supply_concentration_risk": "low"|"medium"|"high",
  "summary": string
}`;
  const usr = `Vendors:\n${JSON.stringify(vendors, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', scored: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Feature 16: Market Price Forecast
// ──────────────────────────────────────────────────────────────
async function marketPriceForecast(species, horizonWeeks = 12, context = {}) {
  const sys = `${SYSTEM_PROMPT} Forecast wholesale price per kg for a species over the requested horizon. Return strict JSON:
{
  "species": string,
  "horizon_weeks": number,
  "forecast": [{ "week_start": string, "price_per_kg_usd": number, "confidence": number }],
  "drivers": [{ "driver": string, "direction": "up"|"down"|"neutral", "magnitude": "low"|"medium"|"high" }],
  "recommended_harvest_window": string,
  "hedging_options": [string],
  "summary": string
}`;
  const usr = `Species: ${species}\nHorizon weeks: ${horizonWeeks}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', forecast: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  biomassVisionEstimate,
  seaLiceCountsClassify,
  feedConversionOptimize,
  mortalityAnomalyDetect,
  treatmentRecommend,
  executiveBrief,
  harvestSchedule,
  waterQualityAnomaly,
  predatorDeterrentPlan,
  environmentalRiskBrief,
  vesselShiftSchedule,
  diverSafetyBrief,
  customerQualityReport,
  certificationReadiness,
  vendorQualityScore,
  marketPriceForecast,
};
