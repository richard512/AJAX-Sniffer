function showResult(adata, astatus, axhr) 
{ 
	console.log("Ajext.success: " + astatus); 
	chrome.runtime.sendMessage(
		{
		"method": "queryResult", 
		"text": axhr.responseText, 
		"status": astatus, 
		"json": axhr.responseJSON, 
		"xml": axhr.responseXML,
		"contenttype": axhr.getResponseHeader("content-type")
		}); 
}

function showError (axhr, astatus, aerror) 
{ 
	console.log("Ajext.fail: " + astatus); 
	chrome.runtime.sendMessage(
		{
		"method": "queryResult", 
		"text": axhr.responseText, 
		"status": astatus, 
		"json": axhr.responseJSON, 
		"xml": axhr.responseXML,
		"contenttype": axhr.getResponseHeader("content-type"),
		"error": aerror
		}); 
}
