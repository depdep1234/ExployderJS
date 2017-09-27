/** 
 * @fileOverview Flashのリンケージのような枠組みを定義します
 * 
 * @version 1.0.0
 */
// "use strict";	
(function(window, $, undefined){


/*
*	Define DataBinding Class
*/
var Linkage = function(){
/****************************************************
*	private
****************************************************/
	var _init = function(){
		
	};
	
/****************************************************
*	public
****************************************************/
	var exports = {
		/*
		*	引数で渡された任意のHTML要素を対象にdata-ex-controller属性で指定されたコントローラーを紐付けます。
		*/
		bindController : function(element, name){
			var elements = $("[data-ex-controller]", element);
			var num = elements.size();
			if(element.attr("data-ex-controller")!==undefined){
				elements.add(element);
			}
			elements.each(function(elementIndex){
				if(Ex.Controller.getInstance().find($(this))!==undefined){return};
				var className = $(this).attr("data-ex-controller");
				var length = className.split(".").length;
				var i;
				var object = window;
				for(i=0;i<length;i++){
					object = object[className.split(".")[i]];
				}
				
				if(object!==undefined && object.getInstance === undefined){
					(new object($(this))).addAllEventListener();
				}else if(object!==undefined && object.getInstance !== undefined){
					object.getInstance($(this));
					object.getInstance($(this)).addAllEventListener();
				}
				
				if(elementIndex===num-1){
					$(exports).trigger(name + "_linkage_complete");
				}
			});
		},
		/*
		*	引数で渡された任意のHTML要素を対象にコントローラーとの紐付けを解除します。
		*/
		unbindController : function(element){
			var elements = $("[data-ex-controller]", element);
			if(element.attr("data-ex-controller")!==undefined){
				elements.add(element);
			}
			elements.each(function(){
				if(Ex.Controller.getInstance().find($(this))===undefined){return};
				Ex.Controller.getInstance().destroy($(this));
			});
		},
		bind : function(eventName, listener){
			$(exports).bind(eventName, listener);
		},
		unbind : function(eventName, listener){
			$(exports).unbind(eventName, listener);
		}
	};
	
	_init();
	
	return exports;
};
Ex.createClass("Linkage", Linkage, true);


}(this, jQuery));

