/** 
 * @fileOverview 汎用的なHTMLローダーです。
 * 
 * @version 1.0.0
 */
// "use strict";
(function(window, undefined){


/*
*	Define ImageLoader Class
*/
var HTMLLoader = function(){
	/**
	*	private
	**/
	var _htmlFiles;	//Model
	
	
	//public
	var exports = {
		init : function(){
			_htmlFiles = Ex.Model.getInstance().create({
				"resource" : {},	//Hash
				"count" : 0
			});
		},
		add : function(fileName, id){
			_htmlFiles.getRecord("resource")[id] = Ex.Model.getInstance().create({
				"data" : undefined,
				"fileName" : fileName,
				"loaded" : false
			});
			_htmlFiles.setRecord("count", Number(exports.getCount()) + 1);
		},
		addHTMLFiles : function(htmlFiles){
			var length;
			//全てのHTMLファイルを登録
			if(htmlFiles instanceof Array){
				length = htmlFiles.length;
				for(var i=0;i<length;i++){
					exports.add(htmlFiles[i][0],htmlFiles[i][1]);
				}
			}
		},
		start : function(cache){
			var _dfd = $.Deferred();
			var count=0;
			var ary = [];
			var htmlFiles = _htmlFiles.getRecord("resource");
			
			for(var key in htmlFiles){
				(function(id){
					var a = $.ajax({
					  		url : htmlFiles[id].getRecord("fileName"),
					  		cache : cache
						});
					
					a
					.done(function(data){
						htmlFiles[id].setRecord("data", data);
						//console.log(htmlFiles[id].getRecord("fileName") + " loaded!");
					})
					.fail(function(){
						//console.log(htmlFiles[id].getRecord("fileName") + " load failed...");
					});
					if(htmlFiles[id].getRecord("loaded")===false){
						ary.push(a);
					}
				})(key);
			};
			
			$.when
				.apply($, ary)
				.done(function(data){
					_dfd.resolve();
				})
				.fail(function(){
					_dfd.reject();
				});
			
			return _dfd.promise();
		},
		setCount : function(count){
			_htmlFiles.setRecord("count", count);
		},
		getCount : function(){
			return _htmlFiles.getRecord("count");
		},
		find : function(key){
			return _htmlFiles.getRecord("resource")[key];
		},
		setHTMLDataById : function(id, htmlData){
			_htmlFiles.getRecord("resource")[id].setRecord("data", htmlData);
		},
		getHTMLDataById : function(id){
			return _htmlFiles.getRecord("resource")[id].getRecord("data");
		}
	};
	
	exports.init();
	
	return exports;
};
Ex.createClass("HTMLLoader", HTMLLoader);





}(this));