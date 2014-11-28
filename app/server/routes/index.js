module.exports = function(server,passport) {
	var site;

	site = require("./site");

	var isLoggedg = function(req,res,next) {
		if (req.isAuthenticated())
			return next();
		else
			res.redirect("/auth/github");
	};

	var isLoggeds = function(req,res,next) {
		if (req.isAuthenticated())
			return next();
		else
			res.redirect("/auth/soundcloud");
	};

	passport.serializeUser(function(user,done) {
		done(null,user);
	});

	passport.deserializeUser(function(user,done) {
		done(null,user);
	});

	server.get("/", site.home);
	server.get("/soundcloud", site.soundcloud);
	server.get("/soundcloud/login", passport.authenticate('soundcloud',{successRedirect:"/soundcloud",failureRedirect:"/"}));
	server.get("/soundcloud/player", site.player);
	server.get("/soundcloud/tracks/:id", site.stream);
	server.get("/soundcloud/waveform", site.waveform);
	server.get("/github",isLoggedg, site.github);
	server.get("/github/login", passport.authenticate('github',{successRedirect:"/github",failureRedirect:"/"}));
	server.get("/auth/github",passport.authenticate('github',{"scope":["user","repo"]}));
	server.get("/auth/soundcloud",passport.authenticate('soundcloud'));
};