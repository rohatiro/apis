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

	render.tracksTmpl = "{% for track in tracks %}<article class='track'><figure><a href='#'><img src='{{ track.artwork_url }}' /></a></figure><div class='controls-container'><button class='play' onclick='scapi.Tracks.play(event, {{ track.id }})'>Play</button></div></article>{% endfor %}";

	render.getFavTracks = function(tracks)
	{
		console.log(tracks);
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

		if(!attributes.artwork_url)
		{
			if(attributes.user.avatar_url !== "https://a1.sndcdn.com/images/default_avatar_large.png?e76cf77")
				attributes.artwork_url = attributes.user.avatar_url;
			else
				attributes.artwork_url = "https://a-v2.sndcdn.com/assets/images/default/cloudx120-38b02b00.png";
		}

		_self.attributes = attributes;

		_self.getStreamTrackPlay = function() {
			var url = _self.toJSON().stream_url;
			var __self = _self;
			
			var setStream = function(sound)
			{
				__self.hasSound = true;
				__self.sound = sound;
				__self.sound.play();
			};

			return SC.stream(url,setStream);
		};

		_self.toJSON = function()
		{
			return _self.attributes;
		};

		return _self;
	};

	var _Tracks = function()
	{
		var _self = this;

		_self.model = _Track;

		_self.models = [];

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

		_self.play = function(e, id) {
			var model = _self.getById(id);
			var target = e.target;
			$(target).toggleClass('play').toggleClass('pause');
			if(!model.hasSound)
			{
				model.getStreamTrackPlay();
				$(target).html('Pause');
			}
			else
			{
				if($(target).attr('class') == 'play')
				{
					$(target).html('Play');
					model.sound.pause();
				}
				else
				{
					$(target).html('Pause');
					model.sound.play();
				}
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
			var tmpl;
			tmpl = swig.compile(render.tracksTmpl);
			return tmpl({tracks:_self.toJSON()});
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

// SC.connect(function() {
// 	SC.get("/me",function(me) {
// 		console.log(me);
// 		alert("Hola, " + me.username);
// 	});
// });
// SC.get("/users/roberto-haziel-tienda-rodr-guez/favorites",function(tracks){
// 	var i;
// 	for(i = 0; i < tracks.length; i++)
// 	{
// 		SC.oEmbed(tracks[i].permalink_url,{},function(s){var track = $("<article>");track.html(s.html);$("#track").append(track)});
// 	}
// });