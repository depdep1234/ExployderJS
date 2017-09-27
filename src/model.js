/** 
 * @fileOverview データ管理のためのクラスを定義します。
 * 
 * @version 1.0.0
 */
// "use strict";
(function(window, $, undefined){

/*
*   Define Model Class as Singleton
*/
var Model = function(){
/****************************************************
*   private
****************************************************/
    var _records = {};
    
/****************************************************
*   exports
****************************************************/
    var exports = {
        init : function(){
            
        },
        create : function(data, accessID){
            var id;
            (accessID)?id=accessID:0;
            var m = new ModelTemplate(data, id);
            _records[m.id]=m;
            return m;
        },
        find : function(id){
            return _records[id] || 0;
        },
        destroy : function(id){
            _records[id] = null;
            delete _records[id];
        }
    };
    
    exports.init();
    
    return exports;
};
Ex.createClass("Model", Model, true);


/*
*   Define ModelTemplate Class
*/
var ModelTemplate = function(data, accessID){
    
/****************************************************
*   private
****************************************************/
    var _initialized = false;
    var _id;
    var _accessID = undefined;
    var _records = {};
    //ローカルPCにデータを書き込み
    var _saveDataToLocal = function(key, value, expires){
        if($.cookie=== undefined) return;
        exports.deleteLocalData(key);
        $.cookie(key, _records[key], { path: "/", expires: 10000 });
        // document.cookie = key + '=' + escape(value) + '; path='+ '/' +'; expires=' + expires + '; ';
        /*exports.deleteLocalData(key);
        localStorage[key] = value;*/
    };
    
/****************************************************
*   public
****************************************************/
    var exports = {
        init : function(data, accessID){
            if(_initialized==true)return;
            
            _id = Ex.Util.getInstance().createGUID();
            _records = data;
            if(accessID){
                _accessID = String(accessID);
            };

            //pubsub
            Ex.PubSub.getInstance().mixin(exports);
            
            _initialized = true;
        },
        getID : function(){
            return String(_id);
        },
        setRecord : function(key, value, save){
            if(!_id)return;
            if(_records[key] == value) return;
            
            //データを記録
            _records[key] = value;
            if(save === true){
                _saveDataToLocal(key, _records[key], "Tue, 31-Dec-2030 23:59:59; ");
            }
            //dispatch
            // $(exports).trigger(key + "_changed", exports.getRecord(key, String(_accessID)));
            exports.pubsub.trigger(key + "_changed", exports.getRecord(key, String(_accessID)));
        },
        getRecord : function(key, accessID){
            if(!_id)return;
            if(_accessID!=undefined){
                if(_accessID !== accessID){
                    return undefined;
                }
            };
            //return $.extend(true,{},_records[key]);
            return _records[key];
        },
        deleteLocalData : function(key){
            if($.cookie=== undefined) return;
            $.cookie(key, "", { path: "/", expires: -1 });
            // document.cookie = key + '=; path='+ '/' +'; expires=Tue, 1-Jan-1980 00:00:00; ';
            /*localStorage.removeItem(key);*/
        },
        checkLocalData : function(key){
            if($.cookie=== undefined) return;
            var cookie = $.cookie(key);
            if(cookie){
                return cookie;
            }else{
                return false;
            }
            // var st="";
            // var ed="";
            // if(document.cookie.length>0){
            //     // クッキーの値を取り出す
            //     st=document.cookie.indexOf(key + "=");
            //     if(st!=-1){
            //         st=st+key.length+1;
            //         ed=document.cookie.indexOf(";",st);
            //         if(ed==-1) ed=document.cookie.length;
            //         return unescape(document.cookie.substring(st,ed));
            //     }
            // }
            // return false;
            /*var value = localStorage[key];
            if(value){
                return value;
            }else{
                return false;
            }*/
        },
        bind : function(eventName, listener){
            // $(exports).bind(eventName, listener);
            exports.pubsub.bind(eventName, listener);
        },
        unbind : function(eventName, listener){
            // $(exports).unbind(eventName, listener);
            exports.pubsub.unbind(eventName, listener);
        },
        sync : function(key, prop){
            if(!_id)return;
            if(!prop["url"])return;
            
            var type = (prop["type"])?prop["type"]:0;
            var cache = (prop["cache"])?prop["cache"]:0;
            var data = (prop["data"])?prop["data"]:0;
            
            $.ajax({
                type: type,
                cache : cache,
                url: prop["url"],
                data: data,
                success : function(response){
                    var value = (prop["responseEdit"])?prop["responseEdit"](response):response;
                    exports.setRecord(key, value);
                },
                error : function(XMLHttpRequest, textStatus, errorThrown){
                    (prop["errorCallback"])?prop["errorCallback"](XMLHttpRequest, textStatus, errorThrown):0;
                }
            });
        },
        destroy : function(){
            if(!_id)return;
            
        }
    };
    
    exports.init(data, accessID);
    
    return exports;
}
//ModelTemplate.prototype = new ModelTemplate();


}(this, jQuery));

