import React from 'react';
import AIPage from '../components/AIPage';
import { aiTreatmentRecommend } from '../services/api';

export default function AITreatmentRecommendPage() {
  return (
    <AIPage
      title="AI - Treatment Recommend"
      feature="treatment-recommend"
      subtitle="Recommend disease / parasite treatment plans with dosage and withdrawal."
      inputs={[
        { key: 'issue',     label: 'Issue',        type: 'textarea', placeholder: 'e.g. AGD clinical signs in PEN-SCO-001-P01, gill score 3 on 18% of fish.' },
        { key: 'pen_id',    label: 'Pen ID',       placeholder: 'e.g. PEN-SCO-001-P01' },
        { key: 'pen_notes', label: 'Pen context',  type: 'textarea', placeholder: 'Volume, fish count, avg weight, water temp, recent treatments...' },
      ]}
      run={(v) => aiTreatmentRecommend({ issue: v.issue, pen_id: v.pen_id, pen_notes: v.pen_notes })}
      buttonLabel="Recommend Treatment"
    />
  );
}
