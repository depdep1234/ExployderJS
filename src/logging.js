/** 
 * @fileOverview ページ上にログを表示するためのクラスです
 * 
 * @version 1.0.0
 */
// "use strict";
(function(window, $, undefined){



/*
*	Define Logging Class
*/
Ex.Controller.getInstance().create({
	logList : [],
	height : "100px",
	init : function(args){
		var self = this;
		self.setElement($("<div id=\"logContainer\"></div>"));
		
		self.getElement().css({
			position : "fixed",
			left : "0",
			bottom : "0",
			width : "100%",
			height : self.height,
			/*padding : "10px",*/
			overflow : "auto",
			"background-color" : "rgba(0,0,0,0.5)"
		});
		
	},
	output : function(str){
		var self = this;

		self.logList.push(new Ex.LogItem(str));
		self.addChild(self.logList[self.logList.length-1]);
	},
	setSize : function(width, height){
		var self = this;
		
		self.getElement().css({
			width : width,
			height : self.height
		});
	},
	windowResize : function(e,triggerData){
		
	}
},"dom", "Logging", true);


/*
*	Define LogItem Class
*/
Ex.Controller.getInstance().create({
	str : "",
	init : function(args){
		var self = this;
		self.str = args
		self.setElement($("<p class=\"logItem\">"+ self.str +"<p>"));
		
		self.getElement().css({
			padding : "5px 10px",
			"background-color" : "rgba(0,0,0,0.8)",
			color : "#999999",
			"font-size" : "75%",
			"border-bottom" : "1px solid #000000",
			opacity : 0
		});
		
	},
	onAdded : function(){
		var self = this;
		var _dfd = $.Deferred();

		self.getElement().css({
			opacity : 1
		});

		_dfd.resolve();

		return _dfd.promise();
	},
	onRemoved : function(){
		var self = this;
		var _dfd = $.Deferred();

		self.getElement().css({
			opacity : 0
		});

		_dfd.resolve();

		return _dfd.promise();
	}
},"dom", "LogItem");




}(this, jQuery));
