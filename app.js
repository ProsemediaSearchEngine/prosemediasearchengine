var express = require('express');
var port = process.env.PORT || 3001
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs');
var mongodb = require('mongodb');
var scraperjs = require('scraperjs');
// mongodb://<dbuser>:<dbpassword>@ds153609.mlab.com:53609/sonali
var collections = ["users", "urldata", "bookmark", "bookmarkportfolio", "demos"]
var db = mongojs('mongodb://prosemedia:prosemedia@ds027145.mlab.com:27145/prosemedia', collections)
var app = express();
var ObjectId = mongojs.ObjectId;
var session = require('client-sessions');
var Client = require('ftp');

var cors = require('cors');
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}


var JSFtp = require("jsftp");
var fs = require('fs');
var config = {
  host: 'ftp.byethost7.com',
  port: 21,
  user: 'b7_19750162',
  password: 'prosemedia12'
}
var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
// smtp.sendgrid.net
// smtp.gmail.com
var smtpTransport = nodemailer.createTransport(smtpTransport({
  host: "smtp.sendgrid.net",
  secureConnection: false,
  port: 587,
  auth: { user: "apikey", pass: "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" }
}));
function sendEmail(email, subject, title, message) {
  var emailBody = '<html><body style="padding:40px;"><header style="background-color: #2196F3; padding: 10px !important; margin:0px !important;"><h1 style="color: #E3F2FD; text-align:center">Prosemedia Search Result</h1></header><div><div style="padding: 3%;"><br><h1>[TITLE]</h1><br>[MESSAGE]<br><br><br>Best, Prosemedia team,<br><br><br><br></div><footer style="background-color: #2196F3; padding: 3px !important; margin:0px !important;color: #E3F2FD; text-align: center; padding: 2%;">&#169; 2017 prosemedia(dot)com. All Rights Reserved.</footer></body></html>';
  emailBody = emailBody.replace("[TITLE]", title);
  emailBody = emailBody.replace("[MESSAGE]", "Hello " + email + "<br><br> " + message + "");
  var mailOptions = { from: "prosemedia.se@gmail.com", to: email, subject: subject, text: "Your Text", html: emailBody, }
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(response);
    }
  });
}

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname)));
// body parser middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname)));

