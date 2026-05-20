import React from 'react';
import CrudPage from '../components/CrudPage';
import { waterQualityApi } from '../services/api';

export default function WaterQualityPage() {
  return (
    <CrudPage
      title="Water Quality"
      subtitle="DO, temperature, salinity, turbidity, algae readings."
      api={waterQualityApi}
      fields={[
        { key: 'reading_id', label: 'Reading ID' },
        { key: 'pen_id',     label: 'Pen ID' },
        { key: 'parameter',  label: 'Parameter' },
        { key: 'value',      label: 'Value',  type: 'number' },
        { key: 'units',      label: 'Units' },
        { key: 'ts',         label: 'Timestamp', type: 'datetime-local' },
        { key: 'notes',      label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
