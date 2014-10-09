module.exports = function() {
	var passport,githubStrategy;

	passport = require("passport");
	githubStrategy = require("./github");

	passport.use('github', new githubStrategy({
		authorizationURL:"https://github.com/login/oauth/authorize",
		tokenURL:"https://github.com/login/oauth/access_token",
		clientID:"3215b0b69bdedbe58669",
		clientSecret:"06edc9e06d1013eddef4781321243f615f41daa1",
		callbackURL:"http://localhost:8000/login"
	}, function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			return done(null,profile);
		});
	}));

	return passport;
};