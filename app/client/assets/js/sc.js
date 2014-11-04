var createSound = function(element)
{
	var $element = $(element);
	var uri = "/soundcloud/tracks/";
	var options = {};
	var id = Number($element.attr("id"));
	var waveform = new Waveform({container:$element.find(".waveform")[0],innerColor:"#333",height:50,copper:true});
	waveform.dataFromSoundCloudTrack({waveform_url:tracks.first().find(".waveform").attr("data-url")});

	var soundoptions = waveform.optionsForSyncedStream();

	options.id = id;
	options.url = uri+id;
	options.whileplaying = soundoptions.whileplaying;
	options.whileloading = soundoptions.whileloading;

	var sound = soundManager.createSound(options);
	return sound;
};
$(function() {
	var $tracks;
	var sounds,i;

	sounds = [];
	$tracks = $(".tracks");

	for(i = 0; i < $tracks.length; i++)
	{
		sounds.push(createSound($tracks[i]));
	}
});