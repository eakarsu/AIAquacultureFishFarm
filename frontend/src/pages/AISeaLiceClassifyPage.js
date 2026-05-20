import React from 'react';
import AIPage from '../components/AIPage';
import { aiSeaLiceCountsClassify } from '../services/api';

export default function AISeaLiceClassifyPage() {
  return (
    <AIPage
      title="AI - Sea Lice Counts Classify"
      feature="sea-lice-counts-classify"
      subtitle="Classify lice counts per pen, detect breaches and recommend action."
      inputs={[
        { key: 'notes', label: 'Optional analyst bias / context', type: 'textarea', placeholder: 'e.g. Focus on Norwegian sites / regulatory thresholds...' },
      ]}
      run={(v) => aiSeaLiceCountsClassify({ notes: v.notes })}
      buttonLabel="Classify Lice"
    />
  );
}
