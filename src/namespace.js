/** 
 * @fileOverview It is a module for managing a namespace. 
 * 
 * @version 0.2.0
 */
"use strict";
(function(window, namespace, undefined){

var defaultAliasName = "Ex";
var AppVersion = "0.2.0";




/*
*	Define root Class as Singleton
*/
var root = function(){

//root object instance
var root = null;

//private member
var _namespace = window[namespace];
var _aliasNameSpace = window[defaultAliasName];
var _aliasNames = [defaultAliasName];
var _version = AppVersion;

//Constructor
var _Constructor = function(){

/***********************************************************************************************
*
*	public member
*
************************************************************************************************/
var exports = {



/*
*	Get current Alias Name
*/
getAliasNames : function(){
	for(var i=0;i<_aliasNames.length;i++){
		if(window[_aliasNames[i]]!=root){
			_aliasNames.splice(i,1);
		}
	}
	return _aliasNames;
},


/*
*	Set Alias Name
*/
setAliasName : function(name){
	var f = false;
	if(!window[name]&&window[namespace]===root){
		window[name] = window[namespace];
		f = name;
		_aliasNames.push(name);
	}
	return f;
},


/*
*	Get app version
*/
version : _version,


/*
*	Get current name of reserved object(return Array)
*/
reserved : function(){
	var r = new Array();
	for(var i in exports){
		r.push(String(i));
	}
	return r;
},


/*
*	Add Class to root namespace
*/
createClass : function(className, object, isSingleton){
	//check object already exist
	if(root[className]){return false};
	if(typeof object !== "function"){return false};

	if(isSingleton===true){
		root[className] = function(){
			var _instance = null;
			
			return new function(){
				this.getInstance = function(){
					if(_instance === null){
						_instance = new object(arguments);
						//_instance.constructor = "className";
					}
					return _instance;
				}
			}
		}();
	}else{
		root[className] = object;
	}
	return true;
}





};
/***********************************************************************************************
*
*	End of public member of root Class
*
************************************************************************************************/


return exports;
};
//End of Constructor of root Class


//return function
return new function(){
	this.getInstance = function(){
		if(root === null){
			root = new _Constructor();
		}
		return root;
	}
}

}();
//End of root Class



/*
*	Check namespace
*/
if(!window[namespace]&&!window[defaultAliasName]){
	window[namespace] = root.getInstance();
	window[defaultAliasName] = window[namespace];
}else{
	return false;
}





}(this, "ExployderJS"));
