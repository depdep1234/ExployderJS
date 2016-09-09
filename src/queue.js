/** 
 * @fileOverview 汎用的なキューを定義します
 * 
 * @version 1.0.0
 */
"use strict";
(function(window, undefined){


/*
*	Define Queue Class
*/
var Queue = function(){
/****************************************************
*	private
****************************************************/
	var _ary = [];
	
/****************************************************
*	public
****************************************************/
	var exports = {
		getAry : function(){
			return _ary;
		},
		enqueue : function(obj){
			exports.getAry().push(obj);
			return obj;
		},
		dequeue : function(){
			if(exports.getAry().length > 0){
		　　　　　　return exports.getAry().shift();
		　　　　};
		　　　　return null;
		},
		size : function(){
			return exports.getAry().length;
		},
		destroy : function(){
			var length = exports.getAry().length;
			var i;
			for(i=0;i<length;i++){
				_ary[i]=null;
				_ary.shift();
			}
		}
	};
	
	return exports;
};
Ex.createClass("Queue", Queue);


}(this));

