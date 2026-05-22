import React from 'react';
import AIPage from '../components/AIPage';
import { aiHarvestTiming } from '../services/api';

export default function AIHarvestTimingPage() {
  return (
    <AIPage
      title="AI - Harvest Timing"
      feature="harvest-timing"
      subtitle="Per-pen optimal harvest date balancing growth curve, market forecast and regulatory window."
      inputs={[
        { key: 'pen_id',                label: 'Pen ID', placeholder: 'e.g. PEN-NOR-001-P02' },
        { key: 'target_avg_weight_g',   label: 'Target avg weight (g)', type: 'number', defaultValue: 5000 },
        { key: 'market_notes',          label: 'Market notes', type: 'textarea' },
        { key: 'notes',                 label: 'Additional notes', type: 'textarea' },
      ]}
      run={(v) => aiHarvestTiming({
        pen_id: v.pen_id,
        target_avg_weight_g: v.target_avg_weight_g,
        market_notes: v.market_notes,
        notes: v.notes,
      })}
      buttonLabel="Recommend Harvest Date"
    />
  );
}
