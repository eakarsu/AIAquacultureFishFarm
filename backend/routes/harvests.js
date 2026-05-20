const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'harvests',
  fields: ['harvest_id','pen_id','tons','harvested_at','processor','status','notes'],
  webhookPrefix: 'harvest',
});
