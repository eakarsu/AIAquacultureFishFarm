import React from 'react';
import AIPage from '../components/AIPage';
import { aiEscapeDetect } from '../services/api';

export default function AIEscapeDetectPage() {
  return (
    <AIPage
      title="AI - Escape Detect"
      feature="escape-detect"
      subtitle="Fuse acoustic-tag, sonar and net-tension signals to detect a potential escape."
      inputs={[
        { key: 'pen_id', label: 'Pen ID', placeholder: 'e.g. PEN-AUS-001-P05' },
        {
          key: 'signals',
          label: 'Signals (JSON array)',
          type: 'textarea',
          defaultValue: '[\n  { "source": "acoustic_tag", "delta": 0, "direction": "flat", "note": "Baseline count stable." },\n  { "source": "sonar", "delta": 0, "direction": "flat", "note": "Sonar count stable." },\n  { "source": "net_tension", "delta": 0, "direction": "flat", "note": "Tension within normal range." }\n]',
        },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      run={(values, requestOptions) => {
        let signals;
        try {
          signals = JSON.parse(values.signals || '[]');
        } catch (_) {
          throw new Error('Signals must be valid JSON');
        }
        if (!Array.isArray(signals)) throw new Error('Signals must be a JSON array');
        return aiEscapeDetect({ pen_id: values.pen_id, signals, notes: values.notes }, requestOptions);
      }}
      buttonLabel="Detect Escape"
    />
  );
}
