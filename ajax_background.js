var parentWindowId;
var UA = null;

var allReqs = [];

// User-Agent replacement when needed
function bodyHandler (details) {
  
	// skip requests to chrome extensions
	if (details.url.indexOf("chrome-extension:") !== -1) 
		return;
		
		
	allReqs.push(details);

	if (allReqs.length > 3000) {
		allReqs = allReqs.slice(0, 2000);
	}
};

function headHandler (details) {

	allReqs.push(details);
	if (allReqs.length > 3000) {
		allReqs = allReqs.slice(0, 2000);
	}
};

function clear() { 
	allReqs = [];
}


chrome.webRequest.onBeforeRequest.addListener(bodyHandler, {urls: ["<all_urls>"]},  ["requestBody"]);

//chrome.webRequest.onBeforeSendHeaders.addListener(headHandler, {urls: ["<all_urls>"]},  ["requestHeaders"]);



chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.windows.getCurrent(function(window) { parentWindowId = window.id; });

	var furl = chrome.extension.getURL("ajax_ui.html");
  	chrome.tabs.create ({index: 0, active: true, url:furl}, function (Tab) {});

  /*
  var w = window.open (chrome.extension.getURL("ajax_ui.html"),
  		"Robo",
  	 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1200,height=800');
	*/
});