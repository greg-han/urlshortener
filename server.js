'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var dns = require('dns');
var isurl = require('is-url');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);
var Schema = mongoose.Schema;
var urlSchema = new Schema ({
   original_url : { type: String, required : true } ,
   short_url : { type : String, required : true}
})
var url = mongoose.model('url', urlSchema);
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
//Everytime someone does a post request (presses the submit button)
//run this function.
var urlparser = bodyParser.urlencoded({extended : false});
var jsonParser = bodyParser.json();
var postURL;
var uniqueID;
//var lookup;
//function urlValidator(req,res) {
 //dns.lookup(req.body.url, function(err){
  //    if(err){ return false }
  //    else { return true }
 //  }
 //}
app.post('/api/shorturl/new', urlparser, function (req, res, next) {
  if(!req.body) {res.sendStatus(400)};
  if(!isurl(req.body.url)) res.status(500).json({"error" : "invalid URL"});
  next();
},
function(req, res, done){
    uniqueID = shortid.generate();
    //this starts a new url DB object with a constructor and object as parameter
    //notice that the object MUST match the schema param for param
    postURL = url({ original_url : req.body.url, short_url : uniqueID});
    postURL.save(function(err,data) {
     if(err) done(err)
     done(null,data)
    });
  res.json({"original_url" : req.body.url , "short_url" : uniqueID });
});

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:short', function(req, res) {
  url.findOne( { 'short_url' : req.params.short },
  function(err, doc){
    if(doc)res.redirect(doc.original_url)
    else res.send("url not found: " + '<a href="/">Home</a>');
  });
});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});