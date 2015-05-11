!function(){
	var dialogEl = G('dialog');
	var maskEl = G('mask');
	var createBtn = G('createBtn');

	var dialog = new Dialog({
		'dialogEl':dialogEl,
		'maskEl':maskEl
	});

	var data=[{},{},{},{}];
	applyTemplate(data,'articleTemplate',G('articleList'));

	function createArticle(message){
		var data={message:message||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'createArticleTemplate',350,250,function(result){
		});
	}

	createArticle();

	createBtn.onclick=function(){
		createArticle();
	}

}();
