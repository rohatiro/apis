module.exports = function(server,passport) {
	var site;

	site = require("./site");

	var isLogged = function(req,res,next) {
		if (req.isAuthenticated())
			return next();
		else
			res.redirect("/auth/github");
	};

	passport.serializeUser(function(user,done) {
		done(null,user);
	});

	passport.deserializeUser(function(user,done) {
		done(null,user);
	})

	server.get("/", site.home);
	server.get("/login", passport.authenticate('github',{
		successRedirect:"/github",
		failureRedirect:"/"
	}));
	server.get("/soundcloud", site.soundcloud);
	server.get("/github",isLogged, site.github);
	server.get("/auth/github",passport.authenticate('github',{"scope":["user","repo"]}));
};