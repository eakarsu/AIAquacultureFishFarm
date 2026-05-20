import React from 'react';
import AIPage from '../components/AIPage';
import { aiCustomerQualityReport } from '../services/api';

export default function AICustomerQualityPage() {
  return (
    <AIPage
      title="AI - Customer Quality Report"
      feature="customer-quality-report"
      subtitle="Generate a customer-facing batch quality / traceability report."
      inputs={[
        { key: 'customer_id', label: 'Customer ID', placeholder: 'e.g. CUS-0001' },
        { key: 'period',      label: 'Period',      placeholder: 'e.g. Q2 2026' },
        { key: 'notes',       label: 'Context',     type: 'textarea', placeholder: 'Spec, certifications required, premium grade...' },
      ]}
      run={(v) => aiCustomerQualityReport({ customer_id: v.customer_id, period: v.period, notes: v.notes })}
      buttonLabel="Build Report"
    />
  );
}
