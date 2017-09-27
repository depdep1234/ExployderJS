/** 
 * @fileOverview body要素のコントローラー
 * 
 * @version 1.0.0
 */
(function(window, $, undefined){

/*
*	Define BodyController Class
*/
Ex.Controller.getInstance().create({
	init : function(args){
		var self = this;
		self.setElement(args[0]);
	},
	events : {
		"click" : function(e){
			console.log("hoisdjflkasjdjkl");
		},
		"mouseenter" : function(e){
			console.log("fsdafkjsdkfal;");
		}
	},
	windowResize : function(e){
		console.log($(window).width());
	}
},"dom", "BodyController", true);


}(this, jQuery));

