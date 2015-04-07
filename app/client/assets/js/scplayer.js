var getQueryStrings = function() {
	var i, key, val;
	var url = window.location.href;
	var querystring = url.split("?")[1];
	var querystrings = {};
	if(querystring)
	{
		querystring = querystring.split("&");
		for(i=0;i<querystring.length;i++)
		{
			key = querystring[i].split("=")[0].toLowerCase();
			value = querystring[i].split("=")[1] ? decodeURIComponent(querystring[i].split("=")[1]) : null;
			querystrings[key] = value;
		}
		return querystrings;
	}
	else
	{
		return querystrings;
	}
};

var querystrings = getQueryStrings();
var songtemplate;

var songNoExist = function(err, xhr, message) {
	console.log(message);
};

var songExist = function(data) {
	$("#js-soundcloud__player").html(songtemplate(data));
};

var getSong = function(id) {
	$.getJSON("/soundcloud/tracks/"+id+"/info").then(songExist,songNoExist);
};

if(querystrings.listen) {
	songtemplate = swig.compile($("#player").html());
	getSong(querystrings.listen);
} else {
	songtemplate = swig.compile($("#nosong").html());
	$("#js-soundcloud__player").html(songtemplate());
}