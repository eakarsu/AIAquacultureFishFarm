import React from 'react';
import CrudPage from '../components/CrudPage';
import { biomassEstimatesApi } from '../services/api';

export default function BiomassEstimatesPage() {
  return (
    <CrudPage
      title="Biomass Estimates"
      subtitle="Stereo-vision, sonar and hybrid biomass measurements."
      api={biomassEstimatesApi}
      fields={[
        { key: 'estimate_id',  label: 'Estimate ID' },
        { key: 'pen_id',       label: 'Pen ID' },
        { key: 'total_kg',     label: 'Total (kg)', type: 'number' },
        { key: 'avg_kg',       label: 'Avg (kg)',   type: 'number' },
        { key: 'estimated_at', label: 'Estimated At', type: 'datetime-local' },
        { key: 'method',       label: 'Method', type: 'select', options: ['stereo_vision','sonar','hybrid','manual_sample'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
