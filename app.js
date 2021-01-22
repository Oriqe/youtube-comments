var express = require("express");
var path = require("path");
var routes = require("./routes")
var app = express();

app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'resources')))
app.set("view engine", "pug")

app.use(routes)



app.listen(app.get("port"), function(){
  console.log('The server is available at http://127.0.0.1:3000/')

})
