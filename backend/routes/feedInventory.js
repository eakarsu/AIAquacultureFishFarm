const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'feed_inventory',
  fields: ['inv_id','type','qty_kg','location','batch','expiry','notes'],
});
