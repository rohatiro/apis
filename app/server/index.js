module.exports = function(server) {
	var bodyparser,swig,path,express,routes;

	express = require("express");
	bodyparser = require("body-parser");
	swig = require("swig");
	path = require("path");
	routes = require("./routes");

	var rootdir,appdir,serverdir,clientdir,viewdir,assetsdir;

	rootdir = path.resolve(__dirname,"./../../");
	appdir = path.resolve(rootdir,"./app");
	serverdir = path.resolve(appdir, "./server");
	clientdir = path.resolve(appdir,"./client");
	viewdir = path.resolve(serverdir,"./views");
	assetsdir = path.resolve(clientdir,"./assets");

	server.engine("html", swig.renderFile);
	server.set("views",viewdir);
	server.set("view engine", "html");

	server.use(express.static(assetsdir));
	server.use(bodyparser.urlencoded({extended:true}));
	server.use(bodyparser.json());

	routes(server);

	server.listen(8000);
};