var home,login,request;
request = require("request");

login = function(req,res) {
	res.render("login");
};

home = function(req,res) {
	res.render("home");
};

soundcloud = function(req,res) {
	var clientid = req._passport.instance._strategy("soundcloud")._oauth2._clientId;
	request({
		method:"GET",
		url:req.user.uri+"/favorites.json?client_id="+clientid,
	},function(err,respond,body) {
		try
		{
			var json = JSON.parse(body);
			if (json.error) res.render("soundcloud",{error:true});
			res.render("soundcloud",{user:req.user,favorites:json});
		}
		catch(ex)
		{
			res.render("soundcloud",{error:true});
		}
	});
};

github = function(req,res) {
	console.log(req.user.repos_url);
	request({
		method:"GET",
		url:req.user.repos_url,
		headers:{
			"User-Agent":"My application"
		}
	},function(err,resp,body) {
		var repos = JSON.parse(body);
		res.render("github",{user:req.user,repos:repos});
	});
};

module.exports = {
	home:home,
	login:login,
	soundcloud:soundcloud,
	github:github
};