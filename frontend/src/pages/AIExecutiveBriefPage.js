import React from 'react';
import AIPage from '../components/AIPage';
import { aiExecutiveBrief } from '../services/api';

export default function AIExecutiveBriefPage() {
  return (
    <AIPage
      title="AI - Executive Brief"
      feature="executive-brief"
      subtitle="Farm-manager operational snapshot, top risks and decisions required."
      inputs={[
        { key: 'notes', label: 'Optional bias / context', type: 'textarea', placeholder: 'e.g. Bias toward Chile portfolio and caligus breach.' },
      ]}
      run={(v) => aiExecutiveBrief({ notes: v.notes })}
      buttonLabel="Generate Brief"
    />
  );
}