app.use(function (req, res, next) {
  if (req.session && req.session.users) {
    User.findOne({ email: req.session.users.email }, function (err, users) {
      if (users) {
        req.users = users;
        delete req.users.password; // delete the password from the session
        req.session.users = users;  //refresh the session value
        res.locals.currentuser = users;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

app.use(function (req, res, next) {
  res.locals.session = req.session
  res.locals.currentuser = req.user;
  next();
})

function requireLogin(req, res, next) {
  if (!req.session.users) {
    res.render("login.ejs", { message: 'Sorry... Login required.' });
  } else {
    next();
  }
};

app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));
app.get('/logout/', cors(), function (req, res, next) {
  req.session.reset();
  res.redirect('/');
});


var multiparty = require('connect-multiparty'),
  multipartyMiddleware = multiparty();
app.use(multipartyMiddleware);
app.use(function (req, res, next) {
  fs.appendFile('logs.txt', req.path + "token:" + req.query.access_token + '',
    function (err) {
      next();
    });
});

app.get('/', cors(), function (req, res, next) {
  if (req.session.users == null) {
    res.render("login.ejs", { message: "LOGIN PAGE" });
  } else {
    res.redirect("/dashboard");
  }

  next();
});

app.get('/index', cors(), function (req, res, next) {
  if (req.session.users == null) {
    res.render("index.ejs", { message: "message" });
  } else {
    res.redirect("/dashboard");
  }
});

app.get('/demo', cors(), function (req, res, next) {
  db.demos.find({}, function (err, demos) {
    res.render("demo.ejs", { demos: demos });
  });
});

app.post('/uploadDemo', cors(), function (req, res, next) {
  var topic = req.body.topic;
  var democode = req.body.democode;
  var demodescription = req.body.demodescription;
  var html = req.body.html;
  var js = req.body.js;
  var css = req.body.css;
  var newDemo = { topic: topic, democode: democode, demodescription: demodescription, html: html, js: js, css: css }
  db.demos.insert(newDemo, function (err, newDemo) {
    res.redirect("/demo");
  });
});

app.post('/updateDemo', cors(), function (req, res, next) {
  var id = req.body.id;
  var coloumn = req.body.coloumn;
  var text = req.body.text;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  if (coloumn === "topic") db.demos.update({ '_id': o_id }, { $set: { "topic": text } }, { upsert: true, multi: false });
  if (coloumn === "democode") db.demos.update({ '_id': o_id }, { $set: { "democode": text } }, { upsert: true, multi: false });
  if (coloumn === "demodescription") db.demos.update({ '_id': o_id }, { $set: { "demodescription": text } }, { upsert: true, multi: false });
  if (coloumn === "html") db.demos.update({ '_id': o_id }, { $set: { "html": text } }, { upsert: true, multi: false });
  if (coloumn === "js") db.demos.update({ '_id': o_id }, { $set: { "js": text } }, { upsert: true, multi: false });
  if (coloumn === "css") db.demos.update({ '_id': o_id }, { $set: { "css": text } }, { upsert: true, multi: false });
  res.send("Done");
});


app.post('/request', cors(), function (req, res, next) {
  var fullname = req.body.fullname;
  var email = req.body.email;
  var password = req.body.password;
  var newUser = { fullname: fullname, email: email, password: password, photo: "images/defaultdp.jpg", status: false, admin: false, superadmin: false }
  db.users.findOne({ email: email }, function (err, users) {
    if (!users) {
      db.users.insert(newUser, function (err, newUser) {
        res.render("login.ejs", { message: "Please wait for Justin to approve" });
      });
    } else {
      if (users.status === false) message = "You are registered but not approved by the Admin.";
      else message = "You are registered. Try login.";
      res.render("login.ejs", { message: message });
    }
  });
});

app.post('/login', cors(), function (req, res, next) {
  db.users.findOne({ email: req.body.email }, function (err, users) {
    if (!users) {
      req.session.reset();
      message = 'Seems like you are new user. Please request access and wait for admin to approve the request.';
      res.render("login.ejs", { message: message });
    } else {
      if (req.body.password === users.password && users.status === true) {
        res.locals.users = users;
        req.session.users = users;
        req.session.users.loadmessage = "WELCOME " + users.fullname.toUpperCase();
        res.redirect("/dashboard");
      } else {
        if (users.status === false) {
          message = 'You are registered but admin access unavailable. Contact admin for more information...';
          res.render("login.ejs", { message: message });
        } else {
          message = 'Incorrect Login...';
          res.render("login.ejs", { message: message });
        }
      }
    }
  });
});

app.post('/reset', cors(), function (req, res, next) {
  res.render("login.ejs", { message: "Reset Password" });
});

app.use(cors({ origin: '*' }));
app.get('/dashboard', cors(), function (req, res, next) {
  // If the user is not logged in, redirect them to the login page.
  if (req.session.users == null) {
    res.render("login.ejs", { message: "To view the dashboard, please log in." });
  }
  var ObjectID = require('mongodb').ObjectID;
  var o_id = req.session.users._id;
  // db.urldata.find({}).skip(0).sort({_id: -1}).limit(1).toArray(function (err, urldata) {
  db.bug.find({}).skip(0).sort({ _id: 1 }).toArray(function (err, bug) {
    db.urldata.find({}).skip(0).sort({ _id: -1 }).limit(1).toArray(function (err, urldata) {
      db.bookmark.find({ 'userid': o_id }, function (err, bookmark) {
        db.bookmarkportfolio.find({ 'userid': o_id }, function (err, bookmarkportfolio) {
          db.users.find({ status: false }, function (err, newusers) {
            db.users.find({}).skip(0).sort({ _id: -1 }).toArray(function (err, allusers) {
              res.render("dashboard.ejs", { allusers: allusers, currentuser: req.session.users, urldata: urldata, newusers: newusers, bookmark: bookmark, bookmarkportfolio: bookmarkportfolio, bug: bug });
            });
          });
        });
      });
    });
  });
});

app.post('/allurldata', cors(), function (req, res, next) {
  var page = req.body.page;
  var skip = 0;
  if (page) {
    skip = page * 10;
    var total_count = 0;
    // Get the total count in the collection.
    db.urldata.count(function (error, count) {
      total_count = count;
    });
    // Get and send the data back.
    db.urldata.find().skip(skip).sort({ _id: -1 }).limit(10).toArray(function (err, urldata) {
      res.send({ data: urldata, total_count: total_count });
    });
  }
  else {
    db.urldata.find({}).skip(0).sort({ _id: -1 }).toArray(function (err, urldata) {
      res.send(urldata);
    });
  }
});

app.post('/sendresultinemails', cors(), function (req, res, next) {
  var message = req.body.links;
  var email = req.body.email;
  var keyword = req.body.key;
  sendEmail(email, "Protfolios with " + keyword + " keyword", "Protfolios with " + keyword + " keyword", "We found below URLS with " + keyword + " keywords. <br>" + message);
  res.send(email);
});

app.post('/search', cors(), function (req, res, next) {
  var key = " " + req.body.keyword + " ";
  var result = "";
  db.urldata.find({ body: { '$regex': key, '$options': 'i' } }, function (err, documents) {
    res.send(documents);
  });
});

app.post('/removeurl', cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.urldata.remove({ '_id': o_id }, function (err, url) {
    res.send("Deleted");
  });
});

app.post('/deleteUser', cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.users.remove({ '_id': o_id }, function (err, deleteUser) {
    res.send("Deleted");
  });
});

app.post('/abortUser', cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.users.update({ '_id': o_id }, { $set: { "status": false } }, { upsert: true, multi: false });
  res.send("Deleted");
});


app.post('/updateComment', cors(), function (req, res, next) {
  var id = req.body.id;
  var comment = req.body.comment;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.urldata.update({ '_id': o_id }, { $set: { "comment": comment } }, { upsert: true, multi: false });
  res.send("Updated");
});

app.post('/updatePhone', cors(), function (req, res, next) {
  var id = req.body.id;
  var phone = req.body.phone;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.urldata.update({ '_id': o_id }, { $set: { "phone": phone } }, { upsert: true, multi: false });
  res.send("Updated");
});

app.post('/updateEmail', cors(), function (req, res, next) {
  var id = req.body.id;
  var email = req.body.email;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.urldata.update({ '_id': o_id }, { $set: { "email": email } }, { upsert: true, multi: false });
  res.send("Updated");
});

app.post('/updateStatus', cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.users.update({ '_id': o_id }, { $set: { "status": true } }, { upsert: true, multi: false });
  res.send("Updated");
});

