var express = require('express');
var port = process.env.PORT || 3000
var bodyParser = require('body-parser');
var path = require('path');
var mongojs = require('mongojs')
var mongodb = require('mongodb')
var collections = ["users"]
var db = mongojs('mongodb://sonalipatil:sonalipatil@ds153609.mlab.com:53609/sonali', collections)
var app = express();
var ObjectId = mongojs.ObjectId;
var session = require('client-sessions');

var JSFtp = require("jsftp");
var fs = require('fs');
var config = {
  host: 'ftp.byethost7.com',
  port: 21,
  user: 'b8_19205430',
  password: 's'
}

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname)));
// body parser middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: false}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname)));

app.use(function(req, res, next) {
  if (req.session && req.session.users) {
    db.users.findOne({ email: req.session.users.email }, function(err, users) {
      if (users) {
          req.users = users;
          req.notifications = notifications;
          delete req.users.password; // delete the password from the session
          req.session.users = users;  //refresh the session value
          res.locals.users = users;
          next();
      }
    });
  } else {
    var users1 = {fullname: 'Anonymous', email: 'N/A', date: 'N/A', password: 'N/A',}
      res.locals.users = users1;
      next();
  }
});
function requireLogin (req, res, next) {
  if (!req.users) {
      res.render("message.ejs",{status: 'a', message: 'Sorry... Login required.', link: ''});
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
app.get('/logout/', function(req, res) {
  req.session.reset();
  res.redirect('/');
});
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
})

var multiparty = require('connect-multiparty'),
  multipartyMiddleware = multiparty();
  app.use(multipartyMiddleware);
    app.use(function(req, res, next){
      fs.appendFile('logs.txt', req.path + "token:" + req.query.access_token+'', 
        function(err){
          next(); 
  });
});

app.get('/', function(req, res){
  if(req.session.users==null){
    res.render("login.ejs", {message: "message"});
  }else{
    res.redirect("/dashboard");
  }   
});

app.get('/dashboard', function(req, res){
  res.render("dashboard.ejs");
});

app.post('/request', function(req, res){ 
  var fullname = req.body.fullname;
  var email = req.body.email;
  var password = req.body.password;
  var newUser = {fullname: fullname, email: email, password: password, status: false}
  db.users.findOne({ email: email }, function(err, users) {
    if (!users) {  
      db.users.insert(newUser, function(err, newUser){
        res.render("login.ejs",{message: "Please wait for Justin to approve"});
      });
    }else{
      if(users.status === false) message = "You are registered but not approved by the Admin.";
      else message = "You are registered. Try login.";
      res.render("login.ejs",{message: message});
    }
  });
});

app.post('/login', function(req, res){
  db.users.findOne({ email: req.body.email }, function(err, users) {
    if (!users) {
      message = 'Seems like you are new user. Please request access and wait for admin to approve the request.'; 
      res.render("login.ejs", {message: message});
    } else {
      if (req.body.password === users.password && users.status === true) {
        req.session.users = users;
        res.redirect("/dashboard");
      } else {
        if (users.status === false) {
          message = 'You are registered but admin access unavailable. Contact admin for more information...';
          res.render("login.ejs", {message: message});
        }else{
          message = 'Incorrect Login...';
          res.render("login.ejs", {message: message});
        }
      }
    }
  });     
});

app.post('/reset', function(req, res){      
  res.render("login.ejs", {message: "Reset Password"});
});

var scraperjs = require('scraperjs');
app.post('/savebulkurl', function(req, res){       
  var dataoflink = "";
  var bulkurl = req.body.bulkurl;
  var urlarray = bulkurl.split(" ");
  for(i=0; i<urlarray.length; i++){
    var url = urlarray[i];
    console.log(url);
  scraperjs.StaticScraper.create(url)
    .scrape(function($) {
        var title = $("title").text();
        var body = $("p").text()+$("a").text()+$("span").text()+$("div").text();
        var email = extractEmails(body); if(email===null) email = "Not Found";
        var phone = extractPhone(body); if(phone===null) phone = "Not Found";
        var newData = {postedby: req.session.fullname,url: url, title: title, body: body, email: email, phone: phone}
        db.urldata.insert(newData, function(err, newData){});
        return body;
    })
    .then(function(news) {
      if(news.includes("the")) console.log("found");
      else console.log("Not found");

    })
  }
  res.send("done");
});
var g = " 732-219-1850 hello";
console.log("Extract Phone result: "+extractPhone(g))
function extractPhone (text){
    return text.match(/^\s*(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*)?((\d{3})[-. ]*(\d{2,4})(?:[-.x ]*(\d+))?)\s*$/gm);
}

