/** 
 * @fileOverview DOM要素を対象にした、汎用的なシーン遷移用ボタンのコントローラーです。クリックでscenePathで指定されたシーンへ移動を開始します。必要に応じて別途CSSを指定して画像化してください。
 * 
 * @version 1.0.0
 */
(function(window, $, undefined){

/*
*	Define SceneButton Class
*/
Ex.Controller.getInstance().create({
	scenePath : undefined,
	canceled : false,
	alternateURL : undefined,
	init : function(args){
		var self = this;
		self.setElement(args);
		self.element = self.getElement();
		
		self.scenePath = self.element.attr("data-ex-scene-path");
		if(self.scenePath===""||self.scenePath===undefined){
			self.element.css({
				"display" : "none"
			})
		}
		
		var cancelDevice = self.element.attr("data-ex-cancel-device"); 
		var device = Ex.DeviceManager.getInstance().device;
		if(cancelDevice != undefined && cancelDevice !== null && cancelDevice.match(device)){
			self.canceled = true;
		}
		
		if(Ex.DeviceManager.getInstance().device !== "pc"){
			self.getElement().swipe({
				excludedElements:"",
				tap : function(e, target){
					// var self = this;
					// e.stopPropagation();
					// alert(self.element.attr("data-ex-scene-path") + ":" + self.element.attr("href"));
					if(self.canceled){
						self.alternateURL = Ex.SceneManager.getInstance().find(self.scenePath).alternateURL;
						self.element.attr("href", self.alternateURL);
					}else{
						self.scenePath = self.getElement().attr("data-ex-scene-path");
						Ex.SceneManager.getInstance().goto(self.scenePath);
						
					}
				}
			});
		}
	},
	setScenePath : function(path){
		var self = this;
		
		self.element.attr("data-ex-scene-path", path);
		self.scenePath = self.element.attr("data-ex-scene-path");
		if(path!==undefined&&path!==""){
			self.element.css({
				"display" : "block"
			})
		}else{
			self.element.css({
				"display" : "none"
			})
		}
	},
	events : {
		"click" : function(e){
			if(Ex.DeviceManager.getInstance().device !== "pc"){
				return false;
			}
			e.stopPropagation();
			// console.log(e);
			var self = this;
			if(self.canceled){
				self.alternateURL = Ex.SceneManager.getInstance().find(self.scenePath).alternateURL;
				self.element.attr("href", self.alternateURL);
			}else{
				self.scenePath = self.getElement().attr("data-ex-scene-path");
				Ex.SceneManager.getInstance().goto(self.scenePath);
				
			}
			return false;
		}
	}/*,
	touchSwipe : {
		excludedElements:"",
		tap : function(e, target){
			var self = this;
			e.preventDefault();
			alert(self.element.attr("data-ex-scene-path") + ":" + self.element.attr("href"));
			if(self.canceled){
				self.alternateURL = Ex.SceneManager.getInstance().find(self.scenePath).alternateURL;
				self.element.attr("href", self.alternateURL);
			}else{
				self.scenePath = self.getElement().attr("data-ex-scene-path");
				Ex.SceneManager.getInstance().goto(self.scenePath);
				
			}

			return false;
		}
	}*/
},"dom", "SceneButton");


}(this, jQuery));

