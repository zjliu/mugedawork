function G(id){ 
	return document.getElementById(id);
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

!function(win){

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
		mode: 'text/html',
		autoCloseTags: true
	}
	var editor = CodeMirror.fromTextArea(code,defOpt);

	function setValue(value){
		editor.setValue(value);
	}

	function getValue(){
		return editor.getValue();
	}

	var lang = G('lang');
	var titleEl = G('title');
	var dialogEl = G('dialog');
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

	function setTitle(value){
		titleEl.value = value;
	}

	function getTitle(){
		return titleEl.value;
	}

	var defColor = '#DCDCDC';

	function changeMode(el){
		editor.setOption("mode",el.value);
		localStorage.codemirrormode=el.value;
	}

	win.changeMode = changeMode;

	function changeColor(el){
		Q('.CodeMirror').style.backgroundColor=el.value;
		localStorage.codemirrorbg=el.value;
	}

	win.changeColor = changeColor;

	function reset(){
		var color = G('color');
		lang.value = defOpt.mode;
		color.value = defColor;
		lang.onchange();
		color.onchange();
	}

	win.reset = reset;

	function init(){
		if(localStorage.codemirrorbg) {
			var el = G('color');
			el.value = localStorage.codemirrorbg;
			el.onchange();
		}
		if(localStorage.codemirrormode){
			var el = lang;
			el.value = localStorage.codemirrormode;
			el.onchange();
		}
	}

	init();

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
			applyTemplate(categoryData,'codemirrorTemplate',lang);
			initArticle(aid);
			ajaxCompleteObj.categoryList=true;
			ajaxCompleteObj.count++;
			unMask();
		}
	});


	function initArticle(aid){
		if(aid){
			AjaxUtil.ajax({
				url:'/article/'+aid,
				type:'get',
				data:{'_':Math.random()},
				dataType:'json',
				success:function(data){
					setTitle(data.title);
					setValue(data.content);
					cid = data.cid;
					var op=lang.querySelector('option[key="'+cid+'"]');
					lang.value = op.value;
					lang.onchange();
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
	win.oncontextmenu=function(e){
		e.preventDefault();
		if(/^(mask)|(dialog)$/.test(e.target.className)) return;
		var clientObject = document.body.getBoundingClientRect();
		var contextStyleObj = getComputedStyle(rightMenu);
		var bodyW = clientObject.width;
		var bodyH = clientObject.height;
		var contextW = parseInt(contextStyleObj['width']);
		var contextH = parseInt(contextStyleObj['height']) || 246;

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

	function showDialog(){
		dialogEl.style.display='block';
		maskEl.style.display='block';
		setTimeout(function(){
			dialogEl.classList.add('active');
			maskEl.classList.add('active');
		});
	}

	function closeDialog(){
		dialogEl.classList.remove('active');
		maskEl.classList.remove('active');
		setTimeout(function(){
			dialogEl.style.display='none';
			maskEl.style.display='none';
		},500);
	}

	function openDialog(html){
		var container = dialogEl.querySelector('.container');
		container.innerHTML = html;
		showDialog();
	}

	function openAlert(message){
		var data={message:message||'',ok:'确定'};
		openFromTemplate(data,'alertTemplate',300,150);
	}

	function openConfirm(message){
		var data={message:message||'',ok:'确定',cancel:'取消'};
		openFromTemplate(data,'confirmTemplate',300,150);
	}

	function openPrompt(tip){
		var data={message:tip||'',ok:'确定',cancel:'取消'};
		openFromTemplate(data,'promptTemplate',300,150);
	}

	function openFromTemplate(data,tempId,width,height){
		if(width) dialogEl.style.width = width + 'px';
		if(height) dialogEl.style.height = height + 'px';
		var container = dialogEl.querySelector('.container');
		container.innerHTML = '';
		applyTemplate(data,tempId,container);
		showDialog();
	}

	var closeCallback = null;
	dialogEl.onclick=function(e){
		var el = e.target;
		if(el.classList.contains('close')){
			var type = el.getAttribute('data-type');
			closeDialog();
			closeCallback && closeCallback(type==='ok');
			closeCallback = null;
		}
	}

	var rightMenuEvents = {
		newPage:function(){
			hideContextMenu();
			openConfirm('如果未保存的文件,确定打开新页面?');
			closeCallback = function(isOk){
				isOk &&	(win.location.href="/index.html");
			}
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
					showMessageTip(data.success?'保存成功！':'保存失败！');
				}
			});
		},
		saveAs:function(){
			hideContextMenu();
			if(!categoryData) return;
			var data={'ok':'确定','cancel':'取消','list':categoryData,'title':getTitle()||'','cid':cid||''};
			openFromTemplate(data,'saveAsTemplate',300,150);
			var content = encodeURIComponent(getValue());
			var mdata = {'content':content};
			closeCallback = function(isOk){
				if(!isOk) return;
				mdata.cid = G('articleCategory').value;
				mdata.title = dialogEl.querySelector('.articleTitle').value;
				AjaxUtil.ajax({
					url:'/article/add',
					type:'post',
					data:mdata,
					dataType:'json',
					success:function(data){
						hideContextMenu();
						//showMessageTip(data.success?'保存成功！':'保存失败！');
						data.success && (win.location.href='index.html?aid='+data.data.aid);
					}
				});
			}
		},
		delete:function(){
			hideContextMenu();
			if(!aid) return;
			openConfirm('如果确定删除此文件?');
			closeCallback = function(isOk){
				if(!isOk) return;
				var mdata = {'aid':aid};
				AjaxUtil.ajax({
					url:'/article/delete',
					type:'get',
					data:mdata,
					dataType:'json',
					success:function(data){
						data.success && (win.location.href='index.html');
					}
				});
			}
		},
		reload:function(){
			hideContextMenu();
			openConfirm('如果未保存的文件,确定重新加载?');
			closeCallback = function(isOk){
				isOk && (win.location.reload());
			}
		},
		download:function(){
			hideContextMenu();
			openPrompt('文件名');
			closeCallback=function(isOk){
				if(!isOk || !win.saveText) return;
				var fileName = dialogEl.querySelector('.promptInput').value || getTitle() || 'download.text';
				win.saveText(fileName,getValue());
			}
		}
	};

	var rightClick = false;	
	rightMenu.onclick=function(e){
		var target = e.target;
		if(target.tagName.toLowerCase()=="a"){
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

}(window);

