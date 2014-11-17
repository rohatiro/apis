var _Player = function(options) {
	var self = this;
	var _options = options;

	self.getMax = function(array) {
		return Math.max.apply(Math,array);
	};

	self.getMin = function(array) {
		return Math.min.apply(Math,array);
	};

	self.scaleArray = function(omax,omin,nmax,nmin,array) {
		var narray = [];
		var nval;
		for(var i = 0; i < array.length; i++)
		{
			nval = (omax-omin) <= 0 ? 0 : (((array[i]-omin)*(nmax-nmin))/(omax-omin))+nmin;
			narray.push(nval);
		}
		return narray;
	};

	self.container = _options.container;
	var link = document.createElement("a");
	link.href = "#";
	self.canvas = document.createElement("canvas");
	self.canvasctx = self.canvas.getContext("2d");
	
	var width = _options.width || (self.container.offsetWidth < 100 ? 500 : self.container.offsetWidth);
	var height = _options.height || (self.container.offsetHeight < 100 ? 500 : self.container.offsetHeight);
	var divitions = _options.divitions || 100;
	var divitioninitial = 0;

	self.canvas.width = width;
	self.canvas.height = height;

	link.appendChild(self.canvas);
	self.container.appendChild(link);

	self.stoped = false;
	self.paused = false;
	self.played = false;
	self.error = false;
	self.loading = false;

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

	link.addEventListener("click", function() {
		if(self.stoped) {
			self.play();
		} else if(self.played) {
			self.pause();
		} else if(self.paused) {
			self.play();
		}
	});

	self.audio.onloadedmetadata = function() {
		self.stoped = true;
		self.paused = false;
		self.played = false;
		self.error = false;
		self.loading = false;
	};

	self.audio.onloadstart = function() {
		self.stoped = false;
		self.paused = false;
		self.played = false;
		self.error = false;
		self.loading = true;
		divitioninitial = 0;
	};

	self.audio.onplaying = function() {
		self.stoped = false;
		self.paused = false;
		self.played = true;
		self.error = false;
		self.loading = false;
	};
	self.audio.onpause = function() {
		self.stoped = false;
		self.paused = true;
		self.played = false;
		self.error = false;
		self.loading = false;
	};
	self.audio.onended = function() {
		self.stoped = true;
		self.paused = false;
		self.played = false;
		self.error = false;
		self.loading = false;
	};
	self.audio.onerror = function() {
		self.stoped = false;
		self.paused = false;
		self.played = false;
		self.error = true;
		self.loading = false;

		var currenttime = self.audio.currentTime;

		self.audio.load();
		self.audio.currentTime = currenttime;
		self.audio.play();
	};

	self.scriptprocessor.onaudioprocess = function() {
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
		var circleGradient,x1,y1;

		array = self.scaleArray(omax,omin,nmax,nmin,array);
		self.canvasctx.clearRect(0,0,self.canvas.width,self.canvas.height);

		if(self.loading) {
			x1 = x0 + ((self.innerCircleRadius-((2*self.innerCircleRadius)*0.02))*(Math.cos(((2*Math.PI)*(divitioninitial+13))/divitions)));
			y1 = y0 + ((self.innerCircleRadius-((2*self.innerCircleRadius)*0.02))*(Math.sin(((2*Math.PI)*(divitioninitial+13))/divitions)));

			circleGradient = self.canvasctx.createRadialGradient(x1,y1,((2*self.innerCircleRadius)*0.01),x1,y1,((2*self.innerCircleRadius)*0.12));
			circleGradient.addColorStop(0,"#FCF7FD");
			circleGradient.addColorStop(1/7,"#D6F5FD");
			circleGradient.addColorStop(2/7,"#ACE6FD");
			circleGradient.addColorStop(3/7,"#8FDDFF");
			circleGradient.addColorStop(4/7,"#3BC8F4");
			circleGradient.addColorStop(5/7,"#1EC1F6");
			circleGradient.addColorStop(6/7,"#33738D");
			circleGradient.addColorStop(1,"#666");

			self.canvasctx.beginPath();
			self.canvasctx.fillStyle = circleGradient;
			self.canvasctx.moveTo(x0,y0);
			self.canvasctx.arc(x0,y0,self.innerCircleRadius,0,2*Math.PI,false);
			self.canvasctx.fill();
			self.canvasctx.closePath();

			self.canvasctx.beginPath();
			self.canvasctx.fillStyle = "#FFFFFF";
			self.canvasctx.arc(x0,y0,self.innerCircleRadius-((2*self.innerCircleRadius)*0.04),0,2*Math.PI,false);
			self.canvasctx.fill();
			self.canvasctx.closePath();
		} else {
			self.canvasctx.beginPath();
			self.canvasctx.fillStyle = "#0AA2CF";
			self.canvasctx.moveTo(x0,y0);
			self.canvasctx.arc(x0,y0,self.innerCircleRadius,0,2*Math.PI,false);
			self.canvasctx.fill();
			self.canvasctx.closePath();

			self.canvasctx.beginPath();
			self.canvasctx.fillStyle = "#FFFFFF";
			self.canvasctx.arc(x0,y0,self.innerCircleRadius-((2*self.innerCircleRadius)*0.02),0,2*Math.PI,false);
			self.canvasctx.fill();
			self.canvasctx.closePath();

			if(!self.played || self.stoped)
			{
				self.canvasctx.beginPath();
				self.canvasctx.fillStyle = "#0AA2CF";
				self.canvasctx.moveTo((x0 - self.innerCircleRadius)+((2*self.innerCircleRadius)/3),(y0 - self.innerCircleRadius)+(2*self.innerCircleRadius)/3);
				self.canvasctx.lineTo((x0 - self.innerCircleRadius)+((2*self.innerCircleRadius)/3),(y0 - self.innerCircleRadius)+(2*(2*self.innerCircleRadius))/3);
				self.canvasctx.lineTo((x0 - self.innerCircleRadius) + ((3*(2*self.innerCircleRadius))/4),(y0 - self.innerCircleRadius)+(2*self.innerCircleRadius)/2);
				self.canvasctx.lineTo((x0 - self.innerCircleRadius) + ((2*self.innerCircleRadius)/3),(y0 - self.innerCircleRadius)+(2*self.innerCircleRadius)/3);
				self.canvasctx.fill();
				self.canvasctx.closePath();
			} else if(!self.paused) {
				self.canvasctx.beginPath();
				self.canvasctx.fillStyle = "#0AA2CF";
				self.canvasctx.fillRect((x0 - self.innerCircleRadius)+((2*self.innerCircleRadius)/4),(y0 - self.innerCircleRadius)+((2*self.innerCircleRadius)/4),(2*self.innerCircleRadius)/6,(2*self.innerCircleRadius)/2);
				self.canvasctx.fillRect((x0 - self.innerCircleRadius)+((7*(2*self.innerCircleRadius))/12),(y0 - self.innerCircleRadius)+((2*self.innerCircleRadius)/4),(2*self.innerCircleRadius)/6,(2*self.innerCircleRadius)/2);
				self.canvasctx.closePath();
			}
		}

		if(divitions === divitioninitial) divitioninitial = 0;
		divitioninitial++;

		var value,x1,y1,x2,y2,x3,y3,lineGrad;

		for(var i = 0; i < array.length; i++)
		{
			value = array[i];
			y1 = (self.canvas.height/2) + ((self.innerCircleRadius)*(Math.sin(((2*Math.PI)*i)/array.length)));
			x1 = (self.canvas.width/2) + ((self.innerCircleRadius)*(Math.cos(((2*Math.PI)*i)/array.length)));
			y2 = y1 + (value*(Math.sin(((2*Math.PI)*i)/array.length)));
			x2 = x1 + (value*(Math.cos(((2*Math.PI)*i)/array.length)));
			y3 = y1 + (self.innerCircleRadius*(Math.sin(((2*Math.PI)*i)/array.length)));
			x3 = x1 + (self.innerCircleRadius*(Math.cos(((2*Math.PI)*i)/array.length)));
			
			lineGrad = self.canvasctx.createLinearGradient(x1,y1,x3,y3);
			lineGrad.addColorStop(0,"#0f0");
			lineGrad.addColorStop(0.5,"#ff0");
			lineGrad.addColorStop(1,"#f00");

			//Dibujar lineas de frecuencia
			self.canvasctx.beginPath();
			self.canvasctx.moveTo(x1,y1);
			self.canvasctx.lineTo(x2,y2);
			self.canvasctx.strokeStyle = lineGrad;
			self.canvasctx.closePath();
			self.canvasctx.stroke();
		}
	};

	return this;
};

_Player.prototype.addSrc = function(url) {
	var self = this;
	self.audio.src = url;
};

_Player.prototype.play = function() {
	this.audio.play();
};

_Player.prototype.pause = function() {
	this.audio.pause();
};

$(function() {
	window.Player = new _Player({container:player,height:400});
});