app.post('/declineAccessRequest', cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.users.remove({ '_id': o_id });
  res.send("Updated");
});


app.post('/saveOtherBulkSite', cors(), function (req, res, next) {
  var dataoflink = "";
  var bulkurl = req.body.bulkurl;
  var name = req.session.users.fullname;
  var urlarray = bulkurl.split(" ");
  for (i = 0; i < urlarray.length; i++) {
    var url = urlarray[i];
    saveOtherBulkSite(url, name);
  }
  res.send("done");
});

app.post('/saveurlindividually', cors(), function (req, res, next) {
  var url = req.body.url;
  var name = req.session.users.fullname;
  saveOtherBulkSite(url, name);
  res.redirect("/");
});

function saveOtherBulkSite(url, name) {
  request(url, function (err, resp, body) {
    if (body) {
      $ = cheerio.load(body);
      links = $('p').text() + " " + $('span').text() + " " + $('a').text() + " " + $('h1').text() + " " + $('h2').text() + " " + $('h3').text() + " " + $('h4').text() + " " + $('h5').text(); //use your CSS selector here
      var data = links;

      data = data.split("\n").join(" ");
      data = data.split("\t").join(" ");
      // data = data.split("\u").join(" ");
      data = data.split("\r").join(" ");

      var title = $("title").text();
      // $(links).each(function(i, link){
      //   data = $(link).text();
      //   data = data.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
      // });
      if (name === "" || name === null) name = req.session.users.fullname;
      var email = extractEmails(data); if (email === null || email === "") email = "Update..";
      var phone = extractPhone(data); if (phone === null || phone === "") phone = "Update..";
      var newData = { postedby: name, url: url, title: title, body: data, email: email, phone: phone, comment: "No comments yet", stars: 0 }
      db.urldata.insert(newData);
    }
  });
}

