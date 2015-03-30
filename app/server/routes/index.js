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
			res.redirect("/soundcloud");
	};

	var validWebAudioAPI = function(req,res,next) {
		var ua = req.headers["user-agent"];
		var rex = new RegExp(/AppleWebKit\/([0-9]{3})/g);
		var match = ua.match(rex);
		if(!match) {
			req.webaudio = false;
		} else if(req.user) {
			req.webaudio = "logged";
		} else {
			req.webaudio = "anonymous";
		}
		next();
	};

	passport.serializeUser(function(user,done) {
		done(null,user);
	});

	passport.deserializeUser(function(user,done) {
		done(null,user);
	});

	server.get("/", site.home);
	server.get("/test", site.test);
	server.get("/soundcloud", validWebAudioAPI, site.soundcloud);
	server.get("/soundcloud/favorites", isLoggeds, site.favorites);
	server.get("/soundcloud/login", passport.authenticate('soundcloud',{successRedirect:"/soundcloud",failureRedirect:"/"}));
	server.get("/soundcloud/player", site.player);
	server.get("/soundcloud/tracks/:id", site.stream);
	server.get("/soundcloud/waveform", site.waveform);
	server.get("/github",isLoggedg, site.github);
	server.get("/github/login", passport.authenticate('github',{successRedirect:"/github",failureRedirect:"/"}));
	server.get("/auth/github",passport.authenticate('github',{"scope":["user","repo"]}));
	server.get("/auth/soundcloud",passport.authenticate('soundcloud'));
};