const express = require("express");
const path = require("path");
const routes = require("./routes")
const cluster = require('cluster');

const app = express();
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, 'resources')))
app.set("view engine", "pug")
app.use(routes)


const numCPUs = require('os').cpus().length


if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {

  app.listen(app.get("port"), function(){
    console.log('The server is available at http://127.0.0.1:3000/')
    console.log(`Worker ${process.pid} started`)
}
  )}

