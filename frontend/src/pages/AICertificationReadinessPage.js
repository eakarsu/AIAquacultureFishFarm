import React from 'react';
import AIPage from '../components/AIPage';
import { aiCertificationReadiness } from '../services/api';

export default function AICertificationReadinessPage() {
  return (
    <AIPage
      title="AI - Certification Readiness"
      feature="certification-readiness"
      subtitle="Score audit-readiness across ASC, BAP, GlobalG.A.P., RSPCA Assured."
      inputs={[
        { key: 'notes', label: 'Optional focus / context', type: 'textarea', placeholder: 'e.g. Focus on lapsed ASC at Macquarie Harbour.' },
      ]}
      run={(v) => aiCertificationReadiness({ notes: v.notes })}
      buttonLabel="Score Readiness"
    />
  );
}
