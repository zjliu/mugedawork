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
	AjaxUtil.ajax({
		url:'data.json',
		type:'get',
		data:{'_':Math.random()},
		dataType:'json',
		success:function(data){
			var containner = G('frame');
			applyTemplate(data.data,'tree_template',containner);
		}
	});
}(window);


