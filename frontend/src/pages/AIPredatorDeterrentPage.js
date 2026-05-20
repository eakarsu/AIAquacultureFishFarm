import React from 'react';
import AIPage from '../components/AIPage';
import { aiPredatorDeterrentPlan } from '../services/api';

export default function AIPredatorDeterrentPage() {
  return (
    <AIPage
      title="AI - Predator Deterrent Plan"
      feature="predator-deterrent-plan"
      subtitle="Layered non-lethal deterrent plan for seals, sea lions, birds and sharks."
      inputs={[
        { key: 'incident',     label: 'Incident',       type: 'textarea', placeholder: 'Describe the predator incident...' },
        { key: 'incident_id',  label: 'Incident ID',    placeholder: 'e.g. PRD-2026-0002' },
        { key: 'farm_notes',   label: 'Farm context',   type: 'textarea', placeholder: 'Site exposure, existing deterrents, regulations...' },
      ]}
      run={(v) => aiPredatorDeterrentPlan({ incident: v.incident, incident_id: v.incident_id, farm_notes: v.farm_notes })}
      buttonLabel="Build Plan"
    />
  );
}
