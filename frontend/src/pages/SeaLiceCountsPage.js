import React from 'react';
import CrudPage from '../components/CrudPage';
import { seaLiceCountsApi } from '../services/api';

export default function SeaLiceCountsPage() {
  return (
    <CrudPage
      title="Sea Lice Counts"
      subtitle="Per-pen lice-per-fish samples and action."
      api={seaLiceCountsApi}
      statusKey="status"
      fields={[
        { key: 'count_id',      label: 'Count ID' },
        { key: 'pen_id',        label: 'Pen ID' },
        { key: 'lice_per_fish', label: 'Lice/Fish', type: 'number' },
        { key: 'sampled_at',    label: 'Sampled At', type: 'datetime-local' },
        { key: 'status',        label: 'Status', type: 'select', options: ['logged','flagged','breach'] },
        { key: 'action',        label: 'Action' },
        { key: 'notes',         label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
