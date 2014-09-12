var home;

home = function(req,res) {
	res.render("index");
};

module.exports = {
	home:home 
};