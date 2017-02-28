var express = require('express');
var port = process.env.PORT || 3000
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs');
var mongodb = require('mongodb');
var scraperjs = require('scraperjs');
// mongodb://<dbuser>:<dbpassword>@ds153609.mlab.com:53609/sonali
var collections = ["users", "urldata", "bookmark", "bookmarkportfolio"]
var db = mongojs('mongodb://username:passcode@dsnumber.mlab.com:number/databasename', collections)
var app = express();
var ObjectId = mongojs.ObjectId;
var session = require('client-sessions');

var JSFtp = require("jsftp");
var fs = require('fs');
var config = {
  host: 'ftp.*************.com',
  port: 21,
  user: '***********',
  password: '*************'
}
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
// smtp.sendgrid.net
// smtp.gmail.com
var smtpTransport = nodemailer.createTransport(smtpTransport({
    host : "smtp.gmail.com",
    secureConnection : false,
    port: 587,
    auth : {user : "shubham20.yeole@gmail.com", pass : "********************"}
}));
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
