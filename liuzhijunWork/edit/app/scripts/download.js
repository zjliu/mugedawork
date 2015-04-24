var URL = URL || webkitURL || window;

function saveAs(blob, filename) {
	var type = blob.type;
	var force_saveable_type = 'application/octet-stream';
	if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
		var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
		blob = slice.call(blob, 0, blob.size, force_saveable_type);
	}
	var url = URL.createObjectURL(blob);
	var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
	save_link.href = url;
	save_link.download = filename;

	var event = document.createEvent('MouseEvents');
	event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	save_link.dispatchEvent(event);
	URL.revokeObjectURL(url);
}

function saveText(name,str,contentType,charset){
	if(!window.Blob){
		console.log('%c The browser not support Blob!','color:red;');
		return;
	}
	contentType = contentType || 'text/plain';
	charset = charset || 'charset=utf-8';
	var fileTitle = contentType + ';' + charset;
	var blob = new Blob([str],{type:contentType});  
	saveAs(blob,name);
}
