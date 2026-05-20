import React from 'react';
import CrudPage from '../components/CrudPage';
import { vesselsApi } from '../services/api';

export default function VesselsPage() {
  return (
    <CrudPage
      title="Vessels"
      subtitle="Wellboats, feed barges, harvest vessels, net cleaners."
      api={vesselsApi}
      statusKey="status"
      fields={[
        { key: 'vessel_id',   label: 'Vessel ID' },
        { key: 'name',        label: 'Name' },
        { key: 'type',        label: 'Type', type: 'select', options: ['wellboat','feed_barge','harvest_vessel','net_cleaner','workboat','service_vessel','dive_tender','thermolicer'] },
        { key: 'capacity',    label: 'Capacity', type: 'number' },
        { key: 'fuel_status', label: 'Fuel', type: 'select', options: ['full','high','medium','low','empty'] },
        { key: 'status',      label: 'Status', type: 'select', options: ['available','on_site','on_assignment','maintenance','out_of_service'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
