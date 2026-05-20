import React from 'react';
import AIPage from '../components/AIPage';
import { aiDiverSafetyBrief } from '../services/api';

export default function AIDiverSafetyPage() {
  return (
    <AIPage
      title="AI - Diver Safety Brief"
      feature="diver-safety-brief"
      subtitle="Pre-dive safety brief for net inspection, mortality removal and mooring dives."
      inputs={[
        { key: 'dive_objective', label: 'Dive objective', type: 'textarea', placeholder: 'e.g. Net integrity inspection at PEN-NOR-001-P02 after grey seal incident.' },
        { key: 'diver_id',       label: 'Lead Diver ID',  placeholder: 'e.g. DVR-001' },
        { key: 'site_notes',     label: 'Site conditions', type: 'textarea', placeholder: 'Depth, current, visibility, water temp, weather...' },
      ]}
      run={(v) => aiDiverSafetyBrief({ dive_objective: v.dive_objective, diver_id: v.diver_id, site_notes: v.site_notes })}
      buttonLabel="Build Safety Brief"
    />
  );
}
