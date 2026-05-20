import React from 'react';
import CrudPage from '../components/CrudPage';
import { mortalityLogsApi } from '../services/api';

export default function MortalityLogsPage() {
  return (
    <CrudPage
      title="Mortality Logs"
      subtitle="Daily mortality with suspected cause."
      api={mortalityLogsApi}
      statusKey="status"
      fields={[
        { key: 'log_id', label: 'Log ID' },
        { key: 'pen_id', label: 'Pen ID' },
        { key: 'count',  label: 'Count', type: 'number' },
        { key: 'cause',  label: 'Cause' },
        { key: 'ts',     label: 'Timestamp', type: 'datetime-local' },
        { key: 'status', label: 'Status', type: 'select', options: ['open','investigating','closed'] },
        { key: 'notes',  label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
