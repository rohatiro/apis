window._Track = Backbone.Model.extend({
	initialize:function()
	{
		var options = {};
		var attrs = this.toJSON();
		var $element = $("#"+attrs.oid);
		var waveform = new Waveform({container:$element.find(".waveform")[0],innerColor:"#555",height:60,croppe:true});
		waveform.dataFromSoundCloudTrack({waveform_url:$element.find(".waveform").attr("data-url")});
		var soundoptions = waveform.optionsForSyncedStream();

		options.id = attrs.id;
		options.url = attrs.track_url;
		options.whileplaying = soundoptions.whileplaying;
		options.whileloading = soundoptions.whileloading;

		var sound = soundManager.createSound(options);
		sound.model = this;

		this.waveform = waveform;
		this.sound = sound;
	},
	validate:function(attributes)
	{
		if(!attributes.id)
			return "El modelo necesita la propiedad de 'oid', este  es el id del track de soundcloud";
		else if(!attributes.element)
			return "El modelo necesita la propiedad de 'id'";
		else if(!attributes.waveform_url)
			return "El modelo necesita la propiedad de 'waveform_url', este es la url del waveform del track de soundlcoud";
		else if(!attributes.track_url)
			return "El modelo necesita la propiedad de 'track_url', este es la url del stream del track de soundlcoud";
		return false;
	}
});
window.Track_Waveform = Backbone.View.extend({
	events: {
		"click .track-controls .btn.play": "play",
		"click .track-controls .btn.pause": "pause"
	},
	initialize: function(model)
	{
		this.model = model;
	},
	play: function(event) {
		var self = this;
		var e = $(event.currentTarget);
		var parentcontainer = e.parent().parent().parent();
		e.removeClass("play").addClass("pause");
		var id = Number(parentcontainer.attr("id"));
		id = self.collection.where({oid:id})[0].toJSON().id;
		soundManager.getSoundById(id).play();
	},
	pause: function(event) {
		var self = this;
		var e = $(event.currentTarget);
		var parentcontainer = e.parent().parent().parent();
		e.removeClass("pause").addClass("play");
		var id = Number(parentcontainer.attr("id"));
		id = self.collection.where({oid:id})[0].toJSON().id;
		soundManager.getSoundById(id).pause();
	},
});
window._Tracks = Backbone.Collection.extend({
	model:_Track
});
var createWaveform = function(track)
{
	var attrs,id;
	attrs = track.toJSON();
	id = attrs.oid;
	track.el = "#"+id;
	track.view = new Track_Waveform(track);
};
var createSound = function(element)
{
	var attrs = {};
	var $element = $(element);
	var id = Number($element.attr("id"));
	var uri = window.location.protocol + "//" + window.location.host + "/soundcloud/tracks/" + id;
	attrs.oid = id;
	attrs.id = "T-"+uri+"-"+Math.random();
	attrs.waveform_url = $element.find(".waveform").attr("data-url");
	attrs.track_url = uri;

	var sound = Tracks.add(attrs);
	return sound;
};
window.Tracks = new _Tracks();
window.Tracks.on("add",createWaveform);
window.is992 = false;
window.is768 = false;
$(function() {
	soundManager.onready(function() {
		var $tracks;
		var sounds,i;

		sounds = [];
		$tracks = $(".track");

		for(i = 0; i < $tracks.length; i++) createSound($tracks[i]);

		w = $(window);
		w.resize(function() {
			var i;
			if(w.width() <= 992 && !window.is992)
			{
				for(i=0;i<Tracks.length;i++)
					Tracks.models[i].waveform.redrawCstm();
				window.is992 = true;
			}
			else if(w.width() <= 768 && !window.is768)
			{
				for(i=0;i<Tracks.length;i++)
					Tracks.models[i].waveform.redrawCstm();
				window.is768 = true;
			}
			else if(w.width() > 992)
			{
				window.is992 = false;
				window.is768 = false;
			}
		});
	});
});