function extractPhone(text) {
  return text.match(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm);
}

function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

app.post('/getmatch', cors(), function (req, res, next) {
  var skills = req.body.skills;
  db.resume.find(function (err, resumeContent) {
    res.send(resumeContent);
  });
});

app.post('/savepdfs', cors(), function (req, res, next) {
  var file = req.files.file;
  var timestamp = new Date().valueOf();
  var c = new Client();
  for (i = 0; i < file.length; i++) {
    var portfoliourl = 'http://prosemedia.byethost7.com/prosemedia/portfolios/prosemedia-' + timestamp + "-" + file[i].originalFilename;
    pdfparser(req.session.users.fullname, file[i].path, portfoliourl, file[i].originalFilename, timestamp);
  }
  res.redirect("/");
});

app.post('/uploadOnePdf', cors(), function (req, res, next) {
  var file = req.files.file;
  var timestamp = new Date().valueOf();
  var c = new Client();
  var portfoliourl = 'http://prosemedia.byethost7.com/prosemedia/portfolios/prosemedia-' + timestamp + "-" + file.originalFilename;
  pdfparser(req.session.users.fullname, file.path, portfoliourl, file.originalFilename, timestamp);
  res.redirect("/");
});

function uploadPDF(filepath, originalFilename, timestamp) {
  var Client = require('ftp');
  var c = new Client();
  c.on('ready', function () {
    c.put(filepath, 'htdocs/prosemedia/portfolios/prosemedia-' + timestamp + "-" + originalFilename, function (err) {
      if (err) throw err;
      c.end();
    });
  });
  c.connect(config);
}

function pdfparser(name, path, portfoliourl, originalFilename, timestamp) {
  let PDFParser = require("pdf2json");
  let pdfParser = new PDFParser(this, 1);
  pdfParser.loadPDF(path);
  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
  pdfParser.on("pdfParser_dataReady", pdfData => {
    var data = pdfParser.getRawTextContent();
    var extracturls = data.match(/\b(http|https)?(:\/\/)?(\S*)\.(\w{2,4})\b/ig);
    var email = extractEmails(data); if (email === null || email === '') email = "Update..";
    var phone = extractPhone(data); if (phone === null || phone === '') phone = "Update..";
    var newPortfolio = { postedby: name, url: portfoliourl, title: data.substring(5, 50), body: data, email: email, phone: phone, comment: "No comments yet", stars: 0 }
    db.urldata.insert(newPortfolio);
    uploadPDF(path, originalFilename, timestamp);
  });
}

app.post('/upload', cors(), function (req, res, next) {
  var file = req.files.file;
  var filepath = file.path;
  var fullname = req.body.fullname;
  var email = req.body.email;
  var timestamp = new Date().valueOf();
  var date = new Date();
  var datetime = (date.getMonth() + 1) + " / " + date.getDate() + " / " + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes();
  let PDFParser = require("pdf2json");
  let pdfParser = new PDFParser(this, 1);
  pdfParser.loadPDF(file.path);

  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
  pdfParser.on("pdfParser_dataReady", pdfData => {
    var resumeContent = pdfParser.getRawTextContent();
    var c = new Client();
    c.on('ready', function () {
      c.put(file.path, 'htdocs/resume/shubham-resume-selector-project-' + timestamp + "-" + file.originalFilename, function (err) {
        if (err) throw err;
        c.end();
      });
    });
    c.connect(config);
    var resumeurl = 'http://prosemedia.byethost7.com/resume/shubham-resume-selector-project-' + timestamp + "-" + file.originalFilename;
    var newResume = {
      fullname: fullname,
      email: email,
      filename: file.originalFilename,
      resume: resumeurl,
      timestamp: timestamp,
      datetime: datetime,
      resumetext: resumeContent
    }
    db.resume.insert(newResume, function (err, result) {
      if (err) { console.log(err); }
      db.resume.find(function (err, resume) {
        res.render("index.ejs", { message: "Thank you for submitting your Resume. We will review your application and contact you shortly.", resumecount: resume.length });
      })
    });
  });
});

