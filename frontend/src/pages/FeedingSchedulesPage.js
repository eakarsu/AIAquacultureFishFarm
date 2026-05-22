import React from 'react';
import CrudPage from '../components/CrudPage';
import { feedingSchedulesApi } from '../services/api';

export default function FeedingSchedulesPage() {
  return (
    <CrudPage
      title="Feeding Schedules"
      subtitle="Per-pen ration plans, feed type, meals per day, feeding window and active dates."
      api={feedingSchedulesApi}
      statusKey="status"
      fields={[
        { key: 'schedule_id',       label: 'Schedule ID' },
        { key: 'pen_id',            label: 'Pen ID' },
        { key: 'feed_type',         label: 'Feed Type' },
        { key: 'ration_kg_per_day', label: 'Ration (kg/day)', type: 'number' },
        { key: 'meals_per_day',     label: 'Meals/day', type: 'number' },
        { key: 'feeding_window',    label: 'Feeding Window', placeholder: '07:00-15:00' },
        { key: 'start_date',        label: 'Start Date', type: 'date' },
        { key: 'end_date',          label: 'End Date',   type: 'date' },
        { key: 'status',            label: 'Status', type: 'select', options: ['active','paused','completed','cancelled'] },
        { key: 'notes',             label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
