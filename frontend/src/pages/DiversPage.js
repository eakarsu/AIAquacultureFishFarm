import React from 'react';
import CrudPage from '../components/CrudPage';
import { diversApi } from '../services/api';

export default function DiversPage() {
  return (
    <CrudPage
      title="Divers"
      subtitle="Diver roster with certifications and hours."
      api={diversApi}
      statusKey="status"
      fields={[
        { key: 'diver_id',       label: 'Diver ID' },
        { key: 'name',           label: 'Name' },
        { key: 'certifications', label: 'Certifications', type: 'textarea' },
        { key: 'hours_total',    label: 'Total Hours', type: 'number' },
        { key: 'last_dive',      label: 'Last Dive', type: 'date' },
        { key: 'status',         label: 'Status', type: 'select', options: ['active','on_leave','training','suspended'] },
        { key: 'notes',          label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
