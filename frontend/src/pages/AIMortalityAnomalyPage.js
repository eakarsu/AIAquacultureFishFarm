import React from 'react';
import AIPage from '../components/AIPage';
import { aiMortalityAnomalyDetect } from '../services/api';

export default function AIMortalityAnomalyPage() {
  return (
    <AIPage
      title="AI - Mortality Anomaly Detect"
      feature="mortality-anomaly-detect"
      subtitle="Detect anomalies in daily mortality logs and recommend follow-up."
      inputs={[
        { key: 'notes', label: 'Optional context', type: 'textarea', placeholder: 'e.g. Focus on a specific pen, suspected disease...' },
      ]}
      run={(v) => aiMortalityAnomalyDetect({ notes: v.notes })}
      buttonLabel="Detect Anomalies"
    />
  );
}
