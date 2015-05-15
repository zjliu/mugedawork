function Q(selector,dom){
	return (dom||document).querySelector(selector);
}
var toggleClass = 'slideleft';
var listMenuEl = Q('.listMenu');


var firstPageSelector = "#page1";
var orgHash = location.hash;
function hashchange(){
	hash=location.hash || firstPageSelector;
	if(orgHash && Q(orgHash)){
		var orgPage = Q(orgHash);
		orgPage.classList.remove(toggleClass);
		if(hash!=firstPageSelector) Q(firstPageSelector).classList.remove(toggleClass);
	}
	if(hash && Q(hash)){
		var curPage = Q(hash);
		loadPage(curPage);
		setTimeout(function(){
			curPage.classList.add(toggleClass);
		},500);
		var index = curPage.index();
		if(index>-1){
			var aEl = listMenuEl.children[index];
			aEl && listMenuclick(null,aEl);
		}
	}
	orgHash = hash;
}
window.onhashchange=hashchange;

function listMenuclick(e,el){
	var target = el || e.target;
	if(!target.href) return;
	var lastActive = target.parentNode.querySelector('.active');
	lastActive && lastActive.classList.remove('active');
	target.classList.add('active');
}

listMenuEl.onclick=listMenuclick;

var PageLoader={
	penlist:{
		init:loadPenList,
		loaded:false
	}
}

function loadPage(pageEl){
	var fun=pageEl.dataset.fun;
	if(!fun) return;
	var obj = PageLoader[fun];
	if(obj.loaded) return;
	var callback = PageLoader[fun].init;
	callback && callback.bind(obj)();
}

hashchange();

function loadPenList(){
	var dialogEl = G('dialog');
	var maskEl = G('mask');
	var createBtn = G('createBtn');

	var dialog = new Dialog({
		'dialogEl':dialogEl,
		'maskEl':maskEl
	});

	AjaxUtil.ajax({
		url:'/pen/list',
		type:'get',
		dataType:'json',
		success:function(data){
			if(data && data.success === false){
				window.location.href="index.html#login";
			}
			applyTemplate(data,'articleTemplate',G('articleList'),true);
		},
		error:function(info){
			console.log(info);
		}
	});

	function openPenDialog(callback,mdata){
		var data = mdata || {};
		data.ok = "确定";
		data.cancel = "取消";
		dialog.openFromTemplate(data,'createArticleTemplate',350,250,callback);
	}

	function openConfirm(message,closeCallback){
		var data={message:message||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'confirmTemplate',300,150,closeCallback);
	}

	function createPen(){
		openPenDialog(function(result){
			if(!result) return;
			var form = dialogEl.querySelector('form');
			var mdata = form.serialize();
			AjaxUtil.ajax({
				url:'/pen/add',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						window.location.reload();
					}
				},
				error:function(info){
					console.log(info);
				}
			});
		});
	}

	createBtn.onclick=function(){
		createPen();
	}

	function penModify(pid,el){
		var penEl = el.closest(function(dom){
			return dom.tagName.toLowerCase()==='section';
		});
		if(!penEl) return;
		var dataEl = penEl.querySelector('.itemData');
		if(!dataEl) return;
		var data = JSON.parse(unescape(dataEl.value));

		openPenDialog(function(result){
			if(!result) return;
			var form = dialogEl.querySelector('form');
			var mdata = form.serialize();
			mdata.pid = pid;
			AjaxUtil.ajax({
				url:'/pen/update',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						window.location.reload();
					}
				},
				error:function(info){
					console.log(info);
				}
			});
		},data);
	}
	window.penModify=penModify;

	function penDrop(pid,el){
		openConfirm('是否删除此作品？',function(result){
			if(!result) return;
			var mdata = {'pid':pid};
			AjaxUtil.ajax({
				url:'/pen/delete',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					if(data.success){
						window.location.reload();
					}
				},
				error:function(info){
					console.log(info);
				}
			});
		});
	}
	window.penDrop=penDrop;
	this.loaded=true;
}
