import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/farms',                title: 'Farms',                  icon: 'F', color: '#0ea5e9', desc: 'Sea sites across Norway, Scotland, Chile, Canada, Tasmania and Mediterranean.' },
  { path: '/net-pens',             title: 'Net Pens',               icon: 'N', color: '#06b6d4', desc: 'Individual pen volume, depth, fish count and status.' },
  { path: '/fish-groups',          title: 'Fish Groups',            icon: 'G', color: '#10b981', desc: 'Cohort tracking with species, count and average weight.' },
  { path: '/feed-inventory',       title: 'Feed Inventory',         icon: 'I', color: '#84cc16', desc: 'Feed stock by type, batch and expiry across depots.' },
  { path: '/treatments',           title: 'Treatments',             icon: 'T', color: '#f59e0b', desc: 'Sea-lice and disease treatments with dosage and status.' },
  { path: '/mortality-logs',       title: 'Mortality Logs',         icon: 'M', color: '#ef4444', desc: 'Daily mortality with suspected cause and investigation status.' },
  { path: '/water-quality',        title: 'Water Quality',          icon: 'W', color: '#22d3ee', desc: 'DO, temperature, salinity, turbidity, algae chl-a readings.' },
  { path: '/biomass-estimates',    title: 'Biomass Estimates',      icon: 'B', color: '#a3e635', desc: 'Stereo-vision, sonar and hybrid biomass measurements.' },
  { path: '/sea-lice-counts',      title: 'Sea Lice Counts',        icon: 'L', color: '#fb7185', desc: 'Per-pen lice-per-fish samples with threshold flags.' },
  { path: '/vessels',              title: 'Vessels',                icon: 'V', color: '#3b82f6', desc: 'Wellboats, feed barges, harvest vessels, net cleaners.' },
  { path: '/divers',               title: 'Divers',                 icon: 'D', color: '#8b5cf6', desc: 'Diver roster with certifications, hours and last dive.' },
  { path: '/harvests',             title: 'Harvests',               icon: 'H', color: '#22c55e', desc: 'Scheduled and completed harvests with processor and tonnage.' },
  { path: '/customers',            title: 'Customers',              icon: 'C', color: '#14b8a6', desc: 'Retail, foodservice and distributor customers by country.' },
  { path: '/certifications',       title: 'Certifications',         icon: 'X', color: '#facc15', desc: 'ASC, BAP, GlobalG.A.P., RSPCA Assured, Debio Organic.' },
  { path: '/predator-incidents',   title: 'Predator Incidents',     icon: 'P', color: '#f97316', desc: 'Seal, sea lion, bird, shark interactions and severity.' },
  { path: '/environmental-impacts',title: 'Environmental Impacts',  icon: 'E', color: '#dc2626', desc: 'Benthic, chemical, algal bloom, escape, genetic risks.' },
  { path: '/vendors',              title: 'Vendors',                icon: 'R', color: '#a78bfa', desc: 'Feed, equipment, vaccines, smolt and genetics suppliers.' },
  { path: '/audit-log',            title: 'Audit Log',              icon: 'A', color: '#94a3b8', desc: 'Actor, target, action and result of governance events.' },

  { path: '/ai/biomass-vision-estimate',  title: 'AI - Biomass Vision',       icon: '*', color: '#06b6d4', desc: 'Estimate biomass from stereo-vision / sonar.' },
  { path: '/ai/sea-lice-counts-classify', title: 'AI - Sea Lice Classify',    icon: '*', color: '#fb7185', desc: 'Classify lice counts, flag breaches, recommend action.' },
  { path: '/ai/feed-conversion-optimize', title: 'AI - Feed Conversion',      icon: '*', color: '#84cc16', desc: 'Lower FCR and waste across pens.' },
  { path: '/ai/mortality-anomaly-detect', title: 'AI - Mortality Anomaly',    icon: '*', color: '#ef4444', desc: 'Detect anomalies in daily mortality logs.' },
  { path: '/ai/treatment-recommend',      title: 'AI - Treatment Recommend',  icon: '*', color: '#f59e0b', desc: 'Recommend disease / parasite treatment plans.' },
  { path: '/ai/executive-brief',          title: 'AI - Executive Brief',      icon: '*', color: '#8b5cf6', desc: 'Farm-manager operational snapshot brief.' },
  { path: '/ai/harvest-schedule',         title: 'AI - Harvest Schedule',     icon: '*', color: '#22c55e', desc: 'Schedule harvests across pens, vessels, processors.' },
  { path: '/ai/water-quality-anomaly',    title: 'AI - Water Quality Anomaly',icon: '*', color: '#22d3ee', desc: 'Detect DO / temp / algae anomalies.' },
  { path: '/ai/predator-deterrent-plan',  title: 'AI - Predator Deterrent',   icon: '*', color: '#f97316', desc: 'Non-lethal predator deterrent plan.' },
  { path: '/ai/environmental-risk-brief', title: 'AI - Environmental Risk',   icon: '*', color: '#dc2626', desc: 'Build environmental risk matrix for a farm.' },
  { path: '/ai/vessel-shift-schedule',    title: 'AI - Vessel Shift Schedule',icon: '*', color: '#3b82f6', desc: '7-day vessel shift schedule.' },
  { path: '/ai/diver-safety-brief',       title: 'AI - Diver Safety Brief',   icon: '*', color: '#8b5cf6', desc: 'Pre-dive safety brief for inspection / removal dives.' },
  { path: '/ai/customer-quality-report',  title: 'AI - Customer Quality',     icon: '*', color: '#14b8a6', desc: 'Customer-facing batch quality report.' },
  { path: '/ai/certification-readiness',  title: 'AI - Cert Readiness',       icon: '*', color: '#facc15', desc: 'Score audit-readiness across ASC/BAP/GlobalG.A.P.' },
  { path: '/ai/vendor-quality-score',     title: 'AI - Vendor Quality',       icon: '*', color: '#a78bfa', desc: 'Score vendors and flag concentration risk.' },
  { path: '/ai/market-price-forecast',    title: 'AI - Market Price Forecast',icon: '*', color: '#0ea5e9', desc: 'Forecast wholesale price per kg.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Net-Pen Operations Overview</h2>
        <p>Unified aquaculture operations picture · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Farms</div><div className="stat-value">{stats.farms?.total ?? '—'}</div><div className="stat-sub">{stats.farms?.active ?? 0} active · {stats.farms?.fallow ?? 0} fallow</div></div>
          <div className="stat"><div className="stat-label">Net Pens</div><div className="stat-value">{stats.net_pens?.total ?? '—'}</div><div className="stat-sub">{stats.net_pens?.stocked ?? 0} stocked · {stats.net_pens?.harvest_ready ?? 0} harvest-ready</div></div>
          <div className="stat"><div className="stat-label">Fish (count)</div><div className="stat-value">{Number(stats.net_pens?.total_fish || 0).toLocaleString()}</div><div className="stat-sub">across all pens</div></div>
          <div className="stat"><div className="stat-label">Fish Groups</div><div className="stat-value">{stats.fish_groups?.total ?? '—'}</div><div className="stat-sub">cohorts tracked</div></div>
          <div className="stat"><div className="stat-label">Feed (kg)</div><div className="stat-value">{stats.feed_inventory?.total ?? '—'}</div><div className="stat-sub">{Number(stats.feed_inventory?.total_kg || 0).toLocaleString()} kg on hand</div></div>
          <div className="stat"><div className="stat-label">Treatments</div><div className="stat-value">{stats.treatments?.total ?? '—'}</div><div className="stat-sub">{stats.treatments?.scheduled ?? 0} scheduled · {stats.treatments?.in_progress ?? 0} in progress</div></div>
          <div className="stat"><div className="stat-label">Mortality</div><div className="stat-value">{stats.mortality_logs?.total ?? '—'}</div><div className="stat-sub">{stats.mortality_logs?.open ?? 0} open · {stats.mortality_logs?.investigating ?? 0} investigating</div></div>
          <div className="stat"><div className="stat-label">Water Readings</div><div className="stat-value">{stats.water_quality?.total ?? '—'}</div><div className="stat-sub">recent samples</div></div>
          <div className="stat"><div className="stat-label">Biomass</div><div className="stat-value">{stats.biomass_estimates?.total ?? '—'}</div><div className="stat-sub">{Number(stats.biomass_estimates?.total_kg || 0).toLocaleString()} kg estimated</div></div>
          <div className="stat"><div className="stat-label">Sea Lice</div><div className="stat-value">{stats.sea_lice_counts?.total ?? '—'}</div><div className="stat-sub">{stats.sea_lice_counts?.breach ?? 0} breach · {stats.sea_lice_counts?.flagged ?? 0} flagged</div></div>
          <div className="stat"><div className="stat-label">Vessels</div><div className="stat-value">{stats.vessels?.total ?? '—'}</div><div className="stat-sub">{stats.vessels?.available ?? 0} available · {stats.vessels?.maintenance ?? 0} maint</div></div>
          <div className="stat"><div className="stat-label">Divers</div><div className="stat-value">{stats.divers?.total ?? '—'}</div><div className="stat-sub">{stats.divers?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Harvests</div><div className="stat-value">{stats.harvests?.total ?? '—'}</div><div className="stat-sub">{stats.harvests?.scheduled ?? 0} scheduled · {Number(stats.harvests?.total_tons || 0).toFixed(0)} t</div></div>
          <div className="stat"><div className="stat-label">Customers</div><div className="stat-value">{stats.customers?.total ?? '—'}</div><div className="stat-sub">{stats.customers?.active ?? 0} active · {stats.customers?.suspended ?? 0} suspended</div></div>
          <div className="stat"><div className="stat-label">Certifications</div><div className="stat-value">{stats.certifications?.total ?? '—'}</div><div className="stat-sub">{stats.certifications?.active ?? 0} active · {stats.certifications?.expiring ?? 0} expiring · {stats.certifications?.lapsed ?? 0} lapsed</div></div>
          <div className="stat"><div className="stat-label">Predator Incidents</div><div className="stat-value">{stats.predator_incidents?.total ?? '—'}</div><div className="stat-sub">{stats.predator_incidents?.open ?? 0} open · {stats.predator_incidents?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Env Impacts</div><div className="stat-value">{stats.environmental_impacts?.total ?? '—'}</div><div className="stat-sub">{stats.environmental_impacts?.open ?? 0} open · {stats.environmental_impacts?.critical ?? 0} critical</div></div>
          <div className="stat"><div className="stat-label">Vendors</div><div className="stat-value">{stats.vendors?.total ?? '—'}</div><div className="stat-sub">{stats.vendors?.preferred ?? 0} preferred · {stats.vendors?.watch ?? 0} watch</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
