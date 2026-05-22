import React from 'react';
import AIPage from '../components/AIPage';
import { aiPenCameraAnalyze } from '../services/api';

export default function AIPenCameraAnalyzePage() {
  return (
    <AIPage
      title="AI - Pen Camera Analyze"
      feature="pen-camera-analyze"
      subtitle="CV-style frame analysis: net integrity, fouling, fish behavior, visible sea lice and escape risk."
      inputs={[
        { key: 'pen_id',            label: 'Pen ID', placeholder: 'e.g. PEN-NOR-001-P02' },
        { key: 'frame_refs',        label: 'Frame references (comma-separated)', placeholder: 'camera/PEN-001_2026-05-20_0800.jpg, ...' },
        { key: 'frame_description', label: 'Frame description / observation', type: 'textarea', placeholder: 'Mid-water shot, schooling pattern, fouling, behavior...' },
        { key: 'notes',             label: 'Notes', type: 'textarea' },
      ]}
      run={(v) => aiPenCameraAnalyze({
        pen_id: v.pen_id,
        frame_refs: (v.frame_refs || '').split(',').map((s) => s.trim()).filter(Boolean),
        frame_description: v.frame_description,
        notes: v.notes,
      })}
      buttonLabel="Analyze Frame"
    />
  );
}
