import React from 'react';
import AIPage from '../components/AIPage';
import { aiBiomassVisionEstimate } from '../services/api';

export default function AIBiomassVisionPage() {
  return (
    <AIPage
      title="AI - Biomass Vision Estimate"
      feature="biomass-vision-estimate"
      subtitle="Estimate biomass from stereo-vision / sonar observations of a net pen."
      inputs={[
        { key: 'pen_id', label: 'Pen ID', placeholder: 'e.g. PEN-NOR-001-P02' },
        { key: 'method', label: 'Method', type: 'select', options: ['stereo_vision','sonar','hybrid','manual_sample'] },
        { key: 'notes',  label: 'Notes', type: 'textarea', placeholder: 'Observation context, sample size, calibration notes...' },
      ]}
      run={(v) => aiBiomassVisionEstimate({ pen_id: v.pen_id, method: v.method, notes: v.notes })}
      buttonLabel="Estimate Biomass"
    />
  );
}
