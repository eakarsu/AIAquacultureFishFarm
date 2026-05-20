import React from 'react';
import CrudPage from '../components/CrudPage';
import { treatmentsApi } from '../services/api';

export default function TreatmentsPage() {
  return (
    <CrudPage
      title="Treatments"
      subtitle="Sea-lice, parasite and disease treatments."
      api={treatmentsApi}
      statusKey="status"
      fields={[
        { key: 'treatment_id', label: 'Treatment ID' },
        { key: 'pen_id',       label: 'Pen ID' },
        { key: 'product',      label: 'Product' },
        { key: 'dosage',       label: 'Dosage' },
        { key: 'applied_at',   label: 'Applied At', type: 'datetime-local' },
        { key: 'status',       label: 'Status', type: 'select', options: ['scheduled','in_progress','completed','aborted'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
