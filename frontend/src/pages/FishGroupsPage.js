import React from 'react';
import CrudPage from '../components/CrudPage';
import { fishGroupsApi } from '../services/api';

export default function FishGroupsPage() {
  return (
    <CrudPage
      title="Fish Groups"
      subtitle="Cohorts with species, count, average weight and stocking date."
      api={fishGroupsApi}
      fields={[
        { key: 'group_id',     label: 'Group ID' },
        { key: 'pen_id',       label: 'Pen ID' },
        { key: 'species',      label: 'Species' },
        { key: 'count',        label: 'Count', type: 'number' },
        { key: 'avg_weight_g', label: 'Avg Weight (g)', type: 'number' },
        { key: 'stocked_at',   label: 'Stocked', type: 'date' },
        { key: 'notes',        label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
