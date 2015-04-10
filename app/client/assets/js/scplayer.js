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
var audioctx,analyser,scriptprocessor,buffersource;

var audioevents = {
	onplay: function() {
		song.status = "play";
	},
	onpause: function() {
		song.status = "pause";
	},
	onfinish: function() {
		song.status = "stop";
	},
	onresume: function() {
		song.status = "play";
	},
	whileplaying: function() {
		var timeformat = msToTimeFormat(Math.floor(this.position));
		$("#js-soundcloud__player__currenttime").html(timeformat);
	}
};

var drawPlayer = function() {
	var el = song.el;
	var canvasctx = el[0].getContext("2d");
	var outercircleradius,innercircleradius;

	canvasctx.canvas.width = el.width();
	canvasctx.canvas.height = el.height();

	outercircleradius = (canvasctx.canvas.width > canvasctx.canvas.height ? canvasctx.canvas.height : canvasctx.canvas.width) / 2;
	innercircleradius = outercircleradius / 2;

	var x0, y0;


	x0 = canvasctx.canvas.width/2;
	y0 = canvasctx.canvas.height/2;

	canvasctx.clearRect(0,0,canvasctx.canvas.width,canvasctx.canvas.height);

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

var msToTimeFormat = function(miliseconds) {
	sec = Math.floor(Number(miliseconds)/1000);
	hrs = Math.floor(sec/3600);
	min = Math.floor((sec - (hrs*3600))/60);
	sec = sec - (min*60) - (hrs*3600);
	return (hrs > 0 ? (hrs < 10 ? "0"+hrs:hrs)+":":"")+(min === 0 ? "00:":(min < 10 ? "0"+min:min)+":")+(sec === 0 ? "00":(sec < 10 ? "0"+sec:sec));
};

var songNoExist = function(err, xhr, message) {
	console.log(message);
};

var songExist = function(data) {
	window.song = data;
	var id = querystrings.listen;
	var url = location.protocol+"//"+location.host+"/soundcloud/tracks/"+id;
	var uid = (url+"-T"+Math.random()).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "");
	song.uid = uid;
	song.status = "stop";
	
	var templatedata = {};
	templatedata.title = data.title;
	templatedata.totaltime = msToTimeFormat(data.duration);
	templatedata.currenttime = (templatedata.totaltime.split(":").length > 2 ? "00:":"")+"00:00";
	$("#js-soundcloud__player").html(songtemplate(templatedata));
	
	song.el = $("#js-soundcloud__player__canvas");

	var opt = audioevents;
	opt.id = uid;
	opt.url = url;

	soundManager.createSound(opt);

	audioctx = new AudioContext();
	scriptprocessor = audioctx.createScriptProcessor(2048,1,1);
	analyser = audioctx.createAnalyser();
	buffersource = audioctx.createMediaElementSource(soundManager.getSoundById(song.uid)._a);

	analyser.smoothingTimeConstant = 0.3;
	analyser.fftSize = 1024;

	buffersource.connect(analyser);
	analyser.connect(scriptprocessor);
	scriptprocessor.connect(audioctx.destination);
	buffersource.connect(audioctx.destination);

	scriptprocessor.onaudioprocess = drawPlayer;
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