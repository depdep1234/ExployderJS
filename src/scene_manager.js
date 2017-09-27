/** 
 * @fileOverview シーンを管理するためのクラスを定義します。
 * 
 * @version 1.0.0
 */
// "use strict";
(function(window, $, undefined){

/*
*   Define SceneManager Class as Singleton
*/
var SceneManager = function(args){
/****************************************************
*   private
****************************************************/
    var _model;
    var _scene;
    var _hashList = {};
    var _init = function(){
        _model = Ex.Model.getInstance();
        _scene = _model.create({
            "xmlData" : undefined,
            "sceneData" : {},
            "firstScene" : undefined,   //sceneObject
            "current" : undefined,  //sceneObject
            "destination" : undefined,  //sceneObject
            "departure" : undefined,    //sceneObject
            "peak" : undefined, //sceneObject
            "status" : Ex.SceneManager.Status.SCENE_LOAD,
            "defaultTitle" : undefined,
            "title" : undefined,
            "urlSync" : false,
            "logOutput" : false,
            "queue" : new Ex.Queue(),
            "routingMethod" : undefined,
            "rootURL" : undefined,
            "useParam" : undefined,
            "urlParam" : undefined
        });
        //currentが変更されたらcurrentシーンのシーンアクションを実行
        _scene.bind("current_changed", function(e, triggerData){
            var value = triggerData;
            if(exports.getCurrent()===undefined){return};
            exports.getCurrent().setStatus(exports.getStatus());
        });
        //destinationが変更されたらシーン遷移の待ち行列(queue)を変更
        _scene.bind("destination_changed", function(e, triggerData){
            var value = triggerData;
            if(exports.getCurrent()!==undefined){
                _scene.setRecord("departure", exports.getCurrent());
                _scene.setRecord("status", Ex.SceneManager.Status.SCENE_GOTO);
            };
            _setQueue(exports.getDeparture(), exports.getDestination());
        });
        //
        _scene.bind("sceneData_changed", function(e, triggerData){
            var value = triggerData;
            
        });
        //
        _scene.bind("title_changed", function(e, triggerData){
            var value = triggerData;
            document.title = _scene.getRecord("title") + _scene.getRecord("defaultTitle");
        });
        //
        _scene.bind("status_changed", function(e, triggerData){
            var value = triggerData;
            $(exports).trigger(Ex.SceneManager.Event.STATUS_CHANGED, exports.getStatus());
        });
        //queueが変更されたらシーン遷移を実行（キューの消費では実行されない）
        _scene.bind("queue_changed", function(e, triggerData){
            var value = triggerData;
            if(_scene.getRecord("queue")===undefined){return};
            _setCurrent(_scene.getRecord("queue").dequeue());
        });
    };
    //一つのシーン遷移動作が完了した際に呼び出されるハンドラ
    var _sceneActionHandler = function(e, triggerData){
        var prev = triggerData; //sceneObject
        var current = _scene.getRecord("queue").getAry()[0];//sceneObject
        var next = _scene.getRecord("queue").getAry()[1];//sceneObject
        
        switch(exports.getStatus()){
            case Ex.SceneManager.Status.SCENE_GOTO:
                if(prev.hasChild(current)){
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_LOAD);
                    _setCurrent(_scene.getRecord("queue").dequeue());
                }else{
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_UNLOAD);
                    _setCurrent(prev);
                };
                //_scene.setRecord("title", next.getTitle());
                break;
            case Ex.SceneManager.Status.SCENE_LOAD:
                if(prev === exports.getDestination()){
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_INIT);
                    _setCurrent(prev);
                }else{
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_LOAD);
                    _setCurrent(_scene.getRecord("queue").dequeue());
                };
                break;
            case Ex.SceneManager.Status.SCENE_UNLOAD:
                if(prev === exports.getDestination()){
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_LOAD);
                    _setCurrent(prev);
                }else if(current.hasParent(next)){
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_UNLOAD);
                    _setCurrent(_scene.getRecord("queue").dequeue());
                }else if(current.hasChild(next)){
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_LOAD);
                    _scene.getRecord("queue").dequeue();
                    _setCurrent(_scene.getRecord("queue").dequeue());
                }else if(current === exports.getDestination()){
                    _scene.setRecord("status", Ex.SceneManager.Status.SCENE_UNLOAD);
                    _setCurrent(_scene.getRecord("queue").dequeue());
                };
                break;
            case Ex.SceneManager.Status.SCENE_INIT:
                _scene.setRecord("status", Ex.SceneManager.Status.SCENE_INIT_COMPLETE);
                _scene.setRecord("title", prev.getTitle());
                break;
            case Ex.SceneManager.Status.SCENE_OFF:
                
                break;
        };
        return;
    };
    //2つのシーン間に共通する親のシーンパスを取得する
    var _getParentScenePath = function(path1, path2){
        var path = "";
        var depth1 = path1.split("/");
        var depth2 = path2.split("/");
        
        //同一シーンの場合
        if(path1 === path2){return undefined;};
        
        var length = Math.min(depth1.length, depth2.length);
        var i;
        for(i=0;i<length;i++){
            if(depth1[i]!=depth2[i]){
                break;
            };
            (i!==0)?path += "/":0;
            path += depth1[i];
        };
        
        return path;
    };
    //シーン遷移時のシーン毎の処理をキューに保存
    var _setQueue = function(departure, destination){
        var queue = _scene.getRecord("queue");
        _destroyQueue();
        
        if(departure===undefined){
            departure = _scene.getRecord("firstScene");
        };
        
        var departPath = departure.getSceneID().getPath();
        var destinPath = destination.getSceneID().getPath();
        //シーン遷移経路の頂点
        var peakPath = _getParentScenePath(departPath, destinPath);
        
        //シーン遷移がある場合はキューを更新
        if(peakPath !== undefined){
            var departDepth = departPath.split("/");
            var departLength = departDepth.length;
            var peakDepth = peakPath.split("/");
            var peakLength = peakDepth.length;
            var destinDepth = destinPath.split("/");
            var destinLength = destinDepth.length;
            var i;
            var tempPath;
            
            if(departLength > peakLength){
                tempPath = departPath;
                for(i=departLength-1; i>=peakLength; i--){
                    queue.enqueue(exports.find(tempPath));
                    tempPath = tempPath.split(departDepth[i])[0];
                    tempPath = tempPath.replace(/\/$/,"");
                }
            };
            tempPath = peakPath;
            queue.enqueue(exports.find(tempPath));
            for(i=peakLength; i<destinLength; i++){
                tempPath += "/" + destinDepth[i];
                tempPath = tempPath.replace(/\/$/,"");
                queue.enqueue(exports.find(tempPath));
            };
            
            _scene.setRecord("queue", undefined);
            _scene.setRecord("queue", queue);
            _scene.setRecord("peak", exports.find(peakPath));
        }
        //最初のシーン表示の場合
        else if(peakPath === undefined && exports.getDestination()===_scene.getRecord("firstScene")){
            queue.enqueue(exports.find(departPath));
            _scene.setRecord("queue", undefined);
            _scene.setRecord("queue", queue);
        }
    };
    //シーン遷移キューを削除
    var _destroyQueue = function(){
        _scene.getRecord("queue").destroy();
    };
    //シーン移動を実行
    var _setCurrent = function(sceneObject){
        _scene.setRecord("current", undefined);
        _scene.setRecord("current", sceneObject);
    };
    var _initializeScene = function(sceneData){
        var sceneObject,constructor,includes,child,key;
        constructor = sceneData["constructor"];
        includes = sceneData["includes"];
        child = sceneData["child"];
        if(sceneData["sceneObject"]===null){
            if(constructor.getInstance===undefined){
                sceneData["sceneObject"] = new constructor([includes]);
            }else{
                sceneData["sceneObject"] = constructor.getInstance(includes);
            }
            sceneData["sceneObject"].bind("complete", _sceneActionHandler);
            //親シーンに子シーンとして追加
            if(sceneData["sceneObject"].getParent()!=undefined){
                sceneData["sceneObject"].getParent().addScene(sceneData["sceneObject"]);
            }
            _hashList[sceneData["sceneObject"].getName()] = sceneData["sceneObject"];
        };
        if(!Ex.Util.getInstance().isHashEmpty(child)){
            for(key in child){
                _initializeScene(child[key]);
            }
        }
    };
    var _goto = function(destination){
        if(exports.locked===true){return};
        if(_scene.getRecord("firstScene")===undefined){return};
        if(exports.getDeparture()!==undefined && exports.getStatus() !== Ex.SceneManager.Status.SCENE_INIT_COMPLETE){return};
        
        var destin;
        if(typeof destination ==="string"){
            destin = exports.find(String(destination));
        }else{
            destin = destination;
        };
        if(exports.getDeparture()!==undefined && destin===_scene.getRecord("firstScene")){return};
        if(destin!==undefined){
            _scene.setRecord("destination", destin);
        }
    };
    var _gotoURL = function(destination){
        if(exports.locked===true){return};
        if(_scene.getRecord("firstScene")===undefined){return};
        if(exports.getDeparture()!==undefined && exports.getStatus() !== Ex.SceneManager.Status.SCENE_INIT_COMPLETE){return};
        
        var destin;
        if(typeof destination ==="string"){
            destin = exports.find(String(destination));
        }else{
            destin = destination;
        };
        if(exports.getDeparture()!==undefined && destin===_scene.getRecord("firstScene")){return};
        if(destin === exports.getCurrent()){return;};
        var url;
        var param;
        var state;
        var ext;
        if(destin===undefined){return;};
        ext = destin.getNameExt();
        if(destin === exports.getFirstScene()){
            state = null;
            url = null;
        }else{
            state = destin.getName();
            if(exports.getURLSync()!==false&&destin.getUrlSync()!==false){
                if(exports.getUseParam()===true){
                    param = "?p=";
                    url = exports.getRootURL() + param + (destin.getPath().replace(/intro\/(index|global|page_thumbnail)/,'')).replace(/^\//,'');
                    if(state !== "index"&&ext===undefined){
                        url = url + "/";
                    }else if(state === "index"&&ext!==undefined){
                        url = url + "index" + ext;
                    }else if(ext!==undefined){
                        url = url + ext;
                    }
                }else{
                    var urlParam = exports.getURLParam();
                    if(urlParam===undefined){
                        urlParam = "";
                    }
                    param = urlParam;
                    url = exports.getRootURL() + (destin.getPath().replace(/intro\/(index|global|page_thumbnail)/,'')).replace(/^\//,'');
                    if(state !== "index"&&ext===undefined){
                        url = url + "/";
                    }else if(state === "index"&&ext!==undefined){
                        url = url + "index" + ext;
                    }else if(ext!==undefined){
                        url = url + ext;
                    }
                    url = url + param;
                }
            }else{
                url = null;
            }
        }
        history.pushState(state, destin.getTitle(), url);
        // history.pushState(state, destin.getTitle(), null);
        _popStateHandler(destin.getName());
        
    };
    var _popStateHandler = function(url){
        _goto(_hashList[url]);
    };
    var _gotoHash = function(destination){
        if(exports.locked===true){return};
        if(_scene.getRecord("firstScene")===undefined){return};
        if(exports.getDeparture()!==undefined && exports.getStatus() !== Ex.SceneManager.Status.SCENE_INIT_COMPLETE){return};
        
        var destin;
        if(typeof destination ==="string"){
            destin = exports.find(String(destination));
        }else{
            destin = destination;
        };
        if(exports.getDeparture()!==undefined && destin===_scene.getRecord("firstScene")){return};
        if(destin!==undefined){
            location.hash = destin.getName();
        }
    };
    var _hashChange = function(hash){
        _goto(_hashList[hash]);
    };
    
/****************************************************
*   public
****************************************************/
    var exports = {
        setup : function(path){
            //全シーンを初期化
            var sceneData = exports.getSceneData();
            var key;
            for(key in sceneData){
                _initializeScene(sceneData[key]);
            };
            //最初のシーンを登録
            _scene.setRecord("firstScene", exports.find(String(path)));
        },
        getSceneData : function(){
            return _scene.getRecord("sceneData");
        },
        getCurrent : function(){
            return _scene.getRecord("current");
        },
        getStatus : function(){
            return _scene.getRecord("status");
        },
        create : function(includes, className, isSingleton){
            if(includes===undefined){return};
            if(className===undefined){return};
            
            //SceneObjectを生成
            var Constructor = SceneObject(includes);
            
            var b;
            if(isSingleton==true){
                b = true;
            }else{
                b = false;
            };
            Ex.createClass(className, Constructor, b);
        },
        /**
        *   XMLからシーンを一括生成
        */
        registerScenesFromXML : function(xml){
            _scene.setRecord("xmlData", xml);
            var scenes = $(xml).find("scene");
            scenes.each(function(){
                var scene = $(this);
                var name = scene.attr("name");
                var nameExt = scene.attr("name-ext");
                var title = scene.attr("title");
                var className = scene.attr("data-ex-scene");
                var description = function(){
                    var desc = scene.find("> description");
                    if(desc.size()!==0){
                        return desc.text();
                    }else{
                        return undefined;
                    }
                }();
                var skipPath = scene.attr("skip");
                var isNoTrack = scene.attr("data-ex-notrack");
                var urlSync = (scene.attr("url-sync")&&scene.attr("url-sync")==="false")?false:true;
                var className = scene.attr("data-ex-scene");
                var xmlElements = $.parseXML("<data></data>");
                var elements = scene.children(":not(scene)").clone();
                if(elements.length!==0){
                    $(xmlElements).find("data").append(elements);
                };
                var constructor = function(){
                    var length = className.split(".").length;
                    var i;
                    var object = window;
                    for(i=0;i<length;i++){
                        object = object[className.split(".")[i]];
                    };
                    return object;
                }();
                var children = scene.find("> scene");
                
                var path = name;
                scene.parents("scene").each(function(){
                    path = $(this).attr("name") + "/" + path;
                });
                
                var record = exports.getSceneData();
                var depth = path.split("/");
                var length = depth.length;
                var i=0;
                var itemRecord = record[depth[i]];
                if(record[depth[i]]===undefined){
                    record[depth[i]] = {
                        sceneObject : null,
                        constructor : undefined,
                        includes : undefined,
                        child : {}
                    };
                    itemRecord = record[depth[i]];
                };
                
                for(i=1;i<length;i++){
                    if(itemRecord["child"][depth[i]]===undefined){
                        itemRecord["child"][depth[i]] = {
                            sceneObject : null,
                            constructor : undefined,
                            includes : undefined,
                            child : {}
                        }
                    };
                    itemRecord = itemRecord["child"][depth[i]];
                };
                itemRecord.constructor = constructor;
                itemRecord.includes = {
                    title : title,
                    path : path,
                    nameExt : nameExt,
                    description : description,
                    className : className,
                    skipPath : skipPath,
                    isNoTrack : isNoTrack,
                    urlSync : urlSync,
                    xmlData : $(xmlElements).find("data")
                };
                _scene.setRecord("sceneData", record);
            });
        },
        removeScene : function(){
            
        },
        getXmlData : function(){
            return _scene.getRecord("xmlData");
        },
        setRootURL : function(url){
            _scene.setRecord("rootURL", url);
        },
        getRootURL : function(){
            return _scene.getRecord("rootURL");
        },
        setDefaultTitle : function(title){
            _scene.setRecord("defaultTitle", title);
        },
        getDefaultTitle : function(){
            return _scene.getRecord("defaultTitle");
        },
        canPushState : function(){
            if (window.history && window.history.pushState){
                return true;
            }else{
                return false;
            }
        },
        getRoutingMethod : function(){
            return _scene.getRecord("routingMethod");
        },
        setRoutingMethod : function(method){
            if(_scene.getRecord("routingMethod")!==undefined){return;};
            if(method ==="hashchange"){
                if($(window).hashchange){
                    _scene.setRecord("routingMethod", "hashchange");
                    $(window).hashchange(function(){
                        _hashChange(location.hash.replace(/#/,''));
                    });
                }else{
                    _scene.setRecord("routingMethod", "none");
                }
            }else if(method === "pushState"){
                if (exports.canPushState()===true){
                    _scene.setRecord("routingMethod", "pushState");
                    window.addEventListener('popstate', function(e){
                        if(e.state === null){return;};
                        _popStateHandler(e.state);
                    }, false);
                }else if($(window).hashchange){
                    _scene.setRecord("routingMethod", "hashchange");
                    $(window).hashchange(function(){
                        _hashChange(location.hash.replace(/#/,''));
                    });
                }else{
                    _scene.setRecord("routingMethod", "none");
                }
            }else{
                _scene.setRecord("routingMethod", "none");
            }
        },
        setRouting : function(props){
            (props.rootURL)?exports.setRootURL(props.rootURL):0;
            (props.method)?exports.setRoutingMethod(props.method):0;
            (props.urlSync)?exports.setURLSync(props.urlSync):0;
            (props.useParam)?exports.setUseParam(props.useParam):0;
        },
        setURLSync : function(b){
            _scene.setRecord("urlSync", b);
        },
        getURLSync : function(){
            return _scene.getRecord("urlSync");
        },
        setUseParam : function(b){
            _scene.setRecord("useParam", b);
        },
        getUseParam : function(){
            return _scene.getRecord("useParam");
        },
        setURLParam : function(b){
            _scene.setRecord("urlParam", b);
        },
        getURLParam : function(){
            return _scene.getRecord("urlParam");
        },
        setLogOutput : function(b){
            _scene.setRecord("logOutput", b);
        },
        getLogOutput : function(){
            return _scene.getRecord("logOutput");
        },
        getHashList : function(){
            return _hashList;
        },
        /**
        *   URL同期機能が有効化されている場合はハッシュをチェンジする
        *   無効の場合はURL遷移無しでシーンを遷移させる
        */
        goto : function(destination){
            var method = exports.getRoutingMethod();
            switch(method){
                case "hashchange":
                    _gotoHash(destination);
                    break;
                case "pushState":
                    _gotoURL(destination);
                    break;
                case "none":
                    _goto(destination);
                    break;
                default:
                    _goto(destination);
                    break;
            }
        },
        gotoFirstScene : function(){
            var indexScenePath = exports.getFirstScene().getPath()+"/index";
            var defaultScenePath = location.href.replace(exports.getRootURL(), "");
            
            if(exports.getRoutingMethod()==="hashchange"){
                defaultScenePath = defaultScenePath.replace(/(.*)#(.*)$/,"$2");
            }else if(exports.getRoutingMethod()==="pushState"){
                defaultScenePath = defaultScenePath.replace(/(.*)#(.*)$/,"$1");
                defaultScenePath = defaultScenePath.replace(/(.*)\.(.*)$/,"$1");
                defaultScenePath = defaultScenePath.replace(/\/index$/,"");
                if(exports.getUseParam()===true){
                    defaultScenePath = defaultScenePath.replace(/\?p=(.*)$/,"$1");
                }
            }else{
                exports.nextScenePath = _scene.getRecord("firstScene").getChildren()[0].getPath();
                exports.goto(_scene.getRecord("firstScene"));
                return;
            }

            if(defaultScenePath === "" || defaultScenePath === "index"){
                defaultScenePath = indexScenePath;
            }else{
                defaultScenePath = indexScenePath + "/" + defaultScenePath;
            }

            if(exports.getUseParam()!==true){
                exports.nextScenePath = defaultScenePath.replace(/\?(.*)$/,'').replace(/\/$/,'');
            }else{
                exports.nextScenePath = defaultScenePath.replace(/\/$/,'');
            }
            
            exports.goto(_scene.getRecord("firstScene"));
        },
        stop : function(){
            
        },
        rejume : function(){
            
        },
        /**
        *   @return sceneObject
        */
        getFirstScene : function(){
            return _scene.getRecord("firstScene");
        },
        /**
        *   @return sceneObject
        */
        getDestination : function(){
            return _scene.getRecord("destination");
        },
        /**
        *   @return sceneObject
        */
        getDeparture : function(){
            return _scene.getRecord("departure");
        },
        bind : function(eventName, listener){
            $(exports).bind(eventName, listener);
        },
        unbind : function(eventName, listener){
            $(exports).unbind(eventName, listener);
        },
        //search scene by content path
        find : function(path){
            if(path===undefined){return undefined};
            
            var record = exports.getSceneData();
            var depth = path.split("/");
            var length = depth.length;
            var itemRecord = record[depth[0]];
            var scene = undefined;
            var f=true;
            
            for(var i=1;i<length;i++){
                if(itemRecord!==undefined&&itemRecord["child"]!==undefined){
                    itemRecord = itemRecord["child"][depth[i]];
                }else{
                    f=false;
                }
            };
            (f&&itemRecord!==undefined)?scene=itemRecord.sceneObject:0;
            return scene;
        }
    };
    
    _init();
    
    return exports;
};
Ex.createClass("SceneManager", SceneManager, true);
Ex.SceneManager.Event = {
    CURRENT_SCENE_CHANGED : "current_scene_changed",
    STATUS_CHANGED : "status_changed"
};
Ex.SceneManager.Status = {
    SCENE_LOAD : "scene_load",
    SCENE_INIT : "scene_init",
    SCENE_INIT_COMPLETE : "scene_init_complete",
    SCENE_GOTO : "scene_goto",
    SCENE_UNLOAD : "scene_unload",
    SCENE_OFF : "scene_off"
};









/*
*   Define SceneObject Class
*/
var SceneObject = function(includes){
    
    return function(includes2){
        /****************************************************
        *   private
        ****************************************************/
        var _sceneID;   //SceneID
        var _name;
        var _skipPath;
        var _parent;  //SceneObject
        var _children = []; //Array of SceneObject
        var _xmlData;
        var _dataHolder;    //model
        var _sceneAction = function(func){
            if(exports.getManager().getLogOutput()===true){
                console.log(exports.getName() + " " + exports.getStatus());
            }
            if(func && typeof func === "function"){
                func.apply(exports);
            }else{
                exports.done();
            }
        };
        
        /****************************************************
        *   public
        ****************************************************/
        var exports = {
            init : function(includes2){
                if(!includes2&&!includes2["path"]){return};
                _sceneID = new SceneID(includes2["path"]);
                _name = _sceneID.getName();
                _skipPath = includes2["skipPath"];
                //set parent scene
                _parent = exports.getManager().find(_sceneID.getParentPath());
                
                _dataHolder = Ex.Model.getInstance().create({
                    "title" : (includes2["title"])?includes2["title"]:undefined,
                    "status" : undefined,
                    "class_name" : (includes2["className"])?includes2["className"]:undefined,
                    "is_no_track" : (includes2["isNoTrack"])?true:false,
                    "url_sync" : (includes2["urlSync"])?true:false,
                    "nameExt" : (includes2["nameExt"])?includes2["nameExt"]:undefined,
                    "description" : (includes2["description"])?includes2["description"]:undefined
                });
                
                if(!includes){return};
                _dataHolder.bind("status_changed", function(e, triggerData){
                    var value = triggerData;
                    switch(exports.getStatus()){
                        case Ex.SceneManager.Status.SCENE_LOAD:
                            exports.sceneLoad(includes["sceneLoad"]);
                            break;
                        case Ex.SceneManager.Status.SCENE_INIT:
                            exports.sceneInit(includes["sceneInit"]);
                            break;
                        case Ex.SceneManager.Status.SCENE_INIT_COMPLETE:
                            
                            break;
                        case Ex.SceneManager.Status.SCENE_GOTO:
                            exports.sceneGoto(includes["sceneGoto"]);
                            break;
                        case Ex.SceneManager.Status.SCENE_UNLOAD:
                            exports.sceneUnload(includes["sceneUnload"]);
                            break;
                        default :
                            break;
                    };
                });
                (includes2&&includes2["xmlData"])?_xmlData = includes2["xmlData"]:0;
                (includes&&includes["init"])?includes["init"].apply(exports):0;
            },
            getSceneID : function(){
                return $.extend(true,{},_sceneID);
            },
            getPath : function(){
                return exports.getSceneID().getPath();
            },
            getName : function(){
                return String(_name);
            },
            getNameExt : function(){
                return _dataHolder.getRecord("nameExt");
            },
            getTitle : function(){
                return _dataHolder.getRecord("title");
            },
            getDescription : function(){
                return _dataHolder.getRecord("description");
            },
            getSkipPath : function(){
                return _skipPath;
            },
            getClassName : function(){
                return _dataHolder.getRecord("class_name");
            },
            getUrlSync : function(){
                return _dataHolder.getRecord("url_sync");
            },
            getXmlData : function(){
                return _xmlData;
            },
            getParent : function(){
                (_parent===undefined)?_parent = exports.getManager().find(_sceneID.getParentPath()):0;
                return _parent;
            },
            hasParent : function(sceneObject){
                var b = false;
                (sceneObject===_parent)?b = true:0;
                return b;
            },
            isParentOf : function(sceneObject){
                var b = false;
                (sceneObject.hasParent(exports))?b = true:0;
                return b;
            },
            getChildren : function(){
                return _children;
            },
            getPrev : function(){
                var prev = undefined;
                var parent = exports.getParent();
                var children = parent.getChildren();
                var length = children.length;
                var i;
                
                for(i=0;i<length;i++){
                    if(children[i]===exports){
                        if(i!==0){prev = children[i-1]};
                    }
                };
                return prev;
            },
            getNext : function(){
                var next = undefined;
                var parent = exports.getParent();
                var children = parent.getChildren();
                var length = children.length;
                var i;
                
                for(i=0;i<length;i++){
                    if(children[i]===exports){
                        if(i!==length-1){next = children[i+1]};
                    }
                };
                return next;
            },
            hasChild : function(sceneObject){
                var b = false;
                var i;
                var length = _children.length;
                for(i=0;i<length;i++){
                    (sceneObject===_children[i])?b=true:0;
                };
                return b;
            },
            isChildOf : function(sceneObject){
                var b = false;
                var i;
                var length = _children.length;
                for(i=0;i<length;i++){
                    (sceneObject.hasChild(exports))?b=true:0;
                };
                return b;
            },
            addScene : function(sceneObject){
                _children.push(sceneObject);
            },
            getManager : function(){
                return Ex.SceneManager.getInstance();
            },
            setStatus : function(status){
                if(status===Ex.SceneManager.Status.SCENE_OFF||status===Ex.SceneManager.Status.SCENE_LOAD||status===Ex.SceneManager.Status.SCENE_INIT||status===Ex.SceneManager.Status.SCENE_GOTO||status===Ex.SceneManager.Status.SCENE_UNLOAD||status===Ex.SceneManager.Status.SCENE_INIT_COMPLETE){
                    _dataHolder.setRecord("status", status);
                }
            },
            getStatus : function(){
                return _dataHolder.getRecord("status");
            },
            bind : function(eventName, eventHandler){
                $(exports).bind(eventName, eventHandler);
            },
            unbind : function(eventName, eventHandler){
                $(exports).unbind(eventName, eventHandler);
            },
            trigger : function(eventName, triggerData){
                $(exports).trigger(eventName, triggerData);
            },
            sceneOff : function(func){_sceneAction(func)},
            sceneLoad : function(func){_sceneAction(func)},
            sceneInit : function(func){_sceneAction(func)},
            sceneGoto : function(func){_sceneAction(func)},
            sceneUnload : function(func){_sceneAction(func)},
            done : function(){
                exports.trigger("complete", exports);
            },
            isNoTrack : function(){
                return _dataHolder.getRecord("is_no_track");
            }
        };
        
        exports.init.apply(exports, includes2);
        
        return exports;
        
    }
};




/*
*   Define SceneID Class
*/
var SceneID = function(path){
/****************************************************
*   private
****************************************************/
    var _name;
    var _path;
    var _parentPath="";
    var _depth;
    var _length;
    var i=0;
    
    var _init = function(){
        _path = path;
        _depth = _path.split("/");
        _length = _depth.length;
        _name = _depth[_length-1];
        if(_length>1){
            for(i=0;i<_length-1;i++){
                _parentPath += _depth[i];
                (i!=_length-2)?_parentPath+="/":0;
            }
        }
    };
    
/****************************************************
*   public
****************************************************/
    var exports = {
        getName : function(){
            return String(_name);
        },
        getParentPath : function(){
            return String(_parentPath);
        },
        getPath : function(){
            return String(_path);
        }
    };
    
    _init();
    
    SceneID.prototype = exports;
    return exports;
};





}(this, jQuery));

