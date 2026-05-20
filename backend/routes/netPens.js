const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'net_pens',
  fields: ['pen_id','farm_id','volume_m3','depth_m','fish_count','status','notes'],
});
