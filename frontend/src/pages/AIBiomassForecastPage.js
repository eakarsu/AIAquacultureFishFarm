import React from 'react';
import AIPage from '../components/AIPage';
import { aiBiomassForecast } from '../services/api';

export default function AIBiomassForecastPage() {
  return (
    <AIPage
      title="AI - Biomass Forecast"
      feature="biomass-forecast"
      subtitle="N-week biomass projection per pen from historical estimates, fish group and water quality."
      inputs={[
        { key: 'pen_id',         label: 'Pen ID', placeholder: 'e.g. PEN-NOR-001-P02' },
        { key: 'horizon_weeks',  label: 'Horizon (weeks)', type: 'number', defaultValue: 8 },
        { key: 'notes',          label: 'Notes', type: 'textarea' },
      ]}
      run={(v) => aiBiomassForecast({ pen_id: v.pen_id, horizon_weeks: v.horizon_weeks, notes: v.notes })}
      buttonLabel="Forecast Biomass"
    />
  );
}
