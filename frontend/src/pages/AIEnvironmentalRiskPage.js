import React from 'react';
import AIPage from '../components/AIPage';
import { aiEnvironmentalRiskBrief } from '../services/api';

export default function AIEnvironmentalRiskPage() {
  return (
    <AIPage
      title="AI - Environmental Risk Brief"
      feature="environmental-risk-brief"
      subtitle="Build a benthic / chemical / escape / disease / oceanographic risk matrix."
      inputs={[
        { key: 'farm_id', label: 'Farm ID', placeholder: 'e.g. FRM-CHL-001' },
        { key: 'notes',   label: 'Context', type: 'textarea', placeholder: 'Recent inspections, bloom activity, compliance posture...' },
      ]}
      run={(v) => aiEnvironmentalRiskBrief({ farm_id: v.farm_id, notes: v.notes })}
      buttonLabel="Build Risk Brief"
    />
  );
}
