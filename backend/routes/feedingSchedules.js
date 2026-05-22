const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'feeding_schedules',
  fields: [
    'schedule_id',
    'pen_id',
    'feed_type',
    'ration_kg_per_day',
    'meals_per_day',
    'feeding_window',
    'start_date',
    'end_date',
    'status',
    'notes',
  ],
});
