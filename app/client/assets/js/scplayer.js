var _Player = function(options) {
	var self = this;
	var _options = options;

	//Generating status for the player
	//blank: the player is initialized but no have songs to play
	//play: the player is playing music
	//pause: the player is in pause
	//stop: the player has songs but this stopped
	//loading: the player is loading a song
	self.statusList = ["blank","play","pause","stop","loading"];

	self.getStatusIndex = function(status)
	{
		if(!status) return -1;
		return self.statusList.indexOf(status.toLowerCase());
	};

	self.currentstatus = self.statusList[self.getStatusIndex("blank")];

	//Getting the DOM element who contains the player
	self.container = $(_options.container);

	//Creating the DOM element to be used for player play button
	var link = document.createElement("a");
	link.href = "#";

	//Creating the DOM element to be used as the player display
	self.canvas = document.createElement("canvas");
	self.canvasctx = self.canvas.getContext("2d");

	//Estabilishing the options of the height and width of the player display
	var width = _options.width || (self.container.width() < 100 ? 500 : self.container.width());
	var height = _options.height || (self.container.height() < 100 ? 500 : self.container.height());

	//Setting the height and width of the player display
	self.canvas.width = width;
	self.canvas.height = height;

	//Setting the player display inside the button play
	link.appendChild(self.canvas);

	//Setting the button play in the container
	self.container.append(link);
	self.container.css("display", "none");

	//Setting the player button play click event for play the music
	link.onclick = function() { self.play.call(self); return false; };

	//Initializing the configuration of player 
	//Creating a new audio object
	self.audio = new Audio();

	//Creating a new context object of audio
	self.audioctx = new AudioContext();

	//Creating a ScriptProcessor object based on the context of audio
	//this object is used for direct audio processing
	self.scriptprocessor = self.audioctx.createScriptProcessor(2048,1,1);

	//Creating a Analyser object based on the context of audio
	//this object is used for get audio time and frequency data
	self.analyser = self.audioctx.createAnalyser();

	//Creating a MediaElementSource object based on the context of audio
	//this object is used as a interface between the audio object and the context of audio
	self.buffersource = self.audioctx.createMediaElementSource(self.audio);


	self.analyser.smoothingTimeConstant = 0.3;
	self.analyser.fftSize = 1024;

	self.buffersource.connect(self.analyser);
	self.analyser.connect(self.scriptprocessor);
	self.scriptprocessor.connect(self.audioctx.destination);
	self.buffersource.connect(self.audioctx.destination);

	self.audioevents = {
		onplay: function() {
			self.currentstatus = self.statusList[self.getStatusIndex("play")];
		},
		onpause: function() {
			self.currentstatus = self.statusList[self.getStatusIndex("pause")];
		},
		onfinish: function() {
			self.trackPlayed(self.currentSong);
			var nextsongid = self.nextSongId(self.currentSong);
			if(nextsongid != -1)
				self.changeSong(nextsongid);
			else
			{
				self.currentstatus = self.statusList[self.getStatusIndex("stop")];
			}
		},
		onresume: function() {
			self.currentstatus = self.statusList[self.getStatusIndex("play")];
		}
	};

	$.extend(self.audio,self.audioevents);

	self.scriptprocessor.onaudioprocess = function()
	{
		self.drawPlayer.call(self);
	};

	self.playlistcontainer = $(_options.playlistcontainer);
	self.playlistcontainer.droppable({
		active:"ui-state-default",
		accept:":not(.ui-sortable-helper)",
		drop:function(e,ui) {
			var url = window.location.protocol + "//" + window.location.host + "/soundcloud/tracks/" + ui.draggable.attr("id");
			var id = (url+"-T"+Math.random()).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "");
			var track = self.playlistcontainer.find("#"+id);
			var cln;
			if(!track.length)
			{
				self.addSrc(id,url);
				cln = ui.draggable.clone().append("<div class='delete'></div>");
				cln.attr("id",id);
				cln.appendTo(this);
				if(self.playlistcontainer.has(".track").length && self.playlistcontainer.find(".controls .play").hasClass("disabled"))
					self.playlistcontainer.find(".controls .play").removeClass("disabled");
			}
		}
	}).sortable({
		items:".track",
		handle:".track-dragcontoler",
		sort:function(e,ui) {
			$(this).removeClass("ui-state-default");
		}
	});

	self.playlistcontainer.on("click",".delete",function(e) {
		$e = $(e.target);
		$e.parent().remove();
	});

	self.playlistcontainer.on("click","a.play",function() {
		self.container.css("display", "block");
		self.play();
	});

	self.divition = 0;
	self.divitions = 100;
	self.playlist = new SoundManager();

	return this;
};

