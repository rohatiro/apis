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

var drawPlayer = function(el) {
	var canvasctx = el[0].getContext("2d");
	var outercircleradius,innercircleradius;

	canvasctx.canvas.width = el.width();
	canvasctx.canvas.height = el.height();

	outercircleradius = (canvasctx.canvas.width > canvasctx.canvas.height ? canvasctx.canvas.height : canvasctx.canvas.width) / 2;
	innercircleradius = outercircleradius / 2;

	var x0, y0;


	x0 = canvasctx.canvas.width/2;
	y0 = canvasctx.canvas.height/2;

	canvasctx.beginPath();
	canvasctx.fillStyle = "#444";
	canvasctx.fillRect(0,0,canvasctx.canvas.width,canvasctx.canvas.height);
	canvasctx.closePath();
	
	canvasctx.beginPath();
	canvasctx.fillStyle = "#0AA2CF";
	canvasctx.moveTo(x0,y0);
	canvasctx.arc(x0,y0,innercircleradius,0,2*Math.PI,false);
	canvasctx.fill();
	canvasctx.closePath();

	canvasctx.beginPath();
	canvasctx.fillStyle = "#FFFFFF";
	canvasctx.moveTo(x0,y0);
	canvasctx.arc(x0,y0,(innercircleradius - ((2*innercircleradius)*0.02)),0,2*Math.PI,false);
	canvasctx.fill();
	canvasctx.closePath();
};

var songNoExist = function(err, xhr, message) {
	console.log(message);
};

var songExist = function(data) {
	window.song = data;
	var hrs,min,sec;
	var templatedata = {};
	templatedata.title = data.title;
	sec = Math.floor(Number(data.duration)/1000);
	hrs = Math.floor(sec/3600);
	min = Math.floor((sec - (hrs*3600))/60);
	sec = sec - (min*60) - (hrs*3600);
	templatedata.totaltime = (hrs > 0 ? (hrs < 10 ? "0"+hrs:hrs)+":":"")+(min === 0 ? "00:":(min < 10 ? "0"+min:min)+":")+(sec === 0 ? "00:":(sec < 10 ? "0"+sec:sec));
	templatedata.currenttime = (hrs > 0 ? "00:":"")+"00:00";
	$("#js-soundcloud__player").html(songtemplate(templatedata));
	drawPlayer($("#js-soundcloud__player__canvas"));
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