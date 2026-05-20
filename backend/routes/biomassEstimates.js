const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'biomass_estimates',
  fields: ['estimate_id','pen_id','total_kg','avg_kg','estimated_at','method','notes'],
});
