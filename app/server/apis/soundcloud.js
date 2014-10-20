var oAuthStrategy,InternalOAuthError;

oAuthStrategy = require("passport-oauth2");
InternalOAuthError = oAuthStrategy.InternalOAuthError;

oAuthStrategy.prototype.userProfile = function(accessToken, done)
{
	this._oauth2.setAccessTokenName("oauth_token");
	this._oauth2.get("https://api.soundcloud.com/me.json",accessToken,function(err,body,res) {
		var json
		if(err) return done(new InternalOAuthError('Failed to fetch user profile',err));
		try
		{
			json = JSON.parse(body);
		}
		catch (ex)
		{
			return done(new Error("Failed to parse user profile"));
		}
		done(null, json);
	});
};

module.exports = oAuthStrategy;