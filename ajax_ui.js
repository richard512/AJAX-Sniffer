var fltReqs = [];

var typeFlt = {
 "main_frame" : 1, 
 "sub_frame": 1, 
 "xmlhttprequest": 1, 
 "stylesheet": 0, 
 "script": 0, 
 "image": 0, 
 "object": 1, 
 "other": 1
}
 
 var methFlt = {
"GET": 1,
"POST": 1,
"HEAD": 0,
"PUT": 0,
"DELETE": 0,
"TRACE": 0,
"OPTIONS": 0,
"CONNECT": 0,
"PATCH": 0
}

// globals
var req;

 
function filterReqs(reqs) {
	var fltReqs = [];
	// end of que is latest requests, put them on top
	// filter requests
	
	var txtFlt = $("#txtFlt").val().trim();
	
	for (var i=reqs.length-1; i>=0; i--) {
		
		if ((txtFlt !== "") && (reqs[i].url.indexOf(txtFlt) == -1)) 
			continue;
		
		if (methFlt[reqs[i].method] == 0) 
			continue;

		if (typeFlt[reqs[i].type] == 0) 
			continue;
	
		fltReqs.push (reqs[i]);
		if (fltReqs.length>=100) 
			break;
	}
	return fltReqs;
}
 
function showReqs() {

	var reqs = chrome.extension.getBackgroundPage().allReqs;
	
	fltReqs = filterReqs(reqs);
	
	
	$("#requests").html("");
	
	for (var i=0; i<fltReqs.length; i++) {

		var row = '<tr id="req' + i + '">' + 
			"<td>" + fltReqs[i].type.substring(0,3) + "</td>" + 
			"<td>" + fltReqs[i].method + "</td>" + 
			"<td><span title='" + fltReqs[i].url + "'>" + fltReqs[i].url + "</span></td>" + 
			"</tr>";
		$("#requests").append(row)
	}
	//$("#reqs").text(""+fltReqs.length);
	
	// handle row clicks
	$('#requests tr').click(function() {
		var reqId = $(this).attr('id').replace("req","");
		showOneReq(reqId);
	});
	
	
}


function showOneReq(reqId) {

	req = fltReqs[reqId];


	var jcode = "";
	if (req.method === "GET") {
		var uri = URI(req.url);
		if (uri.search() !== "") 
		{
			jcode = "var queryData = " +  JSON.stringify(uri.search(true), null, 2) + ";\n";
			jcode += "$.get('" + uri.search("") + "', queryData)";
		} 
		else { 
			jcode = "$.get('" + req.url + "')";
		}
		jcode += "\n  .done (showResult)\n  .fail(showError);"
	}	
	else if (req.method === "POST") {
		if ((req.requestBody !== undefined) && 
			(req.requestBody.formData !== undefined))
		{
			// change arrays [] and [x] to "" and x
			var frm = JSON.parse(JSON.stringify(req.requestBody.formData));
			for (i in frm) {
				if (frm[i] instanceof Array) {
					if (frm[i].length == 0) frm[i] = null;
					if (frm[i].length == 1) frm[i] = frm[i][0];
				}
			}
			
			jcode = "var formData = " + JSON.stringify(frm, null, 2) + ";\n";
		} 
		else 
		{ 
			jcode = "var formData = {};\n";
		}
		jcode += "$.post('" + req.url + "', formData)";
		jcode += "\n  .done (showResult)\n  .fail(showError);"
	}
	else {
		jcode = "TODO";
	}

	var rawr = JSON.stringify(req, null, 2);
	$("#code").text(jcode);
	$("#raw").text(rawr);

	$("#runmsg").text("");
	$("#response").text("");	

}

function runCode () { 

	var script = $("#code").text();

	console.log(script)
	
	if (req.tabId == -1) {
		$("#response").text("This request cannot run because tab it came from doesn't exist. " + req.tabId);	
		return;
	}
	
	chrome.tabs.executeScript(req.tabId, {code:script}, function (result) {
		if (chrome.runtime.lastError !== undefined) {
			$("#response").text(chrome.runtime.lastError.message);	
		}
		else 
		{
			$("#response").text("Running...");	
		}
	});
}

function contentMsg (request, sender, sendResponse) {

	if (sender.tab === undefined) return;
	if (request.method === undefined) return;
	if (request.method !== "queryResult") return;

	$("#runmsg").text("Status: " + request.status + " content-type: " + request.contenttype);
	
	if (request.status === "error") {
		$("#response").text("Request returned error");	
		return;
	}
	
	if (request.status === "parseerror") 
	{
		$("#response").text(request.text);	
		return;
	}
	
	
	if (request.json !== undefined) {
		$("#response").text(JSON.stringify(request.json, null, 2));	
	}
	else {
		$("#response").text(request.text);	
	}

	

}


$(document).ready(function(){
	
	// content script responses
	chrome.runtime.onMessage.addListener(contentMsg);
	
	// UI event handlers
	$("#btnClear").click(function () {
			chrome.extension.getBackgroundPage().clear();
			showReqs();
	});

	$("#btnRun").click(function () {
		runCode();
	});

	$("input").change(function () { 

		//showReqs()
		} );
	
	$("#chkDoc").change (function () { 
		var v = (this.checked ? 1 : 0);
		typeFlt["main_frame"] = v;
		typeFlt["sub_frame"] = v;
		showReqs();
	});	
		
		

	$("#chkXhr").change (function () { 
		var v = (this.checked ? 1 : 0);
		typeFlt["xmlhttprequest"] = v;
		showReqs();
	});	

	$("#chkJs").change (function () { 
		var v = (this.checked ? 1 : 0);
		typeFlt["script"] = v;
		showReqs();
	});	

	
	$("#chkCss").change (function () { 
		var v = (this.checked ? 1 : 0);
		typeFlt["stylesheet"] = v;
		showReqs();
	});	

	$("#chkImg").change (function () { 
		var v = (this.checked ? 1 : 0);
		typeFlt["image"] = v;
		showReqs();
	});	

	$("#chkOther").change (function () { 
		var v = (this.checked ? 1 : 0);
		typeFlt["object"] = v;
		typeFlt["other"] = v;
		showReqs();
	});	
	
	$("#chkGet").change (function () { 
		var v = (this.checked ? 1 : 0);
		methFlt["GET"] = v;
		showReqs();
	});	

	$("#chkPost").change (function () { 
		var v = (this.checked ? 1 : 0);
		methFlt["GET"] = v;
		showReqs();
	});	

	$("#chkHttpOther").change (function () { 
		var v = (this.checked ? 1 : 0);
		methFlt["HEAD"] = v;
		methFlt["PUT"] = v;
		methFlt["DELETE"] = v;
		methFlt["TRACE"] = v;
		methFlt["OPTIONS"] = v;
		methFlt["CONNECT"] = v;
		methFlt["PATCH"] = v;
		showReqs();
	});	


	showReqs();
	setInterval(showReqs, 1000);
	
  });

 // Google tracker 
 (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-45974197-3', 'auto');
  ga('send', 'pageview');