import React from 'react';
import CrudPage from '../components/CrudPage';
import { certificationsApi } from '../services/api';

export default function CertificationsPage() {
  return (
    <CrudPage
      title="Certifications"
      subtitle="ASC, BAP, GlobalG.A.P., RSPCA Assured, Debio Organic."
      api={certificationsApi}
      statusKey="status"
      fields={[
        { key: 'cert_id',    label: 'Cert ID' },
        { key: 'farm_id',    label: 'Farm ID' },
        { key: 'standard',   label: 'Standard' },
        { key: 'issued_at',  label: 'Issued', type: 'date' },
        { key: 'expires_at', label: 'Expires', type: 'date' },
        { key: 'status',     label: 'Status', type: 'select', options: ['active','expiring','lapsed','revoked'] },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
