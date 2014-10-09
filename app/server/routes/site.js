var home,login,request;
request = require("request");

login = function(req,res) {
	res.render("login");
};

home = function(req,res) {
	res.render("home");
};

soundcloud = function(req,res) {
	res.render("soundcloud");
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