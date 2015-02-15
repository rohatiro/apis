var $playlist;
var tracktemplate = swig.compile('<div class="track" id="{{ fav.id }}"><div class="track-dragcontoler"></div><div class="track-container"><span class="track-music-icon"></span><div class="track-info-container"><p class="track-title">{{ fav.title }}</p></div></div></div>');

$(function() {
	window.Player = new _Player({container:"#player",height:400,playlistcontainer:"#playlist"});
	
	var $tabs = $(".tabs");
	
	$tabs.tabs({
		active:0,
		activate:function(e,ui) {
			ui.oldTab.removeClass("active");
			ui.newTab.addClass("active");
		}
	});
	
	$tabs.find("> ul > li").first().addClass("active");

	$(".track").draggable({
		helper:"clone",
		cursor:"move"
	});

	$(".upload-form").validate({
		rules:{
			url:"required"
		},
		submitHandler:function(form) {
			var values = {};
			$.each($(form).serializeArray(),function(i,e) {
				values[e.name] = e.value;
			});
			values.id = (values.url+"-T"+Math.random()).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "");
			values.title = decodeURIComponent(values.url);
			Player.addSrc(values.id,values.url);
			Player.playlistcontainer.find(".tracks>div").append(tracktemplate({"fav":values}));
			if(Player.playlistcontainer.has(".track").length && Player.playlistcontainer.find(".controls .play").hasClass("disabled"))
				Player.playlistcontainer.find(".controls .play").removeClass("disabled");
			form.reset();
		}
	});
});