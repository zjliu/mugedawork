function G(id){ 
	return document.getElementById(id);
}

HTMLElement.prototype.Q=function(selector){
	return this.querySelector(selector);
}

HTMLElement.prototype.QA=function(selector){
	return this.querySelectorAll(selector);
}

if(!HTMLElement.prototype.appendHTML){
	HTMLElement.prototype.appendHTML = function(html) {
	    var fragment = GetHTMLFragment(html);
	    this.appendChild(fragment);
	    fragment = null;
	}
}
if(!HTMLElement.prototype.insertBeforeHTML){
	HTMLElement.prototype.insertBeforeHTML = function(html,existingElement) {
		var fragment = GetHTMLFragment(html);
	    this.insertBefore(fragment,existingElement)
	    fragment = null;
	}
}
if(!HTMLElement.prototype.insertAfterHTML){
	HTMLElement.prototype.insertAfterHTML = function(html,existingElement) {
		var el = existingElement.nextElementSibling;
		if(el) this.insertBeforeHTML(html,el);
		else this.appendHTML(html);
	}
}

if(!String.prototype.trim){
	String.prototype.trim=function(){
	　　   return this.replace(/(^\s*)|(\s*$)/g, "");
	}
}

//进入全屏
function requestFullScreen() {
   var de = document.documentElement;
   if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
       de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
       de.webkitRequestFullScreen();
   }
}

//退出全屏
function exitFullScreen() {
   var de = document;
   if (de.exitFullscreen) {
        de.exitFullscreen();
   } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
   } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
   }
}

var getParam = function (name) {
	var url = window.location.search;
	var reg = new RegExp('(\\?|&)' + name + '=([^&?]*)', 'i');
	var arr = url.match(reg);
	if (arr) return arr[2];
}

//字符替换方法
var replace = function(html){ 
	if(!html || arguments.length<2) return;
	for(var i=1;i<arguments.length;i++){ 
		var reg = new RegExp('\\{'+(i-1)+'\\}','g');
		html = html.replace(reg,arguments[i]);
	}
	return html;
}

//模板功能
function template(tempStr,dataParam){
	var html='var html="";';
	tempStr.split(/(\<%[^<%]*%\>)/).map(function(item,index){
		var r = /^<%(=?.*)%>$/.exec(item);
		var value = '';
		if(r && r.length){
			value = r[1]; 
			if(value[0]=='=') html+=' html+'+value+';';
			else html+=value;
		}
		else{
			value = item.replace(/[\n\t]/g,'');
			html+=" html+='"+value+"';";
		}
	});
	html+=" return html;";
	var fun = new Function(dataParam || "data",html);
	return fun;
}

function GetHTMLFragment(html){ 
    var divTemp = document.createElement("div"), 
    	nodes = null,
        fragment = document.createDocumentFragment();// 文档片段，一次性append，提高性能

    divTemp.innerHTML = html;
    nodes = divTemp.childNodes;
    for (var i=0, length=nodes.length; i<length; i+=1) {
       fragment.appendChild(nodes[i].cloneNode(true));
    }
    return fragment;	
}

function applyTemplate(data,templateId,el){ 
	var scriptTemplate = G(templateId).innerHTML,
		compiled = template(scriptTemplate),
		html = compiled(data);
	el.appendHTML(html);
}

function applyInsertAfterTemplate(data,templateId,el,existingElement){ 
	var scriptTemplate = G(templateId).innerHTML,
		compiled = template(scriptTemplate),
		html = compiled(data);
	el.insertAfterHTML(html,existingElement);
}

function notify(title,body){
	if(window.currentNotify) window.currentNotify.close();
	if(Notification.permission !== 'denied'){
		Notification.requestPermission();
	}
	if(Notification.permission === "granted"){
		var option = {'dir':'rtl','icon':'images/notify.png','body':body};
		window.currentNotify = new Notification(title,option);
		setTimeout(function(){
			window.currentNotify.close();
		},2000);
	}
}

