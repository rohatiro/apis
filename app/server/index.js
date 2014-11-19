module.exports = function(server) {
	var bodyparser,swig,express,routes,config,githubAPI,session,logger,extend;

	express = require("express");
	session = require("express-session");
	bodyparser = require("body-parser");
	swig = require("swig");
	logger = require("morgan");
	routes = require("./routes");
	config = require("./config")();
	extend = require("util")._extend;

	if(process.env.APIS_ENV==="development")
		extend(process.env,require(config.settings));

	githubAPI = require(config.apis)();

	server.engine("html", swig.renderFile);
	server.set("views",config.views);
	server.set("view engine", "html");

	server.use(express.static(config.assets));
	server.use(bodyparser.urlencoded({extended:true}));
	server.use(bodyparser.json());
	server.use(logger('combined'));
	server.use(session({ secret: "keyboard cat"}));
	server.use(githubAPI.initialize());
	server.use(githubAPI.session());

	routes(server,githubAPI);

	server.listen(process.env.PORT || 8000);
};