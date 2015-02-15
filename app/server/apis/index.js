module.exports = function() {
	var passport,githubStrategy,soundcloudStrategy;

	passport = require("passport");
	githubStrategy = require("./github");
	soundcloudStrategy = require("./soundcloud");

	passport.use('github', new githubStrategy({
		authorizationURL:"https://github.com/login/oauth/authorize",
		tokenURL:"https://github.com/login/oauth/access_token",
		clientID:process.env.GITHUB_CLIENT_ID,
		clientSecret:process.env.GITHUB_CLIENT_SECRET,
		callbackURL:process.env.GITHUB_CALLBACK_URL
	}, function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			return done(null,profile);
		});
	}));

	passport.use('soundcloud', new soundcloudStrategy({
		authorizationURL:"https://soundcloud.com/connect",
		tokenURL:"https://api.soundcloud.com/oauth2/token",
		clientID:process.env.SOUNDCLOUD_CLIENT_ID,
		clientSecret:process.env.SOUNDCLOUD_CLIENT_SECRET,
		callbackURL:process.env.SOUNDCLOUD_CALLBACK_URL
	}, function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			return done(null,profile);
		});
	}));

	return passport;
};