/**
 * @fileOverview
 *
 * @version 1.0.0
 */
// "use strict";
(function(window, $, undefined){


/*
*   Define VideoController Class
*/
var VideoController = function(args){
    var _videoElement;
    var _fileName;
    var _extension;
    var _defaultVolume;
    var _maxVolume;
    var _loaded;
    var _loop;
    var _id;
    var _canplay;
    var _dfd;
    var _canplayHandler = function(e){
        var video = e.target;
        _loaded = true;
        video.volume = _defaultVolume;
        // video.play();
        _dfd.resolve();
    }
    var _canplaythroughHandler = function(e){
        var video = e.target;
        _loaded = true;
        video.volume = _defaultVolume;
        // video.play();
        _dfd.resolve();
    }
    var _progressHandler = function(e){
        var video = e.target;
    }
    var _errorHandler = function(e){
        var video = e.target;
    }


    var _exports = {
        init : function(props){
            _videoElement = document.createElement("video");
            _fileName = props["src"];
            _maxVolume = props["maxVolume"];
            _defaultVolume = props["defaultVolume"];
            _loop = props["loop"];

            if(_videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"')!==""){
                _extention = ".mp4";
            }else if(_videoElement.canPlayType('video/ogg; codecs="theora"')!==""){
                _extention = ".ogv";
            }else if(_videoElement.canPlayType('video/webm; codecs="vp8, vorbis"')!==""){
                _extention = ".webm";
            };
        },
        getVideoElement : function(){
            return _videoElement;
        },
        load : function(){
            var self = _exports;
            _dfd = $.Deferred();

            _exports.deleteVideo();

            if(_loaded===true){
                _dfd.resolve();
                return _dfd.promise();
            }

            _loaded = false;
            _videoElement.addEventListener("loadeddata", $.proxy(_canplayHandler, self), false);
            _videoElement.addEventListener("canplay", $.proxy(_canplayHandler, self), false);
            _videoElement.addEventListener("canplaythrough", $.proxy(_canplaythroughHandler, self), false);
            _videoElement.addEventListener("error", $.proxy(_errorHandler, self), false);

            if(_loop==="loop"||_loop===true){
                _videoElement.addEventListener("ended", function(e){
                    // _videoElement.currentTime = 0;
                    _exports.play(_defaultVolume);
                }, false);
            }else{
                _videoElement.addEventListener("ended", function(e){
                    // _videoElement.currentTime = 0;
                    _exports.pause();
                }, false);
            };
            _videoElement.src = _fileName + _extention;

            return _dfd.promise();
        },
        addTimeupdateHandler : function(handler){
            _videoElement.addEventListener("timeupdate", handler, false);
        },
        removeTimeupdateHandler : function(handler){
            _videoElement.removeEventListener("timeupdate", handler);
        },
        play : function(props){
            if(!_loaded){
                return;
            }

            if(props.volume){
                _videoElement.volume = props.volume;
            }else{
                _videoElement.volume = _defaultVolume;
            }
            if(props.time||props.time===0){
                _videoElement.pause();
                _videoElement.currentTime = 0;
                _videoElement.currentTime += props.time;
            }
            if(_videoElement.paused === true){
                _videoElement.play();
                // console.log(_fileName + _extention + ":play start");
            };
        },
        seek : function(time){
            _videoElement.currentTime = 0;
            _videoElement.currentTime += time;
        },
        stop : function(){
            _videoElement.pause();
            _videoElement.currentTime = 0;
        },
        pause : function(){
            _videoElement.pause();
        },
        deleteVideo : function(){
            _videoElement.removeEventListener("canplay", _canplayHandler);
            _videoElement.removeEventListener("canplaythrough", _canplaythroughHandler);
            _videoElement.removeEventListener("error", _errorHandler);
            (_loaded===true)?_videoElement.currentTime = 1:0;
            _loaded = false;
            // _videoElement.css({"opacity":0});
            // _videoElement.remove();

            return _exports;
        }
    };

    _exports.init(args);
    return _exports;
};
Ex.createClass("VideoController", VideoController);





}(this, jQuery));