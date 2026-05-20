import React from 'react';
import AIPage from '../components/AIPage';
import { aiVendorQualityScore } from '../services/api';

export default function AIVendorQualityPage() {
  return (
    <AIPage
      title="AI - Vendor Quality Score"
      feature="vendor-quality-score"
      subtitle="Score feed / equipment / smolt / processing vendors and flag concentration risk."
      inputs={[
        { key: 'notes', label: 'Optional focus / context', type: 'textarea', placeholder: 'e.g. Focus only on feed vendors and FCR / pellet integrity.' },
      ]}
      run={(v) => aiVendorQualityScore({ notes: v.notes })}
      buttonLabel="Score Vendors"
    />
  );
}
