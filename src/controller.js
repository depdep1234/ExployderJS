/** 
 * @fileOverview コントローラーを管理するためのクラスです。
 * 
 * @version 1.0.0
 */
//"use strict";
(function(window, $, undefined){

/*
*	Define Controller Class as Singleton
*/
var Controller = function(){
/****************************************************
*	private
****************************************************/
	var _list = {};
	var _dataHolder;
	var _init = function(){
		_dataHolder = Ex.Model.getInstance().create({
			"windowSize" : {"width" : $(window).width(), "height" : $(window).height()}
		});
		$(window).bind("resize", function(){
			_dataHolder.setRecord("windowSize" , {"width" : $(window).width(), "height" : $(window).height()});
		});
	};
	
/****************************************************
*	public
****************************************************/
	var exports = {
		create : function(includes, type, className, isSingleton){
			var Constructor;
			
			switch(type){
				case "dom" :
					Constructor = DomController(includes);
					break;
				default:
					break;
			};
			
			var b;
			if(isSingleton==true){
				b = true;
			}else{
				b = false;
			};
			Ex.createClass(className, Constructor, b);
		},
		getWindowSize : function(){
			return _dataHolder.getRecord("windowSize");
		},
		addList : function(controller){
			_list[controller.getID()] = controller;
		},
		find : function(element){
			var id;
			for(var _key in _list){
				if(_list[_key].getElement()!==undefined && _list[_key].getElement().get(0) === element.get(0)){
					id = _key;
					break;
				}
			}
			if(id===undefined){return undefined};
			return _list[id];
		},
		destroy : function(element){
			var id;
			for(var _key in _list){
				if(_list[_key].getElement()!==undefined && _list[_key].getElement().get(0) === element.get(0)){
					id = _key;
					break;
				}
			}
			if(id===undefined){return};
			_list[id].removeAllEventListener();
			_list[id] = null;
			delete _list[id];
		}
	};
	
	_init();
	
	//return exports member
	return exports;
};
Ex.createClass("Controller", Controller, true);


/** 
 * @fileOverview 単一のDomElementをコントロールするためのクラスを定義します。
 * 
 * @author Createch.Inc
 * @version 1.0.0
 */
var DomController = function(includes){
	
	return function(){
	/****************************************************
	*	private
	****************************************************/
		var _id;
		var _element;
		var _events = {};
		
	/****************************************************
	*	public
	****************************************************/
		var exports = {
			init : function(){
				
			},
			getID : function(){
				return String(_id);
			},
			setElement : function(selector){
				_element = $(selector);
			},
			getElement : function(){
				return _element;
			},
			util : undefined,
			manager : undefined,
			include : function(obj){
				if(typeof obj === "function"){
					obj = exports.proxy(obj, exports);
				}
				$.extend(exports, obj);
			},
			$ : function(selector){
				return $(selector, exports.getElement());
			},
			anim : undefined,
			fixedWidth : undefined,
			fixedHeight : undefined,
			fixedTop : undefined,
			fixedLeft : undefined,
			fixedRight : undefined,
			fixedBottom : undefined,
			fixedOpacity : undefined,
			timer : undefined,
			addChild : function(controller, selector){
				var _dfd = $.Deferred();
				if($.contains(exports.getElement().get(0), controller.getElement().get(0))===true){_dfd.resolve();return _dfd.promise()};
				//DOMに追加
				if(exports.getElement().find(selector).size()!==0){
					$(selector,exports.getElement()).append(controller.getElement());
				}else{
					exports.getElement().append(controller.getElement());
				}
				//controller.getElement()にイベント追加
				exports.removeAllEventListener();
				exports.addAllEventListener();
				//子要素をリンケージ
				Ex.Linkage.getInstance().bindController($(controller.getElement()));
				
				//controllerのonAddedを実行
				controller.onAdded()
					.then(function(){
						_dfd.resolve();
					},function(){
						_dfd.resolve();
					});
				return _dfd.promise();
			},
			onAdded : function(){
				var _dfd = $.Deferred();
				_dfd.resolve();
				return _dfd.promise();
			},
			removeChild : function(controller){
				var _dfd = $.Deferred();
				if($.contains(exports.getElement().get(0), controller.getElement().get(0))===false){_dfd.resolve();return _dfd.promise()};
				//controller.getElement()のイベント削除（念のため）
				controller.removeAllEventListener();
				
				controller.onRemoved()
					.then(function(){
						//子要素のリンケージを削除
						Ex.Linkage.getInstance().unbindController($(controller.getElement()));
						// controller.getElement().remove();
						controller.getElement().detach();
						_dfd.resolve();
					},function(){
						//子要素のリンケージを削除
						Ex.Linkage.getInstance().unbindController($(controller.getElement()));
						// controller.getElement().remove();
						controller.getElement().detach();
						_dfd.resolve();
					});
				
				return _dfd.promise();
			},
			onRemoved : function(){
				var _dfd = $.Deferred();
				_dfd.resolve();
				return _dfd.promise();
			},
			wait : function(time){
				var _dfd = $.Deferred();
				
				exports.timer = setTimeout(function(){
					_dfd.resolve();
				}, time);
				
				return _dfd.promise();
			},
			clearWait : function(){
				clearTimeout(exports.timer);
			},
			proxy : function(func, context){
				return $.proxy(func, context);
			},
			removeAllEventListener : function(){
				if(exports.windowResize!==undefined){
					$(window).off("resize", _events["window_resize"]);
				};
				if(exports.events!==undefined){
					for(var eventName in exports.events){
						exports.getElement().off(eventName, _events[eventName]);
					}
				};
				if(exports.hammer!==undefined){
					for(var eventName in exports.hammer){
						exports.getElement()
							.hammer()
							.off(eventName, _events[eventName]);
					}
				};
			},
			addAllEventListener : function(){
				if(exports.windowResize!==undefined){
					_events["window_resize"] = exports.proxy(exports.windowResize, exports);
					$(window).on("resize", _events["window_resize"]);
				};
				//add eventListener
				if(exports.events!==undefined){
					for(var eventName in exports.events){
						_events[eventName] = exports.proxy(exports.events[eventName], exports);
						exports.getElement().on(eventName, _events[eventName]);
					}
				};
				//add HammerJS eventListener
				if(exports.hammer!==undefined){
					for(var eventName in exports.hammer){
						_events[eventName] = exports.proxy(exports.hammer[eventName][1], exports);
						exports.getElement()
							.hammer(exports.hammer[eventName][0])
							.on(eventName, _events[eventName]);
					}
				};
				//add TouchSwipe.js eventListener
				if(exports.touchSwipe!==undefined){
					for(var property in exports.touchSwipe){
						if(typeof exports.touchSwipe[property] === "function"){
							exports.touchSwipe[property] = exports.proxy(exports.touchSwipe[property], exports);
						}
					}
					_events["touchSwipe"] = exports.touchSwipe;
					exports.getElement().swipe(_events["touchSwipe"]);
				};
			}
		};
		
		_id = Ex.Util.getInstance().createGUID();
		
		if(includes){
			for(var key in includes){
				if(key === "id" || key === "element" || key === "include" || key === "$" || key === "proxy" || key === "removeAllEventListener" || key ==="addChild" || key ==="removeChild" || key ==="promise" || key ==="done" || key ==="reject"){
					delete includes[key];
				}
			};
			exports.include(includes);
		};
		
		//initialize
		//exports.util = Ex.Util.getInstance();
		//exports.manager = Ex.SceneManager.getInstance();
		exports.init.apply(exports, arguments);
		
		//exports.addAllEventListener();
		
		Ex.Controller.getInstance().addList(exports);
		
		return exports;
	}
};

}(this, jQuery));

