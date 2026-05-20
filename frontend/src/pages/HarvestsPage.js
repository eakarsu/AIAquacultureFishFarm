import React from 'react';
import CrudPage from '../components/CrudPage';
import { harvestsApi } from '../services/api';

export default function HarvestsPage() {
  return (
    <CrudPage
      title="Harvests"
      subtitle="Scheduled and completed harvests with processor."
      api={harvestsApi}
      statusKey="status"
      fields={[
        { key: 'harvest_id',   label: 'Harvest ID' },
        { key: 'pen_id',       label: 'Pen ID' },
        { key: 'tons',         label: 'Tons', type: 'number' },
        { key: 'harvested_at', label: 'Harvested At', type: 'datetime-local' },
        { key: 'processor',    label: 'Processor' },
        { key: 'status',       label: 'Status', type: 'select', options: ['scheduled','in_progress','completed','aborted'] },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
