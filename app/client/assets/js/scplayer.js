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
		var timeformat = msToTimeFormat(Math.floor(song.duration));
		$("#js-soundcloud__player__currenttime").html(timeformat);
	},
	onresume: function() {
		song.status = "play";
	},
	whileplaying: function() {
		var timeformat = msToTimeFormat(Math.floor(this.position));
		$("#js-soundcloud__player__currenttime").html(timeformat);
	}
};

var getMin = function(array) {
	return Math.min.apply(Math,array);
};

var getMax = function(array) {
	return Math.max.apply(Math,array);
};

var scaleArray = function(omax,omin,nmax,nmin,array) {
	var narray = [];
	var nval;
	for(var i = 0; i < array.length; i++)
	{
		nval = (omax-omin) <= 0 ? 0 : (((array[i]-omin)*(nmax-nmin))/(omax-omin))+nmin;
		narray.push(nval);
	}
	return narray;
};

var drawFrequencyBars = function(context,x0,y0,radius,value,frecbarrs,frecbarrslenght) {
	var x1,x2,x3,y1,y2,y3;

	x1 = x0 + (radius*(Math.cos(((2*Math.PI)*frecbarrs)/frecbarrslenght)));
	y1 = y0 + (radius*(Math.sin(((2*Math.PI)*frecbarrs)/frecbarrslenght)));
	
	x2 = x1 + (value*(Math.cos(((2*Math.PI)*frecbarrs)/frecbarrslenght)));
	y2 = y1 + (value*(Math.sin(((2*Math.PI)*frecbarrs)/frecbarrslenght)));
	
	x3 = x1 + (radius*(Math.cos(((2*Math.PI)*frecbarrs)/frecbarrslenght)));
	y3 = y1 + (radius*(Math.sin(((2*Math.PI)*frecbarrs)/frecbarrslenght)));
	
	var lineGrad = context.createLinearGradient(x1,y1,x3,y3);
	lineGrad.addColorStop(0,"#0f0");
	lineGrad.addColorStop(0.5,"#ff0");
	lineGrad.addColorStop(1,"#f00");

	context.beginPath();
	context.moveTo(x1,y1);
	context.lineTo(x2,y2);
	context.strokeStyle = lineGrad;
	context.closePath();
	context.stroke();
};

var drawPlayButton = function(context,x0,y0,radius) {
	context.beginPath();
	context.fillStyle = "#0AA2CF";
	context.moveTo((x0 - radius)+((2*radius)/3),(y0 - radius)+(2*radius)/3);
	context.lineTo((x0 - radius)+((2*radius)/3),(y0 - radius)+(2*(2*radius))/3);
	context.lineTo((x0 - radius) + ((3*(2*radius))/4),(y0 - radius)+(2*radius)/2);
	context.lineTo((x0 - radius) + ((2*radius)/3),(y0 - radius)+(2*radius)/3);
	context.fill();
	context.closePath();
};

var drawPauseButton = function(context,x0,y0,radius) {
	context.beginPath();
	context.fillStyle = "#0AA2CF";
	context.fillRect((x0 - radius)+((2*radius)/4),(y0 - radius)+((2*radius)/4),(2*radius)/6,(2*radius)/2);
	context.fillRect((x0 - radius)+((7*(2*radius))/12),(y0 - radius)+((2*radius)/4),(2*radius)/6,(2*radius)/2);
	context.closePath();
};

var drawPlayer = function() {
	var el = song.el;
	var canvasctx = el[0].getContext("2d");
	var outercircleradius,innercircleradius;
	var array = new Uint8Array(analyser.frequencyBinCount);

	analyser.getByteFrequencyData(array);

	canvasctx.canvas.width = el.width();
	canvasctx.canvas.height = el.height();

	outercircleradius = (canvasctx.canvas.width > canvasctx.canvas.height ? canvasctx.canvas.height : canvasctx.canvas.width) / 2;
	innercircleradius = outercircleradius / 2;

	var omax = getMax(array);
	var omin = getMin(array);
	var nmax = innercircleradius;
	var nmin = 0;
	var x0, y0, i, value;

	array = scaleArray(omax,omin,nmax,nmin,array);

	array = array.slice(0,370);

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

	if(song.status != "play") drawPlayButton(canvasctx,x0,y0,innercircleradius);
	else drawPauseButton(canvasctx,x0,y0,innercircleradius);

	for(i = 0; i < array.length; i++)
	{
		value = array[i];
		drawFrequencyBars(canvasctx,x0,y0,innercircleradius,value,i,array.length);
	}
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