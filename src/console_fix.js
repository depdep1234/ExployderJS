/** 
 * @fileOverview window.consoleのエラーを回避します
 * 
 * @version 1.0.0
 */
// "use strict";
if(!window.console){window.console={};window.console.log=function(){}};
