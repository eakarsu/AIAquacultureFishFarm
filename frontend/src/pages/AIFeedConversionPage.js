import React from 'react';
import AIPage from '../components/AIPage';
import { aiFeedConversionOptimize } from '../services/api';

export default function AIFeedConversionPage() {
  return (
    <AIPage
      title="AI - Feed Conversion Optimize"
      feature="feed-conversion-optimize"
      subtitle="Lower FCR and reduce pellet waste across pens."
      inputs={[
        { key: 'notes', label: 'Context', type: 'textarea', placeholder: 'Site, target FCR, environmental notes...' },
      ]}
      run={(v) => aiFeedConversionOptimize({ notes: v.notes })}
      buttonLabel="Optimize FCR"
    />
  );
}
