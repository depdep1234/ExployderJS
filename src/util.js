/** 
 * @fileOverview ユーティリティ類をまとめたライブラリです。
 * 
 * @version 1.0.0
 */
// "use strict";
(function(window, undefined){

var navigator = window.navigator;

/*
*	Define Util Class as Singleton
*/
var Util = function(){
	/**
	*	private
	**/
	var _baseURL;
	var _accessURL;
	var _basePath;
	var _randomTable;
	
	//public
	var exports = {
		init : function(){
			//set base path
			if($("link[rel=\"index\"]").size()!=0){
				exports.setBasePath($("link[rel=\"index\"]").attr("href").split("index.html")[0]);
			}else{
				exports.setBasePath($("script[src*=\"\/util.js\"]").attr("src").split("util.js")[0]);
			};
			// exports.setBaseURL(window.location.pathname);
		},
		getBaseURL : function(){
			return _baseURL;
		},
		setBaseURL : function(url){
			_baseURL = url;
		},
		getAccessURL : function(){
			return _accessURL;
		},
		setAccessURL : function(url){
			_accessURL = url;
		},
		setBasePath : function(s){
			_basePath = s;
		},
		getBasePath : function(){
			return _basePath;
		},
		isHashEmpty : function(hash){
			for(var i in hash){return false};
			return true;
		},
		createGUID : function(){
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c){
				var r = Math.random()*16|0,
					 v = c == "x" ? r : (r&0x3|0x8);
				return v.toString(16);
			}).toUpperCase();
		},
		getPosiOrNega : function(){
			var r = exports.getRandom()-0.5;
			if(r<0){
				r = -1;
			}else{
				r = 1;
			};
			return r;
		},
		setRandomTable : function(ary){
			_randomTable.setRecord("table",ary);
		},
		getRandom : function(){
			var self = this;
			var r;
			
			var p = _randomTable.getRecord("pointer");
			if(p === _randomTable.getRecord("length")){
				p = 0;
			}else{
				p = p+1;
			}
			_randomTable.setRecord("pointer", p);
			r = _randomTable.getRecord("table")[p];
			
			return r;
		},
		initRandomTable : function(num){
			var self = this;
			var _dfd = $.Deferred();
			
			//create data
			_randomTable = Ex.Model.getInstance().create({
				"table" : [],
				"pointer" : 0,
				"length" : undefined
			});
			
			var ary = [];
			var i;
			for(i=0;i<num;i++){
				ary.push(Math.random());
				if(i===num-1){
					self.setRandomTable(ary);
					_randomTable.setRecord("length", num);
					_dfd.resolve();
				}
			}
			return _dfd.promise();
		},
		shuffleArray : function(ary){
		    var i = ary.length;
		    var ary2 = ary.concat();
		    while(i){
		        var j = Math.floor(Math.random()*i);
		        var t = ary2[--i];
		        ary2[i] = ary2[j];
		        ary2[j] = t;
		    }
		    return ary2;
		},
		disableContextMenu : function(selector){
			$(selector).bind("contextmenu", contextMenuHandler);
			function contextMenuHandler(){
				return false;
			}
		},
		getBrowser: function(){
			var ua = navigator.userAgent;
			var browserData = {};
			
			if(ua.match(/MSIE ([\.\d]+)/)) {
				if (ua.match(/Trident\/4\.0/)) {
					//browserData = { type:1, name:'IE', version:RegExp.$1, ua:ua }
					browserData = { type:1, name:'IE', version:"8.0", ua:ua }
				}
				else {
					browserData = { type:1, name:'IE', version:RegExp.$1, ua:ua }
				}
			} else if (ua.match(/Chrome\/([\.\d]+)/)){
				browserData = { type:2, name:'chrome', version:RegExp.$1, ua:ua };
			} else if (ua.match(/Version\/([\.\d]+) Safari/)){
				browserData = { type:3, name:'safari', version:RegExp.$1, ua:ua };
			} else if (ua.match(/Opera\/([\.\d]+)/)){
				browserData = { type:4, name:'opera', version:RegExp.$1, ua:ua };
			} else if (ua.match(/Gecko/)){
				if (ua.match(/(Firebird|Firefox)\/([\.\d]+)/)){
					browserData = { type:5, name:String(RegExp.$1).toLowerCase(), version:RegExp.$2, ua:ua };
					this.isFirefox = true;
				}
			}else{
				browserData = { type:6, name:'other', version:0, ua:ua };
			};
			return browserData;
		},
		getPlatform: function(){
			var ua = navigator.userAgent;
			var platformData = {};
			
			if(ua.match(/iPhone/)){
				platformData = { type:1, name:'iPhone', version:'', ua:ua }
			}else if(ua.match(/iPod/)){
				platformData = { type:2, name:'iPod', version:'', ua:ua }
			}else if(ua.match(/Android/)){
				platformData = { type:3, name:'Android', version:'', ua:ua }
			}else if(ua.match(/iPad/)){
				platformData = { type:9, name:'iPad', version:'', ua:ua }
			}else if(ua.match(/Windows Phone OS/)){
				platformData = { type:8, name:'windows phone', version:'7', ua:ua }
			}else if (ua.match(/Win(dows )?NT 6\.1/)){
				platformData = { type:4, name:'windows', version:'7', ua:ua }
			} else if (ua.match(/Win(dows )?NT 6\.0/)){
				platformData = { type:5, name:'windows', version:'vista', ua:ua };
			} else if (ua.match(/Win(dows )?(NT 5\.1|XP)/)){
				platformData = { type:6, name:'windows', version:'xp', ua:ua };
			} else {
				platformData = { type:7, name:'other', version:0, ua:ua };
			};
			return platformData;
		}
	};
	
	exports.init();
	
	//return exports member
	return exports;
};
Ex.createClass("Util", Util, true);




}(this));

