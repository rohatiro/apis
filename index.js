var express, server, bodyparser, swig;

express = require("express");
bodyparser = require("body-parser");
swig = require("swig");

server = express();

server.engine("html", swig.renderFile);
server.set("view engine", "html");
server.set("views",".");

server.use(express.static("."));
server.use(bodyparser.urlencoded({extended:true}));
server.use(bodyparser.json());

server.get("/", function(req, res) {
	res.render("index");
});

server.listen(8000);