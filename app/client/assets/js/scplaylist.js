var $playlist;
var tracktemplate = swig.compile('<div class="track" id="{{ fav.id }}"><div class="track-dragcontoler"></div><div class="track-container"><span class="track-music-icon"></span><div class="track-info-container"><p class="track-title">{{ fav.title }}</p></div></div></div>');

$(function() {
	window.Player = new _Player({container:player,height:400});
	
	var $tabs = $(".tabs");
	
	$tabs.tabs({
		active:0,
		activate:function(e,ui) {
			ui.oldTab.removeClass("active");
			ui.newTab.addClass("active");
		}
	});
	
	$tabs.find("> ul > li").first().addClass("active");
	
	$playlist = $("#playlist");
	
	$playlist.droppable({
		active:"ui-state-default",
		accept:":not(.ui-sortable-helper)",
		drop:function(e,ui) {
			var id = Number(ui.draggable.attr("id"));
			var track = $playlist.find("#"+id+".track");
			var cln;
			if(!track.length)
			{
				cln = ui.draggable.clone().append("<div class='delete'></div>");
				cln.appendTo(this);
			}
		}
	}).sortable({
		items:".track",
		handle:".track-dragcontoler",
		sort:function(e,ui) {
			$(this).removeClass("ui-state-default");
		}
	});

	$(".track").draggable({
		helper:"clone",
		cursor:"move"
	});

	$playlist.on("click",".delete",function(e) {
		$e = $(e.target);
		$e.parent().remove();
	});

	$playlist.on("click","a.play",function() {
		Player.container.style.display = "block";
		Player.play();
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
			values.id = values.url+"-T"+Math.random();
			values.title = decodeURIComponent(values.url);
			Player.addSrc(values.id,values.url);
			$playlist.find(".tracks>div").append(tracktemplate({"fav":values}));
			if($playlist.has(".track").length && $playlist.find(".controls .play").hasClass("disabled"))
				$playlist.find(".controls .play").removeClass("disabled");
			form.reset();
		}
	});
});