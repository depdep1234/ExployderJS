/** 
 * @fileOverview 汎用的な画像ローダーです。
 * 
 * @version 1.0.0
 */
// "use strict";
(function(window, undefined){


/*
*   Define ImageLoader Class
*/
var ImageLoader = function(img){
    /**
    *   private
    **/
    var _images;    //Model
    
    //public
    var exports = {
        init : function(){
            _images = Ex.Model.getInstance().create({
                "resource" : {},    //Hash
                "count" : 0
            });
        },
        add : function(fileName,id){
            _images.getRecord("resource")[id] = Ex.Model.getInstance().create({
                "data" : new Image(),
                "fileName" : fileName,
                "loaded" : false
            });
            _images.setRecord("count", Number(exports.getCount()) + 1);
        },
        addImages : function(img){
            var length;
            //全ての画像を登録
            if(img instanceof Array){
                length = img.length;
                for(var i=0;i<length;i++){
                    exports.add(img[i][0],img[i][1]);
                }
            }
        },
        start : function(cache){
            var _dfd = $.Deferred();
            var count=0;
            var param = "";
            if(cache===false){
                param = "?" + Ex.Util.getInstance().getRandom()
            }
            
            var images = _images.getRecord("resource");
            for(var key in images){
                (function(id){
                    if(images[id].getRecord("loaded") === true){
                        count++;
                        if(count >= exports.getCount()){
                            _dfd.resolve();
                        }
                    }else{
                        $(images[id].getRecord("data"))
                            .load(function(){
                                images[id].setRecord("loaded", true);
                                count++;
                                if(count >= exports.getCount()){
                                    _dfd.resolve();
                                }
                            })
                            .error(function(){
                                _dfd.reject();
                            });
                        images[id].getRecord("data").src = images[id].getRecord("fileName") + param;
                    }
                })(key)
            };
            return _dfd.promise();
        },
        setCount : function(count){
            _images.setRecord("count", count);
        },
        getCount : function(){
            return _images.getRecord("count");
        },
        find : function(key){
            return _images.getRecord("resource")[key];
        },
        getImages : function(){
            return _images;
        },
        getImg : function(id){
            // return _images.getRecord("resource")[fileName].getRecord("data");
            // console.log(_images.getRecord("resource"));
            return _images.getRecord("resource")[id].getRecord("data");
        }
    };
    
    exports.init(img);
    
    return exports;
};
Ex.createClass("ImageLoader", ImageLoader);





}(this));

