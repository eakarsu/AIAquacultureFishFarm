import React from 'react';
import AIPage from '../components/AIPage';
import { aiVesselShiftSchedule } from '../services/api';

export default function AIVesselShiftPage() {
  return (
    <AIPage
      title="AI - Vessel Shift Schedule"
      feature="vessel-shift-schedule"
      subtitle="Build a 7-day shift schedule across wellboats, feed barges and harvest vessels."
      inputs={[
        { key: 'window', label: 'Window',  placeholder: 'e.g. 2026-05-18 to 2026-05-24' },
        { key: 'notes',  label: 'Tasks / context', type: 'textarea', placeholder: 'Treatment runs, feed deliveries, harvests, net cleaning...' },
      ]}
      run={(v) => aiVesselShiftSchedule({ window: v.window, notes: v.notes })}
      buttonLabel="Build Shift Plan"
    />
  );
}
