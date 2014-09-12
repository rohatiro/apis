var express, server, bodyparser, swig, path;

express = require("express");
bodyparser = require("body-parser");
swig = require("swig");
path = require("path");

var rootdir,appdir,serverdir,clientdir,viewdir,assetsdir;

rootdir = path.resolve(__dirname,".");
appdir = path.resolve(rootdir,"./app");
serverdir = path.resolve(appdir, "./server");
clientdir = path.resolve(appdir,"./client");
viewdir = path.resolve(serverdir,"./views");
assetsdir = path.resolve(clientdir,"./assets");

server = express();

server.engine("html", swig.renderFile);
server.set("view engine", "html");
server.set("views",viewdir);

server.use(express.static(assetsdir));
server.use(bodyparser.urlencoded({extended:true}));
server.use(bodyparser.json());

server.get("/", function(req, res) {
	res.render("index");
});

server.listen(8000);