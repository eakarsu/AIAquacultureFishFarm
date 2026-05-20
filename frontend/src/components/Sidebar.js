import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

const FARMS_LINKS = [
  { to: '/farms',             label: 'Farms' },
  { to: '/net-pens',          label: 'Net Pens' },
  { to: '/fish-groups',       label: 'Fish Groups' },
];

const FEED_LINKS = [
  { to: '/feed-inventory',    label: 'Feed Inventory' },
  { to: '/biomass-estimates', label: 'Biomass Estimates' },
  { to: '/water-quality',     label: 'Water Quality' },
];

const TREATMENTS_LINKS = [
  { to: '/treatments',          label: 'Treatments' },
  { to: '/sea-lice-counts',     label: 'Sea Lice Counts' },
  { to: '/mortality-logs',      label: 'Mortality Logs' },
  { to: '/predator-incidents',  label: 'Predator Incidents' },
];

const HARVESTS_LINKS = [
  { to: '/harvests',     label: 'Harvests' },
  { to: '/vessels',      label: 'Vessels' },
  { to: '/divers',       label: 'Divers' },
];

const CUSTOMERS_LINKS = [
  { to: '/customers',     label: 'Customers' },
  { to: '/vendors',       label: 'Vendors' },
];

const GOVERNANCE_LINKS = [
  { to: '/certifications',         label: 'Certifications' },
  { to: '/environmental-impacts',  label: 'Environmental Impacts' },
  { to: '/audit-log',              label: 'Audit Log' },
];

const AI_MONITORING_LINKS = [
  { to: '/ai/biomass-vision-estimate', label: 'AI - Biomass Vision' },
  { to: '/ai/sea-lice-counts-classify',label: 'AI - Sea Lice Classify' },
  { to: '/ai/mortality-anomaly-detect',label: 'AI - Mortality Anomaly' },
  { to: '/ai/water-quality-anomaly',   label: 'AI - Water Quality Anomaly' },
  { to: '/ai/executive-brief',         label: 'AI - Executive Brief' },
];

const AI_PLANNING_LINKS = [
  { to: '/ai/feed-conversion-optimize',label: 'AI - Feed Conversion' },
  { to: '/ai/treatment-recommend',     label: 'AI - Treatment Recommend' },
  { to: '/ai/harvest-schedule',        label: 'AI - Harvest Schedule' },
  { to: '/ai/predator-deterrent-plan', label: 'AI - Predator Deterrent' },
  { to: '/ai/environmental-risk-brief',label: 'AI - Environmental Risk' },
  { to: '/ai/vessel-shift-schedule',   label: 'AI - Vessel Shift Schedule' },
  { to: '/ai/diver-safety-brief',      label: 'AI - Diver Safety Brief' },
  { to: '/ai/customer-quality-report', label: 'AI - Customer Quality' },
  { to: '/ai/certification-readiness', label: 'AI - Cert Readiness' },
  { to: '/ai/vendor-quality-score',    label: 'AI - Vendor Quality' },
  { to: '/ai/market-price-forecast',   label: 'AI - Market Price Forecast' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>AQUAFARM</h1>
        <p>Net-Pen Operations Hub</p>
      </div>

      <NavLink to="/" end>Overview</NavLink>

      <div className="sidebar-group-label">Farms</div>
      {FARMS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Pens / Feed</div>
      {FEED_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Treatments / Health</div>
      {TREATMENTS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Harvests / Fleet</div>
      {HARVESTS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Customers / Vendors</div>
      {CUSTOMERS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Certifications / Governance</div>
      {GOVERNANCE_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Monitoring</div>
      {AI_MONITORING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Planning</div>
      {AI_PLANNING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Analytics</div>
      <NavLink to="/custom-views">Farm Analytics</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
