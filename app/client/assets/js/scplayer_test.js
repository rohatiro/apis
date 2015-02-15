window.Track = Backbone.Model.extend();
window.Player = Backbone.Collection.extend({
	model: Track,
	currentstatus:{ "id":"blank" },
	statuslist:[{ "id":"blank" },{ "id":"play" },{ "id":"pause" },{ "id":"stop" },{ "id":"loading" }],
	audioevents: {
		onplay: function() {
			var self = this;
			self.model.collection.currentstatus = _.findWhere(self.model.collection.statuslist,{id:"play"});
		},
		onpause: function() {
			var self = this;
			self.model.collection.currentstatus = _.findWhere(self.model.collection.statuslist,{id:"pause"});
		},
		onfinish: function() {
			var self = this;
			self.model.collection.trackPlayed(self.model.collection.currentSong);
			var nextsongid = self.model.collection.nextSongId(self.model.collection.currentSong);
			if(nextsongid != -1)
				self.model.collection.changeSong(nextsongid);
			else
			{
				self.model.collection.currentstatus = _.findWhere(self.model.collection.statuslist,{id:"stop"});
			}
		},
		onresume: function() {
			var self = this;
			self.model.collection.currentstatus = _.findWhere(self.model.collection.statuslist,{id:"play"});
		}
	},
	connectAudio: function(audio) {
		var self = this;
		self.buffersource = self.audioctx.createMediaElementSource(audio);
		self.buffersource.connect(self.analyser);
		self.analyser.connect(self.scriptprocessor);
		self.scriptprocessor.connect(self.audioctx.destination);
		self.buffersource.connect(self.audioctx.destination);
		self.scriptprocessor.onaudioprocess = function() {
			self.processAudio.call(self);
		};
	},
	trackPlayed: function(id) {
		var $id = $("#"+id);
		if(!$id.hasClass("played"))
		{
			$id.addClass("played");
		}
	},
	nextSongId: function() {
		var currentelement = $("#"+this.currentSong);
		var nextsong = currentelement.next();
		var next = true;
		while(next)
		{
			if(!nextsong.length) {
				nextsong = false;
				next = false;
			}
			else if(nextsong.hasClass("played")) {
				nextsong = nextsong.next();
			} else {
				next = false;
			}
		}
		return nextsong ? nextsong.attr("id") : -1;
	},
	changeSong: function(id) {
		var self = this;
		this.currentSong = id;
		this.buffersource.disconnect();
		this.buffersource = this.audioctx.createMediaElementSource(this.playlist.getSoundById(this.currentSong)._a);
		this.buffersource.connect(this.analyser);
		this.buffersource.connect(this.audioctx.destination);
		this.currentstatus = this.statusList[this.getStatusIndex("loading")];
		self.playlist.getSoundById(self.currentSong).play();
	},
	processAudio: function() {
		this.view.drawPlayer.call(this);
	},
	initializePlaylist: function() {
		this.currentSong = this.models[0].toJSON().id;
	},
	initialize: function() {
		var self = this;
		self.audioctx = new AudioContext();
		self.scriptprocessor = self.audioctx.createScriptProcessor(2048,1,1);
		self.analyser = self.audioctx.createAnalyser();
		self.analyser.smoothingTimeConstant = 0.3;
		self.analyser.fftSize = 1024;
		self.songs = new SoundManager();
	}
});
window.PlayerCanvas = Backbone.View.extend({
	el: "#scplayer",
	events: {
		"click #playlist .play":"play",
		"click #playlist .track .delete":"delete",
		"click #player .play": "resume"
	},
	points: 100,
	point: 0,
	getMax: function(array) {
		return Math.max.apply(Math,array);
	},
	getMin: function(array) {
		return Math.min.apply(Math,array);
	},
	scaleArray: function(omax,omin,nmax,nmin,array) {
		var narray = [];
		var nval;
		for(var i = 0; i < array.length; i++)
		{
			nval = (omax-omin) <= 0 ? 0 : (((array[i]-omin)*(nmax-nmin))/(omax-omin))+nmin;
			narray.push(nval);
		}
		return narray;
	},
	initialize: function(coll) {
		var self = this;
		self.collection = coll;
		self.collection.view = self;
		self.player = self.$el.find("#player");
		self.playlist = self.$el.find("#playlist");
		self.player.append("<a class='play'><canvas></canvas></a>");
		self.canvas = self.player.find("canvas");
		self.canvasctx = self.canvas[0].getContext("2d");
	},
	drawPlayer: function() {
		var self = this;
		var array = new Uint8Array(self.analyser.frequencyBinCount);

		self.analyser.getByteFrequencyData(array);
		self.view.outerCircleRadius = (self.view.canvas.width() > self.view.canvas.height() ? self.view.canvas.height() : self.view.canvas.width())/2;
		self.view.innerCircleRadius = self.view.outerCircleRadius/2;

		var omax = self.view.getMax(array);
		var omin = self.view.getMin(array);
		var nmax = self.view.innerCircleRadius;
		var nmin = 0;
		var x0 = self.view.canvas.width()/2;
		var y0 = self.view.canvas.height()/2;
		var value;
		var progress;

		array = self.view.scaleArray(omax,omin,nmax,nmin,array);
		self.view.canvasctx.clearRect(0,0,self.view.canvas.width(),self.view.canvas.height());

		self.view.canvasctx.beginPath();
		self.view.canvasctx.fillStyle = "#1b1b1b";
		self.view.canvasctx.fillRect(0,0,self.view.canvas.width(),self.view.canvas.height());
		self.view.canvasctx.closePath();

		if(self.currentstatus.id == "loading") {
			self.view.drawLoadingCircle(self.view.canvasctx,x0,y0,self.view.innerCircleRadius);
		} else {
			self.view.drawInnerCircle(self.view.canvasctx,x0,y0,self.view.innerCircleRadius);
			if(self.currentstatus.id == "play")
			{
				progress = (2*Math.PI*self.songs.sounds[self.currentSong]._a.currentTime)/self.songs.sounds[self.currentSong]._a.duration;
				self.view.drawProgressBar(self.view.canvasctx,x0,y0,self.view.innerCircleRadius,progress);
				self.view.drawPauseButton(self.view.canvasctx,x0,y0,self.view.innerCircleRadius);
			}
			if(self.currentstatus.id == "stop" || self.currentstatus.id == "pause")
			{
				self.view.drawPlayButton(self.view.canvasctx,x0,y0,self.view.innerCircleRadius);
			}
		}

		if(self.view.point === self.view.points) self.view.point = 0;
		self.view.point++;

		for(var i = 0; i < array.length; i++)
		{
			value = array[i];
			self.view.drawFrequencyBars(self.view.canvasctx,x0,y0,self.view.innerCircleRadius,value,i,array.length);
		}

		// self.view.drawPlayButton();
	},
	drawInnerCircle: function(context,x0,y0,radius) {
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
	},
	drawPlayButton: function(context,x0,y0,radius) {
		context.beginPath();
		context.fillStyle = "#0AA2CF";
		context.moveTo((x0 - radius)+((2*radius)/3),(y0 - radius)+(2*radius)/3);
		context.lineTo((x0 - radius)+((2*radius)/3),(y0 - radius)+(2*(2*radius))/3);
		context.lineTo((x0 - radius) + ((3*(2*radius))/4),(y0 - radius)+(2*radius)/2);
		context.lineTo((x0 - radius) + ((2*radius)/3),(y0 - radius)+(2*radius)/3);
		context.fill();
		context.closePath();
	},
	drawPauseButton: function(context,x0,y0,radius) {
		context.beginPath();
		context.fillStyle = "#0AA2CF";
		context.fillRect((x0 - radius)+((2*radius)/4),(y0 - radius)+((2*radius)/4),(2*radius)/6,(2*radius)/2);
		context.fillRect((x0 - radius)+((7*(2*radius))/12),(y0 - radius)+((2*radius)/4),(2*radius)/6,(2*radius)/2);
		context.closePath();
	},
	drawFrequencyBars: function(context,x0,y0,radius,value,frecbarrs,frecbarrslenght) {
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
	},
	drawLoadingCircle: function(context,x0,y0,radius) {
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
	},
	drawProgressBar: function(context,x0,y0,radius,progress) {
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
	},
	play: function() {
		this.playlist.addClass("playin");
		this.canvas[0].height = this.height;
		this.player.removeClass("hide");
		this.canvas[0].width = this.player.width();
		this.collection.initializePlaylist();
		this.collection.connectAudio(this.collection.songs.sounds[this.collection.models[0].toJSON().id]._a);
		this.collection.songs.sounds[this.collection.models[0].toJSON().id].play(this.collection.audioevents);
		this.collection.currentstatus = _.findWhere(this.collection.statuslist,{id:"play"});
	},
	delete: function() {
		console.log(arguments);
	}
});
window.SCPlayer = {};
SCPlayer.addSong = function(model) {
	var json = model.toJSON();
	var sound = SCPlayer.Player.songs.createSound({
		url:json.url,
		id:json.id
	});
	sound.model = model;
};
SCPlayer.Player = new Player();
SCPlayer.Player.on("add",SCPlayer.addSong);
SCPlayer.initialize = function(options) {
	var width,height;

	width = options.width;
	height = options.height;

	SCPlayer.PlayerCanvas = new PlayerCanvas(SCPlayer.Player);

	SCPlayer.PlayerCanvas.height = height || 500;
	SCPlayer.PlayerCanvas.width = width;

	var $tabs = $(".tabs");
		
	$tabs.tabs({
		active:0,
		activate:function(e,ui) {
			ui.oldTab.removeClass("active");
			ui.newTab.addClass("active");
		}
	});
		
	$tabs.find("> ul > li").first().addClass("active");

	var tracktemplate = swig.compile('<div class="track" id="{{ fav.id }}"><div class="track-dragcontoler"></div><div class="track-container"><span class="track-music-icon"></span><div class="track-info-container"><p class="track-title">{{ fav.title }}</p></div></div><div class="delete"></div></div>');

	$(".upload-form").validate({
		rules:{
			url:"required"
		},
		submitHandler: function(form) {
			var values = {};
			$.each($(form).serializeArray(),function(i,e) {
				values[e.name] = e.value;
			});
			values.id = (values.url+"-T"+Math.random()).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "");
			values.title = decodeURIComponent(values.url);
			SCPlayer.Player.add({
				id:values.id,
				url:values.url
			});
			SCPlayer.PlayerCanvas.playlist.find(".tracks>div").append(tracktemplate({"fav":values}));
			if(SCPlayer.PlayerCanvas.playlist.has(".track").length && SCPlayer.PlayerCanvas.playlist.find(".controls .play").hasClass("disabled"))
				SCPlayer.PlayerCanvas.playlist.find(".controls .play").removeClass("disabled");
			form.reset();
		}
	});
};
$(SCPlayer.initialize);