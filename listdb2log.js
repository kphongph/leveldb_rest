var list_db_log = [
  "form_record",
  "obec_students"];

module.exports = {
  isdb_log : function(db_name) {
    if(list_db_log.indexOf(db_name) != -1) return false
    else return true
  }
};
