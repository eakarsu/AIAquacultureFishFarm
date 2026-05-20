import React from 'react';
import CrudPage from '../components/CrudPage';
import { customersApi } from '../services/api';

export default function CustomersPage() {
  return (
    <CrudPage
      title="Customers"
      subtitle="Retail, foodservice and distributor customers."
      api={customersApi}
      statusKey="status"
      fields={[
        { key: 'customer_id', label: 'Customer ID' },
        { key: 'name',        label: 'Name' },
        { key: 'country',     label: 'Country' },
        { key: 'contract_id', label: 'Contract' },
        { key: 'type',        label: 'Type', type: 'select', options: ['retail_premium','retail_supermarket','retail_wholesale','foodservice_chain','distributor'] },
        { key: 'status',      label: 'Status', type: 'select', options: ['active','on_hold','suspended','closed'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
