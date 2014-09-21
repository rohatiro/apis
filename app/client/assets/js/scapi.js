var SoundCloudAPI, scapi;
SC.initialize({
	client_id:"2603fac8ed0db8240db6d7bcc3b3fd8f",
	redirect_uri:"http://localhost:8000/login"
});

SoundCloudAPI = function() {
	var self = this;
	var render = {};
	
	render.isLogin = function(me)
	{
		if(!me.errors)
		{ 
			$("#sc-login").html("<span id='sc-loginlink'>"+me.username+"</span>");
			SC.get(me.uri+"/favorites",render.getFavTracks);
		}
		else
		{
			$("#sc-login").html("<a href=\"#\" class=\"btn\">Connect</a>");
		}
	};

	render.getFavTracks = function(tracks)
	{
		self.Tracks = new _Tracks();
		self.Tracks.add(tracks);
		var html = self.Tracks.render();
		$("#tracks").html(html);
	};

	var getUser = function()
	{
		SC.get("/me",render.isLogin);
	};

	var _Track = function(attributes)
	{
		var _self = this;

		_self.hasSound = false;
		var tmpl = "<article class='track'><figure class='track-artwork-container'><a class='track-artwork-link' href='#'><img class='track-artwork-img' src='{{ track.artwork_url }}' /></a></figure><div class='track-controls-container'><div class='track-controls'><a href='#' class='btn play' onclick='event.preventDefault();scapi.Tracks.play(event, {{ track.id }})'>Play</a href='#'></div><div class='waveform'></div></div></article>";

		if(!attributes.artwork_url)
		{
			if(attributes.user.avatar_url !== "https://a1.sndcdn.com/images/default_avatar_large.png?e76cf77")
				attributes.artwork_url = attributes.user.avatar_url;
			else
				attributes.artwork_url = "https://a-v2.sndcdn.com/assets/images/default/cloudx120-38b02b00.png";
		}

		_self.attributes = attributes;

		_self.getStreamTrack = function() {
			var url = _self.toJSON().stream_url;
			var __self = _self;
			
			var setStream = function(sound)
			{
				__self.hasSound = true;
				__self.sound = sound;
			};

			SC.stream(url,_self.waveform.optionsForSyncedStream(),setStream);
		};

		_self.toJSON = function()
		{
			return _self.attributes;
		};

		var contdom = document.createElement("div");
		contdom.innerHTML = swig.compile(tmpl)({track:_self.toJSON()});

		_self.html = Array.prototype.slice.call(contdom.childNodes)[0];
		_self.waveform = new Waveform({container:_self.html.getElementsByClassName("waveform")[0],innerColor:"#333",width:(document.getElementsByTagName("body")[0].clientWidth*.60),height:50,croppe:true});
		_self.waveform.dataFromSoundCloudTrack(_self.toJSON());

		_self.getStreamTrack();

		return _self;
	};

	var _Tracks = function()
	{
		var _self = this;

		_self.model = _Track;

		_self.models = [];

		_self.currentSong = null;

		_self.add = function(items)
		{
			if(items instanceof Array)
			{
				var i,models=[];
				for(i = 0; i < items.length; i++)
				{
					models.push(new _Track(items[i]));
				}
				_self.models = _self.models.concat(models);
				return models;
			}
			else
			{
				var j = _self.models.push(new _Track(items));
				return _self.models[j-1];
			}
		};

		_self.toJSON = function()
		{
			var i,_json;
			_json = [];
			for(i = 0; i < _self.models.length; i++)
			{
				_json.push(_self.models[i].toJSON());
			}
			return _json;
		};

		render.pauseAll = function() {
			var i,pause;
			for(i = 0; i < _self.models.length; i++)
			{
				pause = _self.models[i].html.getElementsByClassName("pause")[0];
				if(pause)
				{
					pause.innerHTML = "Play";
					var cl = pause.classList;
					var j;
					for(j = 0; j < cl.length; j++)
					{
						if(cl[j] == "pause")
							cl[j] = "play";
					}
					pause.className = cl.toString();
				}
			}
		};

		_self.play = function(e, id) {
			var model = _self.getById(id);
			var target = e.target;
			if(!_self.currentSong)
			{
				$(target).toggleClass('play').toggleClass('pause');
				$(target).html('Pause');
				if(model.sound.playState === 0)
					model.sound.play({
						onfinish:function(){
							console.log('termino');
							console.log(arguments);
						}
					});
				else
					model.sound.resume();
				_self.currentSong = model;
			}
			else if (_self.currentSong.toJSON().id != model.toJSON().id)
			{
				render.pauseAll();
				soundManager.pauseAll();
				$(target).toggleClass('play').toggleClass('pause');
				$(target).html('Pause');
				if(model.sound.playState === 0)
					model.sound.play({
						onfinish:function(){
							console.log('termino');
							console.log(arguments);
						}
					});
				else
					model.sound.resume();
				_self.currentSong = model;	
			}
			else
			{
				$(target).toggleClass('play').toggleClass('pause');
				$(target).html('Play');
				model.sound.pause();
				_self.currentSong = null;
			}
		};

		_self.getById = function(id) {
			var _id = id,i;
			for(i = 0; i < _self.models.length; i++)
			{
				if(_self.models[i].toJSON().id == _id)
					return _self.models[i];
			}
		};

		_self.render = function()
		{
			var tmpl = [],b;

			for(b = 0; b < _self.models.length; b++)
			{

				tmpl.push(_self.models[b].html);
			}
			
			return tmpl;
		};

		return _self;
	};

	self.login = function(e)
	{
		e.preventDefault();
		SC.connect(getUser);
	};

	self.initialize = function()
	{
		getUser();
		$("#sc-login").on("click",".btn",self.login);
	};

	return self;
};

scapi = new SoundCloudAPI();

$(scapi.initialize);