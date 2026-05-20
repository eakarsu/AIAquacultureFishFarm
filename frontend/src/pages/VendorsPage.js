import React from 'react';
import CrudPage from '../components/CrudPage';
import { vendorsApi } from '../services/api';

export default function VendorsPage() {
  return (
    <CrudPage
      title="Vendors"
      subtitle="Feed, equipment, vaccines, smolt and genetics suppliers."
      api={vendorsApi}
      statusKey="status"
      fields={[
        { key: 'vendor_id', label: 'Vendor ID' },
        { key: 'name',      label: 'Name' },
        { key: 'service',   label: 'Service' },
        { key: 'country',   label: 'Country' },
        { key: 'rating',    label: 'Rating', type: 'number' },
        { key: 'status',    label: 'Status', type: 'select', options: ['preferred','approved','watch','phase_out','blocked'] },
        { key: 'notes',     label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
