
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var routes = require("./controller/article-controller")
var exphbs = require("express-handlebars");


var PORT = process.env.PORT || 3002;
var app = express();

// for logging requests, this shows up in the console
app.use(logger("dev"));
//for form submissions
app.use(bodyParser.urlencoded({extented: true}));

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// makes public folder th static directory
app.use(express.static("public"));

//handles all the routes
app.use(routes);

app.listen(PORT, function(){
  console.log("App is running on port: " + PORT)
})