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
				case "canvas" :
					Constructor = CanvasController(includes);
					break;
				case "canvasDisplayObject":
					Constructor = CanvasDisplayObjectController(includes);
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
			_list[controller.getId()] = controller;
		},
		find : function(element){
			var id;;
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
			getId : function(){
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



/** 
 * @fileOverview 単一のCanvasをコントロールするためのクラスを定義します。
 * 
 * @version 1.0.0
 */
var CanvasController = function(includes){
	
	return function(){
	/****************************************************
	*	private
	****************************************************/
		var _id;
		var _element;
		var _FPS = 30;
		var _minWidth = 1200;
		var _minHeight = 761;
		var _maxWidth = "100%";
		var _maxHeight = "100%";
		var _stage;		//instance of Stage
		var _width;
		var _height;
		var _events = {};
		var _adjustCanvas = function(){
				var windowWidth = Ex.Controller.getInstance().getWindowSize().width;
				var windowHeight = Ex.Controller.getInstance().getWindowSize().height;
				
				if(exports.getMinWidth() === exports.getMaxWidth()){
					_width = exports.getMinWidth();
				}else if(exports.getMinWidth() >= windowWidth){
					_width = exports.getMinWidth();
				}else if(windowWidth <= exports.getMaxWidth()){
					_width = windowWidth;
				}else{
					_width = exports.getMaxWidth();
				};
				
				if(exports.getMinHeight() === exports.getMaxHeight()){
					_height = exports.getMinHeight();
				}else if(exports.getMinHeight() >= windowHeight){
					_height = exports.getMinHeight();
				}else if(windowHeight <= exports.getMaxHeight()){
					_height = windowHeight;
				}else{
					_height = exports.getMaxHeight();
				};
				// console.log(_width);
				exports.getElement().attr("width", _width);
				exports.getElement().attr("height", _height);
				exports.trigger("canvas_resize");
			};

		
		var _tick = function(){
			//_stage.update();
		};
		
	/****************************************************
	*	public
	****************************************************/
		var exports = {
			init : function(){
				
			},
			getId : function(){
				return String(_id);
			},
			setId : function(id){
				_id = id;
			},
			setElement : function(selector){
				_element = $(selector);
			},
			getElement : function(){
				return _element;
			},
			getStage : function(){
				return _stage;
			},
			util : undefined,
			manager : undefined,
			getWidth : function(){
				return _width;
			},
			getHeight : function(){
				return _height;
			},
			setMinWidth : function(width){
				_minWidth = width;
			},
			getMinWidth : function(){
				return _minWidth;
			},
			setMinHeight : function(height){
				_minHeight = height;
			},
			getMinHeight : function(){
				return _minHeight;
			},
			setMaxWidth : function(width){
				_maxWidth = width;
			},
			getMaxWidth : function(){
				if(_maxWidth === "100%"){
					return Ex.Controller.getInstance().getWindowSize().width;
				}
				return _maxWidth;
			},
			setMaxHeight : function(height){
				_maxHeight = height;
			},
			getMaxHeight : function(){
				if(_maxHeight === "100%"){
					return Ex.Controller.getInstance().getWindowSize().height;
				}
				return _maxHeight;
			},
			include : function(obj){
				if(typeof obj === "function"){
					obj = exports.proxy(obj, exports);
				}
				$.extend(exports, obj);
			},
			$ : function(selector){
				return $(selector, exports.getElement());
			},
			proxy : function(func, context){
				return $.proxy(func, context);
			},
			start : function(){
				//Ticker.setFPS(_FPS);
				//Ticker.addListener(exports.stage);
			},
			//描画を停止
			stop : function(){
				createjs.Ticker.removeListener(_tick);
			},
			onAdded : function(){
				var _dfd = $.Deferred();
				exports.removeAllEventListener();
				exports.addAllEventListener();
				_dfd.resolve();
				return _dfd.promise();
			},
			onRemoved : function(){
				var _dfd = $.Deferred();
				exports.removeAllEventListener();
				_dfd.resolve();
				return _dfd.promise();
			},
			wait : function(time){
				var _dfd = $.Deferred();
				
				setTimeout(function(){
					_dfd.resolve();
				}, time);
				
				return _dfd.promise();
			},
			bind : function(eventName, func){
				$(exports).on(eventName, func);
			},
			unbind : function(eventName, func){
				$(exports).off(eventName, func);
			},
			trigger : function(eventName, triggerData){
				$(exports).trigger(eventName, triggerData);
			},
			removeAllEventListener : function(){
				if(exports.canvasResize!=undefined){
					$(exports).off("canvas_resize", _events["canvas_resize"]);
				};
				$(window).off("resize", _adjustCanvas);
				if(exports.windowResize!=undefined){
					$(window).off("resize", _events["window_resize"]);
				};
				if(exports.events!=undefined){
					for(var eventName in exports.events){
						exports.getElement().off(eventName, _events[eventName]);
					}
				};
			},
			addAllEventListener : function(){
				//add Resize eventListener
				if(exports.canvasResize!==undefined){
					_events["canvas_resize"] = exports.proxy(exports.canvasResize, exports);
					$(exports).on("canvas_resize", _events["canvas_resize"]);
				};
				$(window).on("resize", _adjustCanvas);
				
				if(exports.windowResize!=undefined){
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
			}
		};
		
		_id = Ex.Util.getInstance().createGUID();
		
		if(includes){
			for(var key in includes){
				if(key === "element"){
					exports.setElement(includes[key]);
					_stage = new createjs.Stage(exports.getElement().get(0));
					delete includes[key];
				}else if(key === "minWidth"){
					// _minWidth = includes[key];
					exports.setMinWidth(includes[key]);
					delete includes[key];
				}else if(key === "minHeight"){
					// _minHeight = includes[key];
					exports.setMinHeight(includes[key]);
					delete includes[key]
				}else if(key === "maxWidth"){
					// _maxWidth = includes[key];
					exports.setMaxWidth(includes[key]);
					delete includes[key]
				}else if(key === "maxHeight"){
					// _maxHeight = includes[key];
					exports.setMaxHeight(includes[key]);
					delete includes[key]
				}else if(key === "id" || key === "width" || key === "height" || key === "element" || key === "stage" || key === "include" || key === "$" || key === "proxy" || key === "removeAllEventListener"){
					delete includes[key];
				};
			};
			exports.include(includes);
		};
		
		//initialize
		exports.util = Ex.Util.getInstance();
		exports.manager = Ex.SceneManager.getInstance();
		exports.init.apply(exports, arguments);
		_adjustCanvas();
		
		//add modeChanged eventListener
		// if(exports.onModeChanged!==undefined){
		// 	Ex.DisplayMode.getInstance().bind(Ex.DisplayMode.Mode.MODE_CHANGED, exports.proxy(exports.onModeChanged, exports));
		// };
		
		// exports.addAllEventListener();
		
		Ex.Controller.getInstance().addList(exports);
			
		return exports;
	}
};



/** 
 * @fileOverview Canvasに表示される要素をコントロールするためのクラスを定義します。
 * 
 * @version 1.0.0
 */
var CanvasDisplayObjectController = function(includes){
	
	return function(){
	/****************************************************
	*	private
	****************************************************/
		var _id;
		var _displayObject;
		var _canvas;
		var _fixedPosition;
		
	/****************************************************
	*	public
	****************************************************/
		var exports = {
			init : function(){
				
			},
			getId : function(){
				return String(_id);
			},
			setId : function(id){
				_id = id;
			},
			setDisplayObject : function(displayObject){
				_displayObject = displayObject;
			},
			getDisplayObject : function(){
				return _displayObject;
			},
			getCanvas : function(){
				return _canvas;
			},
			util : undefined,
			manager : undefined,
			setPosition : function(x, y){
				_displayObject.x = x;
				_displayObject.y = y;
			},
			setScale : function(scaleX, scaleY){
				_displayObject.scaleX = scaleX;
				_displayObject.scaleY = scaleY;
			},
			setFixedPosition : function(args){
				_fixedPosition = {"x" : args[0], "y" : args[1]};
			},
			getFixedPosition : function(){
				return _fixedPosition;
			},
			wait : function(time){
				var _dfd = $.Deferred();
				
				setTimeout(function(){
					_dfd.resolve();
				}, time);
				
				return _dfd.promise();
			},
			bind : function(eventName, func){
				$(exports).on(eventName, func);
			},
			unbind : function(eventName, func){
				$(exports).off(eventName, func);
			},
			trigger : function(eventName, triggerData){
				$(exports).trigger(eventName, triggerData);
			},
			include : function(obj){
				if(typeof obj === "function"){
					obj = exports.proxy(obj, exports);
				}
				$.extend(exports, obj);
			},
			proxy : function(func, context){
				return $.proxy(func, context);
			}
		};
		
		_id = Ex.Util.getInstance().createGUID();
		
		if(includes){
			for(var key in includes){
				if(key === "id" || key === "displayObject" || key === "fixedPosition" || key === "include" || key === "canvas" || key === "setPosition" || key === "proxy" || key === "removeAllEventListener"){
					delete includes[key];
				}
			};
			exports.include(includes);
		};
		
		//add modeChanged eventListener
		// if(exports.onModeChanged!==undefined){
		// 	Ex.DisplayMode.getInstance().bind(Ex.DisplayMode.Mode.MODE_CHANGED, exports.proxy(exports.onModeChanged, exports));
		// };
		
		//initialize
		exports.util = Ex.Util.getInstance();
		exports.manager = Ex.SceneManager.getInstance();
		exports.init.apply(exports, arguments);
		
		//add eventListener
		if(exports.events!=undefined){
			for(var eventName in exports.events){
				//exports.getElement().bind(eventName, exports.proxy(exports.events[eventName]));
				//exports.getElement().bind(eventName, exports.proxy(exports.events[eventName], _element));
				switch(String(eventName)){
					case "click":
						exports.getDisplayObject().addEventListener("click", exports.proxy(exports.events[eventName], exports));
						break;
					case "mouseover":
						exports.getDisplayObject().addEventListener("mouseover", exports.proxy(exports.events[eventName], exports));
						break;
					case "mouseout":
						exports.getDisplayObject().addEventListener("mouseout", exports.proxy(exports.events[eventName], exports));
						break;
					case "update":
						exports.getDisplayObject().addEventListener("tick", exports.proxy(exports.events[eventName], exports));
						break;
				}
			}
		};
		// Ex.Controller.getInstance().addList(exports);
			
		return exports;
	}
};







}(this, jQuery));

