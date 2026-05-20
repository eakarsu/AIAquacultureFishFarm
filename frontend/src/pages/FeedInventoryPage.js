import React from 'react';
import CrudPage from '../components/CrudPage';
import { feedInventoryApi } from '../services/api';

export default function FeedInventoryPage() {
  return (
    <CrudPage
      title="Feed Inventory"
      subtitle="Feed type, quantity, batch and expiry by depot."
      api={feedInventoryApi}
      fields={[
        { key: 'inv_id',   label: 'Inventory ID' },
        { key: 'type',     label: 'Feed Type' },
        { key: 'qty_kg',   label: 'Qty (kg)', type: 'number' },
        { key: 'location', label: 'Location' },
        { key: 'batch',    label: 'Batch' },
        { key: 'expiry',   label: 'Expiry', type: 'date' },
        { key: 'notes',    label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
