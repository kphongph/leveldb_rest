var config = require('./config');

// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
var helper = require('sendgrid').mail

module.exports = {
  _sendmail: function( data, cb)  {
    var from_email = new helper.Email(data.from_email.email, data.from_email.name)
    var to_email = new helper.Email(data.to_email.email, data.to_email.name)
    var subject = data.subject
    var content = new helper.Content(data.content_type, data.content)
    var mail = new helper.Mail(from_email, subject, to_email, content)

    var sg = require('sendgrid')( config.sendgrid_apikey);
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    sg.API(request, function(error, response) {
      console.log('--API mail\n--',response);
      if(response.statusCode >=  200 && response.statusCode < 300 ){
        cb({
          status: true
        });
      }else{
        cb({
          status: false
        });
      }
    })
  }
};
