var home,login;

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
	console.log(req.user);
	res.render("github");
};

module.exports = {
	home:home,
	login:login,
	soundcloud:soundcloud,
	github:github
};