_Player.prototype.getMax = function(array) {
	return Math.max.apply(Math,array);
};

_Player.prototype.getMin = function(array) {
	return Math.min.apply(Math,array);
};

_Player.prototype.scaleArray = function(omax,omin,nmax,nmin,array) {
	var narray = [];
	var nval;
	for(var i = 0; i < array.length; i++)
	{
		nval = (omax-omin) <= 0 ? 0 : (((array[i]-omin)*(nmax-nmin))/(omax-omin))+nmin;
		narray.push(nval);
	}
	return narray;
};

_Player.prototype.drawInnerCircle = function(context,x0,y0,radius) {
	context.beginPath();
	context.fillStyle = "#0AA2CF";
	context.moveTo(x0,y0);
	context.arc(x0,y0,radius,0,2*Math.PI,false);
	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle = "#FFFFFF";
	context.arc(x0,y0,radius-((2*radius)*0.02),0,2*Math.PI,false);
	context.fill();
	context.closePath();
};

_Player.prototype.drawFrequencyBars = function(context,x0,y0,radius,value,frecbarrs,frecbarrslenght) {
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

_Player.prototype.drawLoadingCircle = function(context,x0,y0,radius) {
	var x1,y1,self=this;

	x1 = x0 + ((radius-((2*radius)*0.02))*(Math.cos(((2*Math.PI)*(self.divition+13))/self.divitions)));
	y1 = y0 + ((radius-((2*radius)*0.02))*(Math.sin(((2*Math.PI)*(self.divition+13))/self.divitions)));

	var circleGradient = context.createRadialGradient(x1,y1,((2*radius)*0.01),x1,y1,((2*radius)*0.12));
	circleGradient.addColorStop(0,"#FCF7FD");
	circleGradient.addColorStop(1/7,"#D6F5FD");
	circleGradient.addColorStop(2/7,"#ACE6FD");
	circleGradient.addColorStop(3/7,"#8FDDFF");
	circleGradient.addColorStop(4/7,"#3BC8F4");
	circleGradient.addColorStop(5/7,"#1EC1F6");
	circleGradient.addColorStop(6/7,"#33738D");
	circleGradient.addColorStop(1,"#666");

	context.beginPath();
	context.fillStyle = circleGradient;
	context.moveTo(x0,y0);
	context.arc(x0,y0,radius,0,2*Math.PI,false);
	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle = "#FFFFFF";
	context.arc(x0,y0,radius-((2*radius)*0.04),0,2*Math.PI,false);
	context.fill();
	context.closePath();
};

_Player.prototype.drawProgressBar = function(context,x0,y0,radius,progress) {
	context.beginPath();
	context.fillStyle = "#0098C5";
	context.moveTo(x0,y0);
	context.arc(x0,y0,radius-((2*radius)*0.04),0,progress,false);
	context.fill();
	context.closePath();

	context.beginPath();
	context.fillStyle = "#FFFFFF";
	context.arc(x0,y0,radius-((2*radius)*0.06),0,2*Math.PI,false);
	context.fill();
	context.closePath();
};

_Player.prototype.drawPlayer = function() {
	var self = this;
	var array = new Uint8Array(self.analyser.frequencyBinCount);
	self.analyser.getByteFrequencyData(array);

	self.outerCircleRadius = (self.canvas.width > self.canvas.height ? self.canvas.height : self.canvas.width)/2;
	self.innerCircleRadius = self.outerCircleRadius/2;

	var omax = self.getMax(array);
	var omin = self.getMin(array);
	var nmax = self.innerCircleRadius;
	var nmin = 0;
	var x0 = self.canvas.width/2;
	var y0 = self.canvas.height/2;
	var value;
	var progress;

	array = self.scaleArray(omax,omin,nmax,nmin,array);
	self.canvasctx.clearRect(0,0,self.canvas.width,self.canvas.height);

	self.canvasctx.beginPath();
	self.canvasctx.fillStyle = "#1b1b1b";
	self.canvasctx.fillRect(0,0,self.canvas.width,self.canvas.height);
	self.canvasctx.closePath();

	if(self.currentstatus == "loading") {
		self.drawLoadingCircle(self.canvasctx,x0,y0,self.innerCircleRadius);
	} else {
		self.drawInnerCircle(self.canvasctx,x0,y0,self.innerCircleRadius);
		if(self.currentstatus == "play")
		{
			progress = (2*Math.PI*self.playlist.getSoundById(self.currentSong)._a.currentTime)/self.playlist.getSoundById(self.currentSong)._a.duration;
			self.drawProgressBar(self.canvasctx,x0,y0,self.innerCircleRadius,progress);
			self.drawPauseButton(self.canvasctx,x0,y0,self.innerCircleRadius);
		}
		if(self.currentstatus == "stop" || self.currentstatus == "pause")
		{
			self.drawPlayButton(self.canvasctx,x0,y0,self.innerCircleRadius);
		}
	}

	if(self.divition === self.divitions) self.divition = 0;
	self.divition++;

	for(var i = 0; i < array.length; i++)
	{
		value = array[i];
		self.drawFrequencyBars(self.canvasctx,x0,y0,self.innerCircleRadius,value,i,array.length);
	}
};

_Player.prototype.drawPlayButton = function(context,x0,y0,radius) {
	context.beginPath();
	context.fillStyle = "#0AA2CF";
	context.moveTo((x0 - radius)+((2*radius)/3),(y0 - radius)+(2*radius)/3);
	context.lineTo((x0 - radius)+((2*radius)/3),(y0 - radius)+(2*(2*radius))/3);
	context.lineTo((x0 - radius) + ((3*(2*radius))/4),(y0 - radius)+(2*radius)/2);
	context.lineTo((x0 - radius) + ((2*radius)/3),(y0 - radius)+(2*radius)/3);
	context.fill();
	context.closePath();
};

_Player.prototype.drawPauseButton = function(context,x0,y0,radius) {
	context.beginPath();
	context.fillStyle = "#0AA2CF";
	context.fillRect((x0 - radius)+((2*radius)/4),(y0 - radius)+((2*radius)/4),(2*radius)/6,(2*radius)/2);
	context.fillRect((x0 - radius)+((7*(2*radius))/12),(y0 - radius)+((2*radius)/4),(2*radius)/6,(2*radius)/2);
	context.closePath();
};

_Player.prototype.trackPlayed = function(id) {
	var $id = $("#"+id);
	if(!$id.hasClass("played"))
	{
		$id.addClass("played");
	}
};

_Player.prototype.resetSongsStatus = function() {
	this.playlistcontainer.find(".track").each(function(index,el) {
		var $el = $(el);
		if($el.hasClass("played"))
			$el.removeClass("played");
	});
};

_Player.prototype.nextSongId = function() {
	var currentelement = $(this.currentSong);
	var nextsong = currentelement.next();
	var next = true;
	while(next)
	{
		if(!nextsong.length) {
			nextsong = false;
			next = false;
		}
		else if(!nextsong.hasClass("played")) {
			nextsong = nextsong.next();
		} else {
			next = false;
		}
	}
	return nextsong ? nextsong.attr("id") : -1;
};

_Player.prototype.changeSong = function(id) {
	var self = this;
	this.currentSong = this.playlist.soundIDs[id];
	this.buffersource.disconnect();
	this.buffersource = this.audioctx.createMediaElementSource(this.playlist.getSoundById(this.currentSong)._a);
	this.buffersource.connect(this.analyser);
	this.buffersource.connect(this.audioctx.destination);
	this.currentstatus = this.statusList[this.getStatusIndex("loading")];
	self.playlist.getSoundById(self.currentSong).play();
};

_Player.prototype.addSrc = function(id,url) {
	var self = this;
	var _opt = self.audioevents;
	
	_opt.id = id;
	_opt.url = url;

	self.playlist.createSound(_opt);
	self.currentstatus = self.statusList[self.getStatusIndex(self.currentstatus == "blank" ? "blank" : self.currentstatus)];
};

_Player.prototype.play = function() {
	var self = this;
	if(this.currentstatus == "blank")
	{
		this.currentSong = this.playlistcontainer.find(".track").first().attr("id"); 	
		this.buffersource.disconnect();
		this.buffersource = this.audioctx.createMediaElementSource(this.playlist.getSoundById(this.currentSong)._a);
		this.buffersource.connect(this.analyser);
		this.buffersource.connect(this.audioctx.destination);
		this.currentstatus = this.statusList[this.getStatusIndex("loading")];
		self.playlist.getSoundById(self.currentSong).play();
	}
	else
	{
		if(this.currentstatus == "play")
		{
			this.playlist.getSoundById(this.currentSong).pause();
		}
		else if(this.currentstatus == "pause" || this.currentstatus == "stop")
		{
			this.playlist.getSoundById(this.currentSong).play();
		}
	}
};

_Player.prototype.pause = function() {
	this.audio.pause();
};

$(window).on("resize",function() {
	var width = $(Player.container).width();
	Player.canvas.width = width;
	Player.drawPlayer();
});