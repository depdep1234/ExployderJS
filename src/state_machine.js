/** 
 * @fileOverview オブジェクトの状態管理をするクラスです
 * 
 * @version 1.0.0
 */
"use strict";
(function(window, $, undefined){


/*
*	Define StateMachine Class
*/
var StateMachine = function(){
/****************************************************
*	private
****************************************************/
	var _init = function(){
		
	};
	
/****************************************************
*	public
****************************************************/
	var exports = {
		add : function(controller){
			$(exports).bind("change", function(e, current){
				if(controller === current){
					controller.activate();
				}else{
					controller.deactivate();
				}
			});
			controller.active = function(){
				$(exports).trigger("change", controller);
			}
		}
	};
	
	_init();
	
	return exports;	
};
Ex.createClass("StateMachine", StateMachine);


}(this, jQuery));
