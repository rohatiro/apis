module.exports = function(server,passport) {
	var site;

	site = require("./site");

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
	server.get("/github",function(req,res,next){
		return next();
	}, site.github);
	server.get("/auth/github",passport.authenticate('github',{"scope":["user","repo"]}));
};