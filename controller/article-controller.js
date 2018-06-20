var mongoose = require("mongoose")
var bodyParser = require("body-parser");
var express = require("express");
var router = express.Router();
//using request and cheerio for scraping
var request = require("request");
var cheerio = require("cheerio");

var db= require("../models")



// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



router.get("/" ,function(req,res){
  res.render("index")
})

router.get("/saved", function(req,res){
  res.render("saved");
})

// this is the get route to scrap data
router.get("/scrape", function(req, res){
    
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
      result.save = false;
  
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


router.get("/articles", function(req,res){
  db.Article.find({})
  .then(function(dbArticles){
    //sending all articles found from database
    res.json(dbArticles)
  })
  .catch(function(err){
    res.json(err)
  })
})

router.get("/articles/:id", function(req,res){
  console.log(req.params.id);
  db.Note.find({article: req.params.id})
  .then(function(dbArticles){
    res.json(dbArticles)
  })
  .catch(function(error){
    res.json(error)
  });
})

//creating a new note in db and updating reference in the Articles DB 
router.post("/articles/:id", function(req,res){
  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Note.findOneAndUpdate({_id: dbNote._id}, {article:req.params.id}, {new:true} );//{new:true}
  })
  .catch(function(error){
    res.json(error)
  })
})
router.post("/savethisarticle/:id", function(req,res){
  db.Article.findOneAndUpdate({_id: req.params.id}, {artsave:true})
  .then(function(dbNote){
    res.json(dbNote)
  })
  .catch(function(error){
    res.json(error)
  })
})

router.delete("/deletethisnote/:id", function(req,res){
  db.Note.deleteOne({_id: req.params.id})
  .then(function(){
    res.send()
  })
  .catch(function(error){
    res.json(error)
  })
})

//deletes article and all notes associated with it
router.delete("/deletethisarticle/:id", function(req,res){
  db.Note.deleteMany({article: req.params.id})
  .then(function(){
    db.Article.deleteOne({_id:req.params.id})
    .then(function(){
      res.send();
    })
    .catch(function(err){
      console.log(err);
    })
  })
  .catch(function(error){
    res.json(error)
  })
})

module.exports= router;