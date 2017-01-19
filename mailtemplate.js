var config = require('./config');

module.exports = {
  _resetpassmail : function(nameWithoutTitle, user, pass){
  return  '<div> \
            <div style="background-color:#f4f4f4; padding:20px">\
              <div style="max-width:600px; margin:0 auto">\
                <div style="background:#fff; font:14px sans-serif; color:#737373; border-top:4px solid #17aa1c; margin-bottom:20px">\
                  <div style="border-bottom:1px solid #f4f4f4; padding:10px 30px">\
                    <p style="color:#333333"><b>แจ้ง password ใหม่ </b></p>\
                  </div>\
                  <div style="padding:20px 30px">\
                    <table cellpadding="0" cellspacing="0" width="100%" style="border-bottom:1px solid #f4f4f4; padding-bottom:20px; margin-bottom:20px">\
                      <tbody>\
                        <tr>\
                          <td style="width:65px"><img src="' + config.webdomain + 'pic/obec.jpg" width="50" height="50" style="display:block; margin-right:15px"> </td>\
                          <td style="vertical-align:top; color:#737373 ;vertical-align:middle" >\
                             <p style="margin:0; line-height:1.3em">เรียนคุณ ' + nameWithoutTitle + ' </p>\
                          </td>\
                        </tr>\
                      </tbody>\
                    </table>\
                    <div style="border-bottom:1px solid #f4f4f4; padding-bottom:3px; margin-bottom:20px; font-size:16px; line-height:1.5em">\
                      <p></p>\
                      <p>Username และ Password ใหม่สำหรับการเข้าใช้งานระบบของคุณคือ </p>\
                      <p>username : ' + user + ' </p>\
                      <p>password : ' + pass + ' </p>\
                      <p>----------------------------------------------------------------------</p>\
                      <p>ระบบคัดกรองนักเรียนยากจน</p>\
                    </div>\
                  </div>\
                </div>\
              </div>\
            </div>\
          </div>';
  }
}

