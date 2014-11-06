var createSound = function(element)
{
	var $element = $(element);
	var uri = "/soundcloud/tracks/";
	var options = {};
	var id = Number($element.attr("id"));
	var waveform = new Waveform({container:$element.find(".waveform")[0],innerColor:"#555",height:60,croppe:true});
	waveform.dataFromSoundCloudTrack({waveform_url:$element.find(".waveform").attr("data-url")});

	var soundoptions = waveform.optionsForSyncedStream();

	options.id = id;
	options.url = uri+id;
	options.whileplaying = soundoptions.whileplaying;
	options.whileloading = soundoptions.whileloading;

	var sound = soundManager.createSound(options);
	sound.Waveform = waveform;
	return sound;
};
$(function() {
	soundManager.onready(function() {
		var $tracks;
		var sounds,i;

		sounds = [];
		$tracks = $(".track");

		for(i = 0; i < $tracks.length; i++)
		{
			sounds.push(createSound($tracks[i]));
		}

		window.sounds = sounds;
	});
	$(".track-controls").on("click",".btn",function() {
		var e = $(event.srcElement || event.currentElement);
		var parentcontainer = e.parent().parent().parent();
		var id = Number(parentcontainer.attr("id"));
		if(e.hasClass("play")) {
			e.removeClass("play").addClass("pause");
			soundManager.getSoundById("id").play();
		}
		else if(e.hasClass("pause")) {
			e.removeClass("pause").addClass("play");
			soundManager.getSoundById("id").pause();
		}
	});
});