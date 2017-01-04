module.exports.index = {
  'obec_students': {
    attributes: [{
      'name': 'host_class_room',
      'map': function(key, value, emit) {
        emit([value.hostid, value['class'], value['room']]);
      }
    }]
  },
  'educationchild': {
    attributes: [{
        'name': 'cid',
        'map': function(key, value, emit) {
          emit(value.CID);
        }
      },
      {
        'name': 'host_class_room',
        'map': function(key, value, emit) {
          emit([value.HostID, value.EducationClassID, value.Room]);
        }
      },
      {
        'name': 'host_cid',
        'map': function(key, value, emit) {
          emit([value.HostID, value.CID]);
        }
      },
    ]
  },
  'edu_students': {
    attributes: [{
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }]
  },
  'course': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'host_year_semester',
      'map': function(key, value, emit) {
        emit([value.HostID, value.AcademicYear, value.Semester]);
      }
    }]
  },
  'coursevsroom': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'educationclass_room',
      'map': function(key, value, emit) {
        emit([value.EducationClass, value.Room]);
      }
    }]
  },
  'coursevscid': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }]
  },
  'coursevsstaff': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'staffid',
      'map': function(key, value, emit) {
        emit([value.Staff_id]);
      }
    }]
  },
  'knowledgestructure': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.schooltimeid]);
      }
    }]
  },
  'indicatordata': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }, {
      'name': 'grade',
      'map': function(key, value, emit) {
        emit([value.Grade]);
      }
    }]
  },
  'examratio': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.schooltimeid]);
      }
    }]
  },
  'subject': {
    attributes: [{
      'name': 'subjectid',
      'map': function(key, value, emit) {
        emit([value.SubjectID]);
      }
    }]
  },
  'readthinkwritedata': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }]
  },
  'desirecharacteristicdata': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }]
  },
  'courseattend': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }]
  },
  'studentattend': {
    attributes: [{
      'name': 'schooltimeid',
      'map': function(key, value, emit) {
        emit([value.SchoolTimeID]);
      }
    }, {
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }, {
      'name': 'id',
      'map': function(key, value, emit) {
        emit([value.Id]);
      }
    }]
  },
  'teacher': {
    attributes: [{
      'name': 'hostid_staff_id',
      'map': function(key, value, emit) {
        emit([value.hostid,value.staff_id]);
      }
    }]
  },
  'morning': {
    attributes: [{
      'name': 'id',
      'map': function(key, value, emit) {
        emit([value.id]);
      }
    }, {
      'name': 'host_year_semester_class_room',
      'map': function(key, value, emit) {
        emit([value.HostID, value.YEAR, value.Semester, value.EducationClassID,value.Room]);
      }
    }]
  },
  'morningdetail': {
    attributes: [{
      'name': 'id',
      'map': function(key, value, emit) {
        emit([value.id]);
      }
    }, {
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }]
  },
  'weighheight': {
    attributes: [{
      'name': 'cid',
      'map': function(key, value, emit) {
        emit([value.CID]);
      }
    }]
  },
  'hostconfig': {
    attributes: [{
      'name': 'host_year_semester',
      'map': function(key, value, emit) {
        emit([value.HostID,value.AcademicYear,value.Semester]);
      }
    }]
  }
};

module.exports.port = '8083';
module.exports.apikey = 'test12345';
module.exports.db_path = './databases_index';
module.exports.session_key = 'test123456';
module.exports.azure_blob_accessKey = 'BrHP+BhvmKROuKhM/fjojgn6zggBZrFGEZ3+Ma1MfzFW8wp3FpLVxjXrehQFaZrIAzdGlXZJzyNaXT7aj6FKAQ==';
module.exports.azure_blob_accountName = 'nuqlis';
administrator@ubuntu:~/git/leveldb_rest$ cat copy_to_index.js
var levelup = require('levelup');
var subindex = require('leveldb-index');
var fs = require('fs');

var copy = function(src,tar,cb) {
  var count = 0;
  var end = false;
  var records = 0;
  var copying = false;
  src.createReadStream().on('data',function(data) {
    copying = true;
    count++;
    records++;
    console.log(records);
    tar.put(data.key,data.value,function(err,result) {
      count--;
      if(count===0 && end) {
        cb();
      }
    });
  }).on('end',function() {
    if(!copying) {
      cb();
    } else {
      console.log('Total:',records);
      end=true;
    }
  });
}

var count = function(db,cb) {
  var count = 0;
  db.createReadStream().on('data',function(data) {
     count++;
  }).on('end',function() {
     cb(count);
  });
}


var clone = function(dir_src,dir_dest,file_name,cb) {
  var src_db = levelup('./'+dir_src+'/'+file_name,{valueEncoding:'json'});
  var _tar = levelup('./'+dir_dest+'/'+file_name,{valueEncoding:'json'});
  var tar_db = subindex(_tar);

  console.log('Copying From',file_name);

  copy(src_db,tar_db,function() {
    console.log('done!');
    count(tar_db,function(records) {
      console.log('',records,'in '+file_name);
      cb();
    });
  });
};


var db_dir = 'databases';

var sync = function(dir_src,dir_dest,list,cb) {
  var file = list.pop();
  if(!file) {
    cb();
  } else {
    clone(dir_src,dir_dest,file,function() {
      sync(dir_src,dir_dest,list,cb);
    });
  }
}

/*
fs.readdir('./'+db_dir,function(err,files) {
  sync(db_dir,db_dir+'_index',files,function() {
    console.log('---> Done');
  });
});
*/
var db_dir = 'databases';
var files = ['knowledgestructure'];

sync(db_dir,db_dir+'_index',files,function() {
  console.log('---> Done');
});