app.post('/uploaddp', requireLogin, cors(), function (req, res, next) {
  var file = req.files.file;
  var filepath = file.path;
  var id = req.body.id;
  var Client = require('ftp');
  var c = new Client();
  c.on('ready', function () {
    c.put(file.path, 'htdocs/prosemedia/users/' + id + "-prosemedia-" + file.originalFilename, function (err) {
      if (err) throw err;
      c.end();
    });
  });
  c.connect(config);
  var dpurl = "http://prosemedia.byethost7.com/prosemedia/users/" + id + "-prosemedia-" + file.originalFilename;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  req.session.users.photo = dpurl;
  db.users.update({ '_id': o_id }, { $set: { "photo": dpurl } }, { upsert: true, multi: false });
  setTimeout(function () {
    res.redirect('/');
  }, 4000);
});

// This method is ADMIN SIDE METHOD
app.post('/searchLocation', cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.locations.findOne({ '_id': o_id }, function (err, location) {
    res.send(location);
  });
});

var request = require('request')
  , cheerio = require('cheerio');

app.get('/savebookmark/:key', requireLogin, cors(), function (req, res, next) {
  var key = req.params.key;
  req.session.users.loadmessage = key.toUpperCase() + " BOOKMARKED";
  var newBookMark = { userid: req.session.users._id, key: key.toUpperCase() }
  db.bookmark.insert(newBookMark);
  res.redirect("/");
});

app.post('/bookmarkthisportfolio/', requireLogin, cors(), function (req, res, next) {
  var url = req.body.url;
  var bookmarkportfolio = { userid: req.session.users._id, url: url }
  db.bookmarkportfolio.insert(bookmarkportfolio);
  res.send("done");
});
//

app.post('/deletethisportfolio', requireLogin, cors(), function (req, res, next) {
  var url = req.body.url;
  db.urldata.remove({ 'url': url }, function (err, url) {
    res.redirect("/");
  });
});

app.post('/deleteportfoliobookmark', requireLogin, cors(), function (req, res, next) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
  db.bookmarkportfolio.remove({ '_id': o_id }, function (err, url) {
    res.send("ok");
  });
});

app.get('/deleteallportfolios', requireLogin, cors(), function (req, res, next) {
  db.urldata.remove();
  res.redirect("/");
});

app.post('/uploaddbug', requireLogin, cors(), function (req, res, next) {
  var date = new Date();
  var datetime = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes();
  var file = req.files.file;
  var filepath = file.path;
  var description = req.body.description;
  var bug = req.body.bug;
  var timestamp = new Date().valueOf();
  var Client = require('ftp');
  var c = new Client();
  var bugurl = "";
  if (file.originalFilename != '') {
    c.on('ready', function () {
      c.put(file.path, 'htdocs/prosemedia/bug/' + timestamp + "-prosemedia-" + file.originalFilename, function (err) {
        if (err) throw err;
        c.end();
      });
    });
    c.connect(config);
    bugurl = "http://prosemedia.byethost7.com/prosemedia/bug/" + timestamp + "-prosemedia-" + file.originalFilename;
  } else {
    bugurl = "images/bug.jpg";
  }
  var newbug = { postedby: req.session.users.fullname, email: req.session.users.email, userid: req.session.users._id, bug: bug, description: description, bugurl: bugurl, datetime: datetime, status: "UN_SOLVED" }
  db.bug.insert(newbug);
  setTimeout(function () {
    res.redirect('/');
  }, 4000);
});

