const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'vessels',
  fields: ['vessel_id','name','type','capacity','fuel_status','status','notes'],
});
