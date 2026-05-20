import React from 'react';
import AIPage from '../components/AIPage';
import { aiWaterQualityAnomaly } from '../services/api';

export default function AIWaterQualityAnomalyPage() {
  return (
    <AIPage
      title="AI - Water Quality Anomaly"
      feature="water-quality-anomaly"
      subtitle="Detect DO, temperature, salinity, turbidity and algae anomalies."
      inputs={[
        { key: 'notes', label: 'Optional analyst context', type: 'textarea', placeholder: 'e.g. Low-DO event at Macquarie Harbour, bloom risk...' },
      ]}
      run={(v) => aiWaterQualityAnomaly({ notes: v.notes })}
      buttonLabel="Detect Anomalies"
    />
  );
}
