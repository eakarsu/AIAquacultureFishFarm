import React from 'react';
import AIPage from '../components/AIPage';
import { aiSustainabilityScore } from '../services/api';

export default function AISustainabilityScorePage() {
  return (
    <AIPage
      title="AI - Sustainability Score"
      feature="sustainability-score"
      subtitle="ASC/BAP-aligned composite score across carbon, feed, waste, welfare, escapes and chemicals."
      inputs={[
        { key: 'farm_id', label: 'Farm ID (optional - leave blank for all farms)', placeholder: 'e.g. FRM-NOR-001' },
        { key: 'notes',   label: 'Notes', type: 'textarea' },
      ]}
      run={(v) => aiSustainabilityScore({ farm_id: v.farm_id, notes: v.notes })}
      buttonLabel="Score Sustainability"
    />
  );
}
