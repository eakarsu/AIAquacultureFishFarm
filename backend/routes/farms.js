const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'farms',
  fields: ['farm_id','name','location','pen_count','species','status','notes'],
});
