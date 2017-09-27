/**
 * @fileOverview
 *
 * @version 1.0.0
 */
// "use strict";
(function(window, undefined){


/*
*   Define PubSub Class
*/
var PubSub = function(obj){
/****************************************************
*   public
****************************************************/
    var _exports = {
        mixin : function(obj){
            if(obj.pubsub){
                console.log("Caution! overwrite 'pubsub' object");
            }
            obj.pubsub = new PubSubTemplate();
        }
    };

    return _exports;
};
Ex.createClass("PubSub", PubSub, true);

/*
*   Define PubSubTemplate Class
*/
var PubSubTemplate = function(){
/****************************************************
*   private
****************************************************/
    var _events = {};

    var _addListener = function(eventName, listener){
        if(_events[eventName]){

        }else{
            _events[eventName] = [];
        }
        _events[eventName].push(listener);
    }

    var _removeListener = function(eventName, listener){
        if(_events[eventName]){
            var length = _events[eventName].length;
            for(var i=0;i<length;i++){
                if(_events[eventName][i]===listener){
                    _events[eventName].splice(i, 1);
                }
            }
        }
    }

    var _dispatchEvent = function(eventName, obj){
        if(_events[eventName]){
            var length = _events[eventName].length;
            for(var i=0;i<length;i++){
                _events[eventName][i](_exports, obj);
            }
        }
    }

/****************************************************
*   public
****************************************************/
    var _exports = {
        //publish event
        trigger : function(eventName, obj){
            _dispatchEvent(eventName, obj);
        },
        //subscribe event
        bind : function(eventName, listener){
            _addListener(eventName, listener);
        },
        //unsubscribe event
        unbind : function(eventName, listener){
            _removeListener(eventName, listener);
        },
        isBinded : function(eventName, listener){
            if(_events[eventName]){
                var length = _events[eventName].length;
                for(var i=0;i<length;i++){
                    if(_events[eventName][i]===listener){
                        return true;
                    }
                }
            }
            return false;
        }
    };

    return _exports;
};



}(this));

