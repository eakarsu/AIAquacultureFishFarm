import React from 'react';
import CrudPage from '../components/CrudPage';
import { netPensApi } from '../services/api';

export default function NetPensPage() {
  return (
    <CrudPage
      title="Net Pens"
      subtitle="Per-pen volume, depth, fish count and status."
      api={netPensApi}
      statusKey="status"
      fields={[
        { key: 'pen_id',     label: 'Pen ID' },
        { key: 'farm_id',    label: 'Farm ID' },
        { key: 'volume_m3',  label: 'Volume (m3)', type: 'number' },
        { key: 'depth_m',    label: 'Depth (m)',   type: 'number' },
        { key: 'fish_count', label: 'Fish Count',  type: 'number' },
        { key: 'status',     label: 'Status', type: 'select', options: ['stocked','harvest_ready','fallow','maintenance','retired'] },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