!function(win){
	
	var tokenFiled = 'access-token';
	AjaxUtil.options.tokenFiled = tokenFiled;

	var Q=function(selector){
		return document.querySelector(selector);
	}

	function animate(el){
		var animateName = el.dataset.animate;
		if(!animateName) return;
		el.classList.remove('hidden');
		el.classList.add('animated');
		el.classList.add(animateName);
	}

	var code = G('code');
	var defOpt = {
		lineNumbers: true,
		mode: 'javascript',
		lineWrapping: true,
		extraKeys: {"Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); }},
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		autoCloseTags: true,
		//styleActiveLine: true,
		//matchBrackets: true,
		theme:'3024-night'
	}
	var editor = CodeMirror.fromTextArea(code,defOpt);
	win.editor = editor;

	function setValue(value){
		editor.setValue(unescape(value));
	}

	function getValue(){
		return editor.getValue();
	}

	var lang = G('lang');
	var titleEl = G('title');
	var dialogEl = G('dialog');
	var colorEl = G('color');
	var resetBtn = G('reset');
	var vimEl = G('vim');
	var userInfoUl = G('userInfoUl');
	var dialogCloseEls = dialogEl.querySelectorAll('.close');
	var maskEl = G('mask');

	//遮罩
	doMask();
	var messageTip = document.querySelector('.messageTip');

	function showMessageTip(html){
		messageTip.innerHTML = html;
		animate(messageTip);
		setTimeout(function(){
			messageTip.classList.add('hidden');
		},2000);
	}

	var TypeObj={
		'js':'javascript',
		'css':'css',
		'html':'text/html',
		'less':'css',
		'sass':'sass',
		'haml':'text/html',
		'md':'text/x-markdown'
	};

	var reTypeObj={
		'javascript':'js',
		'css':'css',
		'text/html':'html',
		'text/x-markdown':'md'
	};

	function setTitle(value){
		titleEl.value = value;
		var type = value.match(/[^\./]+$/)[0];
		lang.value = TypeObj[type] || TypeObj.js;
		changeMode.bind(lang)();
	}

	function getTitle(){
		return titleEl.value;
	}

	function getType(){
		return document.getElementById('articleType').value;
	}

	var defColor = '#000000';

	function changeMode(){
		editor.setOption("mode",this.value);
		localStorage.codemirrormode=this.value;
	}

	lang.onchange = changeMode;

	function changeColor(){
		Q('.CodeMirror').style.backgroundColor=this.value;
		localStorage.codemirrorbg=this.value;
	}

	colorEl.onchange = changeColor;

	function vimChange(){
		editor.setOption('keyMap',vimEl.checked?"vim":"default");
		editor.setOption('matchBrackets',vimEl.checked);
		editor.setOption('showCursorWhenSelecting',vimEl.checked);
		localStorage.isVim = vimEl.checked;
	}

	vimEl.onchange = vimChange;

	function reset(){
		lang.value = defOpt.mode;
		colorEl.value = defColor;
		colorEl.onchange();
		lang.onchange();
	}

	resetBtn.onclick = reset;

	function toolsCBChange(){
		localStorage.showTools = ~~this.checked;
	}

	var toolsCBEl = G('toolsCB');
	toolsCBEl.addEventListener('change',toolsCBChange,false);

	function init(){
		if(localStorage.codemirrorbg) {
			var el_color = G('color');
			el_color.value = localStorage.codemirrorbg || defColor;
			el_color.onchange();
		}
		if(localStorage.codemirrormode){
			var el = lang;
			el.value = localStorage.codemirrormode;
			el.onchange();
		}
		if(localStorage.showTools){
			toolsCBEl.checked = !!~~localStorage.showTools;
		}
		if(localStorage.isVim){
			vimEl.checked = localStorage.isVim==="true";	
			vimEl.onchange();
		}
	}

	var ajaxCompleteObj={count:0,'category':false,'categoryList':false,'article':false};

	//初使化分类树
	AjaxUtil.ajax({
		url:'/category',
		type:'get',
		data:{'_':Math.random()},
		dataType:'json',
		success:function(data){
			var containner = G('frame');
			var obj={};
			var arr=[];
			data.forEach(function(item){
				var cid = item.cid;
				if(!obj[cid]){
					var cObj = {'text':item.cname,'url':''};
					cObj.children=[];
					obj[cid]=cObj;
				}
				obj[cid].children.push({
					'text':item.title,
					'url':'/index.html?aid='+item.aid
				});
			});
			for(var key in obj){
				arr.push(obj[key]);
			}
			applyTemplate(arr,'tree_template',containner);
			ajaxCompleteObj.category=true;
			ajaxCompleteObj.count++;
			unMask();
		}
	});

	var aid = getParam('aid');
	var cid = null;
	var categoryData=null;

	AjaxUtil.ajax({
		url:'/categoryList',
		type:'get',
		data:{'_':Math.random()},
		dataType:'json',
		success:function(data){
			categoryData = data;
			var langData = data.filter(function(item){
				return item.type===0;
			});
			applyTemplate(langData,'langTemplate',lang);
			initArticle(aid);
			ajaxCompleteObj.categoryList=true;
			ajaxCompleteObj.count++;
			unMask();
			init();
		}
	});

	function initArticle(aid){
		if(aid){
			AjaxUtil.ajax({
				url:'/article/'+aid,
				type:'get',
				dataType:'json',
				success:function(data){
					var title = data.title;
					setTitle(title);
					setValue(data.content);
					var type = title.substr(title.lastIndexOf('.')+1,title.length-title.lastIndexOf('.'));
					if(TypeObj[type]){
						lang.value = TypeObj[type];
						lang.onchange();
					}
					ajaxCompleteObj.article=true;
					ajaxCompleteObj.count++;
					unMask();
				}
			});
		}
		else{
			ajaxCompleteObj.count++;
			unMask();
		}
	}

	function unMask(){
		if(ajaxCompleteObj.count>=3){
			maskEl.style.display='none';
			maskEl.classList.remove('active');
		}
	}

	function doMask(){
		maskEl.style.display='block';
		maskEl.classList.add('active');
	}

	var rightMenu = G('rightMenu');
	var baseLiHeight = 35;
	var rightMenuHeight = rightMenu.querySelectorAll('li').length * baseLiHeight;
	win.oncontextmenu = function(e){
		e.preventDefault();
	}
	G('edit').oncontextmenu=function(e){
		e.preventDefault();
		if(/^(mask)|(dialog)$/.test(e.target.className)) return;
		var clientObject = document.body.getBoundingClientRect();
		var contextStyleObj = getComputedStyle(rightMenu);
		var bodyW = clientObject.width;
		var bodyH = clientObject.height;
		var contextW = parseInt(contextStyleObj['width']);
		var contextH = parseInt(contextStyleObj['height']) || rightMenuHeight;

		//默认在鼠标位置右下方
		rightMenu.style.top = e.pageY+'px';
		rightMenu.style.left = e.pageX+'px';
		//显示在左方
		if(e.pageX+contextW>bodyW){
			rightMenu.style.left = (e.pageX-contextW)+'px';
		}
		//显示在上方
		if(e.pageY+contextH>bodyH){
			rightMenu.style.top = (e.pageY-contextH)+'px';
		}
		showContextMenu();
	}

	function showContextMenu(){
		rightMenu.style.display='block';
	}

	function hideContextMenu(){
		rightMenu.style.display='none';
	}

	var dialog = new Dialog({
		'dialogEl':dialogEl,
		'maskEl':maskEl
	});

	function openAlert(message,closeCallback){
		var data={message:message||'',ok:'确定'};
		dialog.openFromTemplate(data,'alertTemplate',300,150,closeCallback);
	}

	function openConfirm(message,closeCallback){
		var data={message:message||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'confirmTemplate',300,150,closeCallback);
	}

	function openPrompt(tip,callback,closeCallback){
		var data={message:tip||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'promptTemplate',300,150,closeCallback);
		callback && callback();
	}

	function openFileOpen(tip,callback,closeCallback){
		var data={message:tip||'',ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'openFileTemplate',300,150,closeCallback);
		callback && callback();
	}

	function openLogin(callback,closeCallback){
		var data={ok:'确定',cancel:'取消'};
		dialog.openFromTemplate(data,'loginTemplate',300,150,closeCallback);
		callback && callback();
	}

	var rightMenuEvents = {
		newPage:function(){
			hideContextMenu();
			openConfirm('如果未保存的文件,确定打开新页面?',function(isOk){
				isOk &&	(win.location.href="/index.html");
			});
		},
		openFile:function(){
			hideContextMenu();
			var fileText = '';
			var fileName = '';
			openFileOpen('选择文件',function(){
				var input = G('openFileInput');
				input.addEventListener('change',function(e){
					fileName = this.value.match(/[^\\\/]+$/)[0];
					var label = dialogEl.querySelector('.openFileBtn');
					label.innerHTML = '文件读取中';
					var files = e.target.files;
					var readFile = files[0];
					var reader = new FileReader();
					reader.onload=function(e){
						fileText = this.result;
						input.value='';
						label.innerHTML = '读取完毕';
					}
					reader.readAsText(readFile);
				});
			},function(isOk){
				if(!isOk) return;
				setTitle(fileName);
				setValue(fileText);
			});
		},
		save:function(){
			if(!aid) return this.saveAs();
			var title = getTitle();
			var content = encodeURIComponent(getValue());
			var mdata = {'aid':aid,'title':title,'content':content};
			AjaxUtil.ajax({
				url:'/article/save',
				type:'post',
				data:mdata,
				dataType:'json',
				success:function(data){
					hideContextMenu();
					notify('保存文件',data.success?'文件保存成功！':data.message);
				}
			});
		},
		saveAs:function(){
			hideContextMenu();
			if(!categoryData) return;
			var data={'ok':'确定','cancel':'取消','list':categoryData,'title':getTitle()||'','cid':cid||''};
			var content = encodeURIComponent(getValue());
			var mdata = {'content':content};
			dialog.openFromTemplate(data,'saveAsTemplate',300,200,function(isOk){
				if(!isOk) return;
				mdata.cid = G('articleCategory').value;
				mdata.title = dialogEl.querySelector('.articleTitle').value;
				mdata.type = getType();
				AjaxUtil.ajax({
					url:'/article/add',
					type:'post',
					data:mdata,
					dataType:'json',
					success:function(data){
						hideContextMenu();
						notify('另存文件',data.success?'文件另存成功！':data.message);
						data.success && (win.location.href='index.html?aid='+data.data.aid);
					}
				});
			});
		},
		delete:function(){
			hideContextMenu();
			if(!aid) return;
			openConfirm('如果确定删除此文件?',function(isOk){
				if(!isOk) return;
				var mdata = {'aid':aid};
				AjaxUtil.ajax({
					url:'/article/delete',
					type:'get',
					data:mdata,
					dataType:'json',
					success:function(data){
						notify('删除文件',data.success?'文件删除成功！':data.message);
						data.success && (win.location.href='index.html');
					}
				});
			});
		},
		reload:function(){
			hideContextMenu();
			openConfirm('如果未保存的文件,确定重新加载?',function(isOk){
				isOk && (win.location.reload());
			});
		},
		download:function(){
			hideContextMenu();
			openPrompt('文件名',function(){
				var title = getTitle();
				if(!title) return;
				var index = title.lastIndexOf('.');
				if(index===-1) title +='.'+ reTypeObj[lang.value];
				dialogEl.querySelector('input').value = title;
			},function(isOk){
				if(!isOk || !win.saveText) return;
				var fileName = dialogEl.querySelector('.promptInput').value || getTitle() || 'download.text';
				win.saveText(fileName,getValue());
			});
		}
	};

	var rightClick = false;	
	rightMenu.onclick=function(e){
		var target = e.target;
		if(target.tagName.toLowerCase()=="span"){
			rightClick = true;
			var type = target.getAttribute('data-type');
			if(rightMenuEvents[type]) rightMenuEvents[type]();
		}
	}

	document.addEventListener('click',function(e){
		if(!rightClick){
			hideContextMenu();
		}
		rightClick=false;
	});

	document.addEventListener('keydown',function(e){
		if(e.keyCode===122){
			var editorFullScreen = G('editorFullScreen');
			editorFullScreen.checked = !editorFullScreen.checked;
			return;
		}
		if(!e.ctrlKey) return;
		var type = '';
		switch(String.fromCharCode(e.keyCode)){
			case 'U':
				type = 'newPage';
				break;
			case 'O':
				type = 'openFile';
				break;
			case 'S':
				type = e.altKey ? 'saveAs' : 'save';
				break;
			case 'D':
				if(e.altKey) type="delete";
				break;
			case 'M':
				type = 'download';
				break;
			case 'R':
				type = 'reload';
				break;
		}
		if(type){
			e.preventDefault();
			rightMenuEvents[type]();
		}
	});

/*===============login=============*/
	function doLogin(){
		var el = G('login');
		var nameEl = el.Q('input[name="username"]');
		var pwdEl= el.Q('input[name="password"]');
		var name = nameEl.value.trim();
		var pwd = pwdEl.value.trim();
		if(!name) {
			nameEl.focus();
			return;
		}
		if(!pwd){
			pwdEl.focus();
			return;
		}
		var mdata={'name':name,'pwd':pwd,'_':Math.random()};
		AjaxUtil.ajax({
			url:'/login',
			type:'post',
			data:mdata,
			dataType:'json',
			success:function(data){
				if(data.success) {
					localStorage[tokenFiled] = data.token;
					localStorage.userName = name;
					initLogin();
					notify('用户登录',data.success?'用户登录成功！':data.message);
					window.location.href='main.html';
				}
				else pwdEl.focus();
			}
		});
	}
	win.login = doLogin;

	function exitLogin(){
		delete localStorage[tokenFiled];
		delete localStorage.userName;
		window.location.href="#login";
	}

	var orgHash = location.hash;
	function hashchange(){
		hash=location.hash || '#edit';
		if(orgHash && Q(orgHash)){
			var orgPage = Q(orgHash);
			orgPage.classList.remove('slidedown');
		}
		if(hash && Q(hash)){
			var curPage = Q(hash);
			setTimeout(function(){
				curPage.classList.add('slidedown');
			});
		}
		orgHash = hash;
	}
	window.onhashchange=hashchange;
	hashchange();

	function initLogin(){
		var userInfo = G('userInfo');
		var isLogin = !!localStorage[tokenFiled];
		var loginEl = userInfo.querySelector('.login');
		var noLoginEl = userInfo.querySelector('.noLogin');
		if(isLogin){
			loginEl.firstElementChild.innerHTML = localStorage.userName;
			loginEl.classList.add('active');
			noLoginEl.classList.remove('active');
		}
		else{
			noLoginEl.classList.add('active');
			loginEl.classList.remove('active');
		}
	}
	initLogin();

	var userEvents={
		exit:function(){
			delete localStorage[tokenFiled];
			delete localStorage.userName;
			win.location.href="index.html#login";
		},
		admin:function(){
			win.location.href="main.html";
		}
	}

	userInfoUl.addEventListener('click',function(e){
		var target = e.target;
		if(target.tagName.toLowerCase()!=='li') return;
		var type=target.getAttribute('type');
		userEvents[type] && userEvents[type]();
	});

}(window);
