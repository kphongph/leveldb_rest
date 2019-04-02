var list_db_log = ["authen_db"];

module.exports = {
  isdb_log : function(db_name) {
    if(list_db_log.indexOf(db_name) != -1) return false
    else return true
  }
};
