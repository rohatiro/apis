var $playlist;
var validator = function(options) {
	var _options = options;
	this.classform = options.classform;
	_options.fields = {};
	_options.isValid = false;
	var self = this;
	this.$el = $(this.classform);
	this.inputValidate = function(e) {
		e.preventDefault();
		var field = $(this);
		var type = field.attr("type");
		var value = field.val();
		var urlExp = new RegExp("^(?:(?:http|https|ftp)://)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))?)(?::\d{2,5})?(?:/[^\s]*)?$","i");
		if(type=="url")
		{
			if(urlExp.test(value))
			{
				_options.isValid = true;
			}
			else
			{
				_options.isValid = false;
			}
		}
	};
	this.validate = function() {
		if(_options.isValid)
		{
			alert("Enviado");
		}
		else
		{
			alert("Error");
		}
	};
	this.$el.on("submit",function(e) {
		e.preventDefault();
		self.validate();
	}).on("submit","[type=submit]",function(e) {

	}).find("[name]").each(function() {
		var field = $(this);
		var name = field.attr("name");
		_options.fields[name] = field;
		field.on("change",self.inputValidate);
	});
};
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
		alert("hola");
	});
	validador = new validator({classform:".upload-form"});
});