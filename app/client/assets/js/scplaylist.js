var $playlist;
$(function() {
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
});