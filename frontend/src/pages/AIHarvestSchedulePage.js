import React from 'react';
import AIPage from '../components/AIPage';
import { aiHarvestSchedule } from '../services/api';

export default function AIHarvestSchedulePage() {
  return (
    <AIPage
      title="AI - Harvest Schedule"
      feature="harvest-schedule"
      subtitle="Schedule harvests across pens, vessels and processors."
      inputs={[
        { key: 'window',      label: 'Window',      placeholder: 'e.g. Next 30 days' },
        { key: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'Vessel availability, processor capacity, market timing...' },
      ]}
      run={(v) => aiHarvestSchedule({ window: v.window, constraints: v.constraints })}
      buttonLabel="Build Schedule"
    />
  );
}
