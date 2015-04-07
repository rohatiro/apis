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
	server.get("/soundcloud", validWebAudioAPI, site.soundcloud);
	server.get("/soundcloud/login", passport.authenticate('soundcloud',{successRedirect:"/soundcloud",failureRedirect:"/"}));
	server.get("/soundcloud/tracks/:id", isLoggeds, site.stream);
	server.get("/soundcloud/tracks/:id/info", isLoggeds, site.songinfo);
	server.get("/soundcloud/player", validWebAudioAPI, isLoggeds, site.player);
	server.get("/soundcloud/favorites", validWebAudioAPI, isLoggeds, site.favorites);
	server.get("/soundcloud/waveform", site.waveform);
	server.get("/github",isLoggedg, site.github);
	server.get("/github/login", passport.authenticate('github',{successRedirect:"/github",failureRedirect:"/"}));
	server.get("/auth/github",passport.authenticate('github',{"scope":["user","repo"]}));
	server.get("/auth/soundcloud",passport.authenticate('soundcloud'));
};