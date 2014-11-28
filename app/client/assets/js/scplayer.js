var _Player = function(options) {
	var self = this;
	var _options = options;

	var link = document.createElement("a");
	link.href = "#";
	link.onclick = function() { self.play.call(self); return false; };

	self.container = _options.container;
	self.canvas = document.createElement("canvas");
	self.canvasctx = self.canvas.getContext("2d");

	self.playlist = [];
	
	var width = _options.width || (self.container.offsetWidth < 100 ? 500 : self.container.offsetWidth);
	var height = _options.height || (self.container.offsetHeight < 100 ? 500 : self.container.offsetHeight);
	self.divitions = _options.divitions || 100;
	self.divitioninitial = 0;

	self.canvas.width = width;
	self.canvas.height = height;

	link.appendChild(self.canvas);
	self.container.appendChild(link);

	self.stoped = false;
	self.paused = false;
	self.played = false;
	self.playing = false;
	self.error = false;
	self.loading = false;
	self.playerstarted = false;
	self.isPlaying = false;

	self.audio = new Audio();
	self.audioctx = new AudioContext();
	self.scriptprocessor = self.audioctx.createScriptProcessor(2048,1,1);
	self.analyser = self.audioctx.createAnalyser();
	self.buffersource = self.audioctx.createMediaElementSource(self.audio);

	self.analyser.smoothingTimeConstant = 0.3;
	self.analyser.fftSize = 1024;

	self.buffersource.connect(self.analyser);
	self.analyser.connect(self.scriptprocessor);
	self.scriptprocessor.connect(self.audioctx.destination);
	self.buffersource.connect(self.audioctx.destination);

	self.audioevents = {
		onloadedmetadata: function() {
			self.stoped = true;
			self.paused = false;
			self.played = false;
			self.error = false;
			self.loading = false;
		},
		onloadstart: function() {
			self.stoped = false;
			self.paused = false;
			self.played = false;
			self.error = false;
			self.loading = true;
			self.playing = false;
			self.divitioninitial = 0;
		},
		onplaying: function() {
			self.stoped = false;
			self.paused = false;
			self.played = true;
			self.error = false;
			self.loading = false;
		},
		onpause: function() {
			self.stoped = false;
			self.paused = true;
			self.played = false;
			self.error = false;
			self.loading = false;
		},
		onended: function() {
			if(self.playlist.length > 0)
			{
				self.audio.src = self.playlist.pop();
				self.audio.play();
			}
			else
			{
				self.isPlaying = false;
				self.stoped = true;
				self.paused = false;
				self.played = false;
				self.error = false;
				self.loading = false;
			}
		},
		onerror: function() {
			self.stoped = false;
			self.paused = false;
			self.played = false;
			self.error = true;
			self.loading = false;

			var currenttime = self.audio.currentTime;

			self.audio.load();
			self.audio.currentTime = currenttime;
			self.audio.play();
		},
		ontimeupdate: function() {
			self.playing = true;
		}
	};

	$.extend(self.audio,self.audioevents);

	self.scriptprocessor.onaudioprocess = function()
	{
		self.drawPlayer.call(self);
	};

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

	x1 = x0 + ((radius-((2*radius)*0.02))*(Math.cos(((2*Math.PI)*(self.divitioninitial+13))/self.divitions)));
	y1 = y0 + ((radius-((2*radius)*0.02))*(Math.sin(((2*Math.PI)*(self.divitioninitial+13))/self.divitions)));

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

	if(self.loading) {
		self.drawLoadingCircle(self.canvasctx,x0,y0,self.innerCircleRadius);
	} else {
		self.drawInnerCircle(self.canvasctx,x0,y0,self.innerCircleRadius);
		if(self.playing)
		{
			progress = (2*Math.PI/self.audio.duration)*self.audio.currentTime;
			self.drawProgressBar(self.canvasctx,x0,y0,self.innerCircleRadius,progress);
		}
		if(!self.played || self.stoped)
		{
			self.drawPlayButton(self.canvasctx,x0,y0,self.innerCircleRadius);
		} else if(!self.paused) {
			self.drawPauseButton(self.canvasctx,x0,y0,self.innerCircleRadius);
		}
	}

	if(self.divitions === self.divitioninitial) self.divitioninitial = 0;
	self.divitioninitial++;

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

_Player.prototype.addSrc = function(url) {
	var self = this;
	self.playlist.push(url);
};

_Player.prototype.play = function() {
	if(this.playlist.length > 0 && !this.isPlaying)
	{
		this.isPlaying = true;
		this.audio.src = this.playlist.pop();
		this.audio.play();
	}
	else
	{
		if(this.paused || this.stoped)
		{
			this.audio.play();
		}
		else
		{
			this.pause();
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