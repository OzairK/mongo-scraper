
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose")

//using request and cheerio for scraping
var request = require("request");
var cheerio = require("cheerio");

var db= require("./models")
var PORT = process.env.PORT || 3001;
var app = express();

// for logging request, this shows up in the console
app.use(logger("dev"));
//for form submissions
app.use(bodyParser.urlencoded({extented: true}));

// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// makes public folder th static directory
app.use(express.static("public"));
// conecting to Mongo DB

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get("/" ,function(req,res){
  res.render("index")
})

// this is the get route to scrap data
app.get("/scrape", function(req, res){
    
    // Make a request call to grab news title, link, and summary from npr site
request("https://www.npr.org/sections/news/", function(error, response, html) {

    // Loading the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands 
    var $ = cheerio.load(html);
  
    $("div.item-info").each(function(i, element) {
      var result = {};
  
      result.title = $(element).children("h2.title").children("a").text();
      result.link = $(element).children("h2.title").children("a").attr("href");
      result.summary = $(element).children("p.teaser").children("a").text();
  
      // pushing results into database
      db.Article.create(result)
      .then(function(dbArticle){
        console.log(dbArticle)
      })
      .catch(function(err){
        return res.json(err)
      })
    });
  
    res.send("scrape complete")
  });
})


app.get("/articles", function(req,res){
  db.Article.find({})
  .then(function(dbArticles){
    //sending all articles found from database
    res.json(dbArticles)
  })
  .catch(function(err){
    res.json(err)
  })
})

app.get("/articles/:id", function(req,res){
  db.Article.findOne({_id: req.params.id})
  .populate("note")
  .then(function(dbArticles){
    res.json(dbArticles)
  })
  .catch(function(error){
    res.json(error)
  });
})

app.post("/articles/:id", function(req,res){
  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({_id: req.params.id}, {note:dbNote._id}, {new:true} );
  })
  .catch(function(error){
    res.json(error)
  })
})

app.listen(PORT, function(){
  console.log("App is running on port: " + PORT)
})