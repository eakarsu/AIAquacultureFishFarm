const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'mortality_logs',
  fields: ['log_id','pen_id','count','cause','ts','status','notes'],
});
