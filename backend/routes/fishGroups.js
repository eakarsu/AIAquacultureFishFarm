const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'fish_groups',
  fields: ['group_id','pen_id','species','count','avg_weight_g','stocked_at','notes'],
});
