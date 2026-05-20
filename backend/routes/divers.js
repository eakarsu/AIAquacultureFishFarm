const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'divers',
  fields: ['diver_id','name','certifications','hours_total','last_dive','status','notes'],
});