app.post('/changebugstatus', requireLogin, cors(), function (req, res, next) {
  var loginuserid = req.body.loginuserid;
  var uid = req.session.users._id;
  var bugid = req.body.bugid;
  var bugname = req.body.bugname.toUpperCase();
  var changebugstatus = req.body.changebugstatus;
  var dashboardmessage = "";
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(bugid);
  if (changebugstatus === "BWIP") {
    db.bug.update({ '_id': o_id }, { $set: { "status": "WORK_IN_PROGRESS" } }, { upsert: true, multi: false });
    dashboardmessage = "BUG NAME: " + bugname + " --> STATUS CHANGED TO WORK IN PROGRESSS";
  } else if (changebugstatus === "BS") {
    db.bug.update({ '_id': o_id }, { $set: { "status": "BUG_SOLVED" } }, { upsert: true, multi: false });
    dashboardmessage = "BUG NAME: " + bugname + " --> STATUS CHANGED TO BUG SOLVED";
  } else if (changebugstatus === "BD") {
    if (uid === loginuserid) {
      db.bug.remove({ '_id': o_id }, { multi: false });
      dashboardmessage = "BUG NAME: " + bugname + " --> BUG DELETED SUCCESSFULLY";
    } else {
      dashboardmessage = "BUG NAME: " + bugname + " --> SORRY... ONLY POSTER OF THIS BUG CAN DELETE THIS BUG.";
    }
  }
  req.session.users.loadmessage = dashboardmessage;
  res.redirect('/');
});

var ScrapeLinkedin = require("scrape-linkedin");
var scrapper = new ScrapeLinkedin();

// Handle an error

app.post('/saveLinkedInBulkSite', cors(), function (req, res, next) {
  var dataoflink = "";
  var bulkurl = req.body.bulkurl;
  var uploadername = req.session.users.fullname;
  var urlarray = bulkurl.split(" ");
  for (i = 0; i < urlarray.length; i++) {
    var linkedinname = formatLinkedinUrl(urlarray[i]);
    saveLinkedInSite(linkedinname, uploadername, urlarray[i]);
  }
  res.send("done");
});

function saveLinkedInSite(linkedinname, uploadername, url) {
  scrapper.fetch(linkedinname).then(function (profilee, err) {
    var body = JSON.stringify(profilee);
    body = body.split(",").join(" ");
    body = body.split('{').join(" ");
    body = body.split('}').join(" ");
    body = body.split('[').join(" ");
    body = body.split(']').join(" ");
    body = body.split('\t').join(" ");
    body = body.split('\n').join(" ");
    body = body.split('\ ').join(" ");
    body = body.split('\\').join(" ");
    body = body.split('"').join("");
    var newData = { postedby: uploadername, url: url, title: linkedinname + " Linkedin", body: body, email: "Update..", phone: 'Update..', comment: "No comments yet", stars: 0 }
    db.urldata.insert(newData);
  })
}

function formatLinkedinUrl(linkedinurl) {
  linkedinurl = linkedinurl.replace('https://www.linkedin.com/in/', '');
  var last = linkedinurl.length - 1;
  if (linkedinurl.charAt(last) === '/') { linkedinurl = linkedinurl.replace('/', '') }
  return linkedinurl;
}

app.post('/saveSiteText', cors(), function (req, res, next) {
  var url = req.body.url;
  var text = req.body.text;
  var name = req.session.users.fullname;
  var newData = { postedby: name, url: url, title: "Manually defined", body: text, email: "Update...", phone: "Update...", comment: "No comments yet", stars: 0 }
  db.urldata.insert(newData);
  req.session.users.loadmessage = "Recent activity: Portfolio text saved."
  res.redirect("/");
});

app.listen(port, function () {
  console.log('Listening on port ' + port)
});
