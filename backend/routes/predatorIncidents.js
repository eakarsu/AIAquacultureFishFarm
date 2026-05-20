const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'predator_incidents',
  fields: ['incident_id','pen_id','predator','severity','opened_at','status','notes'],
});