function extractEmails (text){
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

app.post('/getmatch', function(req, res){   
  var skills = req.body.skills;
  db.resume.find(function (err, resumeContent) {
    res.send(resumeContent);    
  });
});

var LP = require('linkedin-public-profile-parser');
var url = 'https://uk.linkedin.com/in/simonlab';
LP(url, function(err, data){
  console.log(JSON.stringify(data, null, 2)); // see below for sample output JSON 
})

app.post('/upload', function(req, res){       
  var file = req.files.file;
  var filepath = file.path;
  var fullname = req.body.fullname;
  var email = req.body.email;
  var timestamp = new Date().valueOf();
  var Client = require('ftp');
  var date = new Date();
  var datetime = (date.getMonth()+1)+" / "+date.getDate()+" / "+date.getFullYear()+" at "+date.getHours()+":"+date.getMinutes();
  let PDFParser = require("pdf2json");
  let pdfParser = new PDFParser(this,1);
  pdfParser.loadPDF(file.path);         

  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
  pdfParser.on("pdfParser_dataReady", pdfData => {
  var resumeContent = pdfParser.getRawTextContent();
      var c = new Client();
      c.on('ready', function() {
        c.put(file.path, 'htdocs/resume/shubham-resume-selector-project-'+timestamp+"-"+file.originalFilename, function(err) {
          if (err) throw err;
          c.end();
        });
      });
      c.connect(config);
      var resumeurl = 'http://shubhamyeole.byethost8.com/resume/shubham-resume-selector-project-'+timestamp+"-"+file.originalFilename;
      var newResume = {
        fullname: fullname,
        email: email,
        filename: file.originalFilename,
        resume: resumeurl,
        timestamp: timestamp,
        datetime: datetime,
        resumetext: resumeContent
      }
      db.resume.insert(newResume, function(err, result){
        if(err){console.log(err);}
         db.resume.find(function (err, resume) {
            res.render("index.ejs", {message:"Thank you for submitting your Resume. We will review your application and contact you shortly.", resumecount: resume.length});
          })        
        });
      });   
});

app.post('/upload2', function(req, res){       
  var file = req.files.file;
  var filepath = file.path;
  var timestamp = new Date().valueOf();
  var Client = require('ftp'); 
  var c = new Client();
    c.on('ready', function() {
      c.put(file.path, 'htdocs/public_html/career/'+file.originalFilename, function(err) {
        if (err) throw err;
         c.end();
        });
   });
   c.connect(config);
   res.redirect("/");     
});

// in stdout.log: count 5

app.post('/addloc', function(req, res){
var date = new Date();
var datetime = date.getMonth()+1+"/"+date.getDate()+"/"+date.getFullYear()+" at "+date.getHours()+":"+date.getMinutes();
var long = req.body.long;
var lat = req.body.lat;
var whatdone = req.body.task;
console.log(long);
var lat_1 = Number(lat)-0.000203;
var lat_2 = Number(lat)+0.000203;
var long_1 = Number(long)-0.00070989999;
var long_2 = Number(long)+0.00070989999;     
db.locations.findOne({
       $and : [
          { $and : [ { lat : { $gt: lat_1} }, { lat : { $lt: lat_2} } ] },
          { $and : [ { long: { $gt: long_1} }, { long : { $lt: long_2} } ] }
      ]
      }, function(err, location) {
      if (!location) {
        var newLoc = {
          visittime: 1,
          re_c: 0,
          tt_c: 0,
          bb_c: 0,
          rs_c: 1,
          mm_c: 0,
          re_task: "",
          tt_task: "",
          bb_task: "",
          rs_task: whatdone+" ("+datetime+")",
          mm_task: "",
          long: Number(long),
          lat: Number(lat)
        }
        db.locations.insert(newLoc, function(err, result){
        if(err){console.log(err);}
        res.send("INSERTED");
        });
      }else {
        var count = location.visittime+1;
        var cc = location.rs_c+1;
        whatdone = whatdone+" ("+datetime+"),"+location.rs_task;
        db.locations.update({_id: location._id},{$set : {"visittime": count, "rs_c": cc, "rs_task": whatdone}},{upsert:true,multi:false});
        res.send("UPDATED: "+count);
      }
  });
});

// This method is ADMIN SIDE METHOD
app.get('/visitormap', function(req, res){  
var pageno = Number(0);  
  db.locations.find(function (err, locs) {
      res.render("visitormap.ejs",{locs: locs});
  })
});
app.post('/searchLocation', function(req, res) {
  var id = req.body.id;
  var ObjectID = require('mongodb').ObjectID;
  var o_id = new ObjectID(id);
   db.locations.findOne({ '_id': o_id}, function (err, location) {
    res.send(location);
  });
});
app.listen(port, function() {
  console.log('Listening on port ' + port)
})
app.post('/tmf', function(req, res){       
  var file = req.files.file;
  for(i=0;i<file.length; i++){
    console.log(file[i].path+""+file[i].originalFilename);
  }
  res.send("done");
});