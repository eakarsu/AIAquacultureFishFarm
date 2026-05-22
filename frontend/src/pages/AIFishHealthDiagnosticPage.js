import React from 'react';
import AIPage from '../components/AIPage';
import { aiFishHealthDiagnostic } from '../services/api';

export default function AIFishHealthDiagnosticPage() {
  return (
    <AIPage
      title="AI - Fish Health Diagnostic"
      feature="fish-health-diagnostic"
      subtitle="Differential diagnosis from clinical symptoms, water quality and referenced pen-camera frames."
      inputs={[
        { key: 'pen_id',     label: 'Pen ID',       placeholder: 'e.g. PEN-SCO-001-P01' },
        { key: 'symptoms',   label: 'Clinical symptoms', type: 'textarea', placeholder: 'Gill paleness, lethargy, surface gasping...' },
        { key: 'image_refs', label: 'Image references (comma-separated)', placeholder: 'camera/PEN-001_2026-05-20.jpg, ...' },
        { key: 'notes',      label: 'Additional notes', type: 'textarea' },
      ]}
      run={(v) => aiFishHealthDiagnostic({
        pen_id: v.pen_id,
        symptoms: v.symptoms,
        image_refs: (v.image_refs || '').split(',').map((s) => s.trim()).filter(Boolean),
        notes: v.notes,
      })}
      buttonLabel="Run Diagnostic"
    />
  );
}
