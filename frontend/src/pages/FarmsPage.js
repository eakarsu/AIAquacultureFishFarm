import React from 'react';
import CrudPage from '../components/CrudPage';
import { farmsApi } from '../services/api';

export default function FarmsPage() {
  return (
    <CrudPage
      title="Farms"
      subtitle="Sea sites with pen count, species and status."
      api={farmsApi}
      statusKey="status"
      fields={[
        { key: 'farm_id',   label: 'Farm ID' },
        { key: 'name',      label: 'Name' },
        { key: 'location',  label: 'Location' },
        { key: 'pen_count', label: 'Pens', type: 'number' },
        { key: 'species',   label: 'Species' },
        { key: 'status',    label: 'Status', type: 'select', options: ['active','fallow','maintenance','retired'] },
        { key: 'notes',     label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
