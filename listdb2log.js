var list_db_log = [
  "admin_area",
  "admin_school",
  "announcement",
  "attendance",
  "authen_db",
  "desirecharacteristicdata",
  "earlywarning",
  "edu_students",
  "examratio",
  "form_template",
  "healthcare",
  "hostconfig",
  "hostsummary",
  "hostsystem",
  "knowledgestructure",
  "morning",
  "morningdetail",
  "newindicator",
  "obec_grade",
  "obec_teacher",
  "readthinkwritedata",
  "school",
  "studentattend",
  "teacher67p",
  "user_db",
  "weightheight"];

module.exports = {
  isdb_log : function(db_name) {
    if(list_db_log.indexOf(db_name) == -1) return false
    else return true
  }
};
