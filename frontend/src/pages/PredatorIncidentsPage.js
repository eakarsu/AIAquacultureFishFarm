import React from 'react';
import CrudPage from '../components/CrudPage';
import { predatorIncidentsApi } from '../services/api';

export default function PredatorIncidentsPage() {
  return (
    <CrudPage
      title="Predator Incidents"
      subtitle="Seal, sea lion, bird and shark interactions."
      api={predatorIncidentsApi}
      statusKey="status"
      fields={[
        { key: 'incident_id', label: 'Incident ID' },
        { key: 'pen_id',      label: 'Pen ID' },
        { key: 'predator',    label: 'Predator' },
        { key: 'severity',    label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at',   label: 'Opened At', type: 'datetime-local' },
        { key: 'status',      label: 'Status', type: 'select', options: ['open','investigating','mitigating','mitigated','closed'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
