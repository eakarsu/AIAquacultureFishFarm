import React from 'react';
import AIPage from '../components/AIPage';
import { aiMortalityPredict } from '../services/api';

export default function AIMortalityPredictPage() {
  return (
    <AIPage
      title="AI - Mortality Predict"
      feature="mortality-predict"
      subtitle="Forward 7 / 14 / 30 day mortality risk per pen from recent logs, water quality and sea lice trends."
      inputs={[
        { key: 'pen_id', label: 'Pen ID (optional - leave blank for fleet-wide)', placeholder: 'e.g. PEN-AUS-001-P05' },
        { key: 'notes',  label: 'Notes', type: 'textarea' },
      ]}
      run={(v) => aiMortalityPredict({ pen_id: v.pen_id, notes: v.notes })}
      buttonLabel="Predict Mortality"
    />
  );
}
