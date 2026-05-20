const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'sea_lice_counts',
  fields: ['count_id','pen_id','lice_per_fish','sampled_at','status','action','notes'],
});
