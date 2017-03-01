var express = require('express');
var port = process.env.PORT || 3000
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs');
var mongodb = require('mongodb');
var scraperjs = require('scraperjs');
// mongodb://<dbuser>:<dbpassword>@ds153609.mlab.com:53609/sonali
var collections = ["users", "urldata", "bookmark", "bookmarkportfolio"]
var db = mongojs('***************************', collections)
var app = express();
var ObjectId = mongojs.ObjectId;
var session = require('client-sessions');
var Client = require('ftp');

var JSFtp = require("jsftp");
var fs = require('fs');
var config = {
  host: 'ftp.************.com',
  port: 21,
  user: '*************',
  password: '***************'
}
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
// smtp.sendgrid.net
// smtp.gmail.com
var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.sendgrid.net",
    secureConnection : false,
    port: 587,
    auth : {user : "*********", pass : "******************************"}
}));

function sendEmail(email, subject, title, message){
  var emailBody = '<html><body style="padding:40px;"><header style="background-color: #2196F3; padding: 10px !important; margin:0px !important;"><h1 style="color: #E3F2FD; text-align:center">Prosemedia Search Result</h1></header><div><div style="padding: 3%;"><br><h1>[TITLE]</h1><br>[MESSAGE]<br><br><br>Best, Prosemedia team,<br><br><br><br></div><footer style="background-color: #2196F3; padding: 3px !important; margin:0px !important;color: #E3F2FD; text-align: center; padding: 2%;">&#169; 2017 prosemedia(dot)com. All Rights Reserved.</footer></body></html>';
  emailBody = emailBody.replace("[TITLE]", title);
  emailBody = emailBody.replace("[MESSAGE]", "Hello "+email+"<br><br> "+message+"");
  var mailOptions={from : "prosemedia.se@gmail.com", to : email, subject : subject,  text : "Your Text", html : emailBody, }
      smtpTransport.sendMail(mailOptions, function(error, response){ 
        if(error){
          console.log(error);
        }else{
          console.log(response);
        }
      });
}

npm install -g nodemon
npm install --save-dev nodemon
npm install express --save
npm install body-parser --save
npm install path --save
npm install ejs --save
npm install mongojs --save
npm install mongodb --save
npm install jsftp --save
npm install fs --save
npm install connect-multiparty --save
npm install ftp --save
npm install pdf2json --save
npm install scraperjs --save
npm install linkedin-public-profile-parser --save
npm install client-sessions --save
npm install passport --save
npm install nodemailer --save
npm install cheerio --save
npm install linkedin-public-profile
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
npm install express --save
