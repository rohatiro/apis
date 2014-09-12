module.exports = function(server) {
	var site;

	site = require("./site");

	server.get("/", site.home);
};