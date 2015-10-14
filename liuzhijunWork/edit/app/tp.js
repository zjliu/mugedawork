window.onload=function(){
	var tmpDom = document.querySelectorAll('script[type="template/script"]');
	Array.prototype.forEach.call(tmpDom,function(dom){
		var str = dom.innerHTML;
		var type = dom.dataset.data;
		var fun = window[type];
		if(!fun || typeof fun !=='function') return;
		fun(function(result){
			dom.parentNode.insertAfterHTML(template(str)(result),dom);
			dom.parentNode.removeChild(dom);
		});
	});
}
