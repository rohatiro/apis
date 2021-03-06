var request = require("request");

var login = function(req,res) {
	res.render("login");
};

var home = function(req,res) {
	res.render("home");
};

var soundcloud = function(req,res) {
	var clientid = req._passport.instance._strategy("soundcloud")._oauth2._clientId;
	if(req.user)
	{
		request({
			method:"GET",
			url:req.user.uri+"/favorites.json?client_id="+clientid,
		},function(err,respond,body) {
			try
			{
				var json = JSON.parse(body);
				if (json.error) res.render("soundcloud",{error:true});
				res.render("scfavorites",{user:req.user,favorites:json});
			}
			catch(ex)
			{
				res.render("soundcloud",{error:true});
			}
		});
	}
	else
	{
		res.render("soundcloud");
	}
};

var github = function(req,res) {
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

var stream = function(req,res) {
	var id = req.params.id;
	var client_id = req._passport.instance._strategy("soundcloud")._oauth2._clientId;
	var url = "https://api.soundcloud.com/tracks/"+id+"/stream?client_id="+client_id;
	req.pipe(request(url)).pipe(res);
};

var waveform = function(req,res) {
	var url = "http://www.waveformjs.org/w";
	var params = req.query;
	var query = "?";
	for(var p in params)
	{
		query+=p+"="+params[p]+"&";
	}
	query = query.slice(0,query.length-1);
	req.pipe(request(url+query)).pipe(res);
};

var player = function(req,res) {
	var clientid = req._passport.instance._strategy("soundcloud")._oauth2._clientId;
	if(req.user)
	{
		request({
			method:"GET",
			url:req.user.uri+"/favorites.json?client_id="+clientid,
		},function(err,respond,body) {
			try
			{
				var json = JSON.parse(body);
				if (json.error) res.render("soundcloud",{error:true});
				res.render("scplayer",{user:req.user,favorites:json});
			}
			catch(ex)
			{
				res.render("scplayer",{error:true});
			}
		});
	}
	else
	{
		res.render("scplayer");
	}
};

var test = function(req,res) {
	res.render("sctest");
};

module.exports = {
	home:home,
	login:login,
	soundcloud:soundcloud,
	github:github,
	stream:stream,
	waveform:waveform,
	player:player,
	test:test
};