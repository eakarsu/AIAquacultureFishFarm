const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'environmental_impacts',
  fields: ['impact_id','farm_id','type','severity','opened_at','status','notes'],
});
