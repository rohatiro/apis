module.exports = function() {
	var passport,oauth,InternalOAuthError;

	passport = require("passport");
	oauth = require("passport-oauth2");
	InternalOAuthError = oauth.InternalOAuthError;

	oauth.prototype.userProfile = function(accessToken, done)
	{
		this._oauth2.get("https://api.github.com/user", accessToken, function (err, body, res) {
		    var json;
		    
		    if (err) {
		      return done(new InternalOAuthError('Failed to fetch user profile', err));
		    }
		    
		    try {
		      json = JSON.parse(body);
		    } catch (ex) {
		      return done(new Error('Failed to parse user profile'));
		    }
		    
		    done(null, json);
		 });
	};

	passport.use('github', new oauth({
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