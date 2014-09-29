var home,login;

login = function(req,res) {
	res.render("login");
};

home = function(req,res) {
	res.render("home");
};

index = function(req,res) {
	res.render("index");
};

module.exports = {
	home:home,
	login:login,
	index:index
};