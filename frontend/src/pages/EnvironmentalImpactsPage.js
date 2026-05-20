import React from 'react';
import CrudPage from '../components/CrudPage';
import { environmentalImpactsApi } from '../services/api';

export default function EnvironmentalImpactsPage() {
  return (
    <CrudPage
      title="Environmental Impacts"
      subtitle="Benthic, chemical, escape, algae, disease and genetic risk events."
      api={environmentalImpactsApi}
      statusKey="status"
      fields={[
        { key: 'impact_id', label: 'Impact ID' },
        { key: 'farm_id',   label: 'Farm ID' },
        { key: 'type',      label: 'Type' },
        { key: 'severity',  label: 'Severity', type: 'select', options: ['low','medium','high','critical'] },
        { key: 'opened_at', label: 'Opened At', type: 'datetime-local' },
        { key: 'status',    label: 'Status', type: 'select', options: ['open','investigating','mitigating','mitigated','monitoring','closed'] },
        { key: 'notes',     label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
