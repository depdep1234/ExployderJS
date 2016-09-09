/** 
 * @fileOverview 各種リソースを管理するクラスです。
 * 
 * @version 1.0.0
 */
"use strict";
(function(window, $, undefined){



/*
*	Define ResourceManager Class
*/
var ResourceManager = function(){
/****************************************************
*	private
****************************************************/
	var _imageLoader;
	var _htmlLoader;
	var _model;
	
/****************************************************
*	public
****************************************************/
	var exports = {
		init : function(){
			_model = Ex.Model.getInstance();
			_imageLoader = new Ex.ImageLoader();
			_htmlLoader = new Ex.HTMLLoader();
		},
		loadImages : function(img, cache, props){
			var _dfd = $.Deferred();
			_imageLoader.addImages(img);
			_imageLoader
				.start(cache)
				.done(function(){
					//setTimeout(function(){
				        _dfd.resolve();
				    //}, 300);
				})
				.fail(function(){
					_dfd.reject();
				});
			return _dfd.promise();
		},
		getImageLoader : function(){
			
			return _imageLoader;
		},
		getHTMLLoader : function(){
			
			return _htmlLoader;
		},
		loadHTMLFiles : function(htmlFiles, cache){
			var _dfd = $.Deferred();
			
			_htmlLoader.addHTMLFiles(htmlFiles);
			_htmlLoader.start(cache)
				.done(function(){
					_dfd.resolve();
				})
				.fail(function(){
					_dfd.reject();
				});
				
			return _dfd.promise();
		},
		/** 
		 * @return Model
		 */
		find : function(type, key){
			var resource = undefined;
			
			switch(type){
				case "image":
					resource = _imageLoader.find(key);	//Model
					break;
				case "html":
					resource = _htmlLoader.find(key);	//Model
					break;
				case "html_data":
					resource = _htmlLoader.getHTMLDataById(key);	//Row HTML Element
					break;
				default :
					break;
			}
			
			return resource;
		}
	};
	
	exports.init();
	
	return exports;
};



Ex.createClass("ResourceManager", ResourceManager, true);
Ex.ResourceManager.LOAD_SUCCESS = "load_success";
Ex.ResourceManager.LOAD_COMPLETE = "load_complete";
Ex.ResourceManager.LOAD_ERROR = "load_error";



}(this, jQuery));
