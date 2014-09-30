module.exports = function() {
	var path;
	
	path = require("path");

	var rootdir,appdir,clientdir,serverdir,assetsdir,routesdir,apisdir,viewsdir;

	rootdir = path.resolve(__dirname,"./../../../");
	appdir = path.resolve(rootdir,"./app");
	clientdir = path.resolve(appdir,"./client");
	serverdir = path.resolve(appdir,"./server");
	assetsdir = path.resolve(clientdir,"./assets");
	routesdir = path.resolve(serverdir,"./routes");
	apisdir = path.resolve(serverdir,"./apis");
	viewsdir = path.resolve(serverdir,"./views");

	return {
		root:rootdir,
		app:appdir,
		client:clientdir,
		server:serverdir,
		assets:assetsdir,
		routes:routesdir,
		apis:apisdir,
		views: viewsdir
	};
};