//微卡地址
var cardUrl = 'http://card.mugeda.com/weixin/card/index.html?crid=53111ddda3664e90710001f3&audio=531133faa3664ea57100022e.mp3';
var jsonpUrl = 'http://card.mugeda.com/mudata/import/dzdp/fivestar.js';
//最多显示数量，其余的不显示
var maxLen = 32;

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
		compiled = _.template(scriptTemplate),
		html = compiled(data);
	el.appendHTML(html);
}

function applyInsertAfterTemplate(data,templateId,el,existingElement){ 
	var scriptTemplate = G(templateId).innerHTML,
		compiled = _.template(scriptTemplate),
		html = compiled(data);
	el.insertAfterHTML(html,existingElement);
}

var mugeda_data_import = function(data){ 
	if(!data || !data.data) return;
	var mdata = data.data;
	window.mdata = mdata;
	/*
	var Sel = {
		citySel : G('citySel'),
		secondSel : G('secondSel'),
		thirdSel : G('thirdSel')
	};
	*/

	var citySel = G('citySel'),
		secondSel = G('secondSel'),
		nameEl = G('name'),
		addrEl = G('addr'),
		result = G('result'),
		container = G('container');

	var selObj = getSelData(mdata);
	var cityArr = selObj.city;
	var secondArr = selObj.second;
	//按拼音排序
	cityArr.sort(function(a,b){return a.text.localeCompare(b.text);});
	initSelect({'data':cityArr},citySel);
	initSelect({'data':secondArr},secondSel);
	citySel.onchange=secondSel.onchange=nameEl.oninput=addrEl.oninput=change;

	/*
	Sel.secondSel.onchange=function(){
	};
	Sel.thirdSel.onchange=function(){ 
	}
	*/

	var isMobile = 'ontouchstart' in window;
	var startPonter = null;

	function start(e){
   		var point = isMobile ? e.touches[0] : e;
		startPonter = {x:point.pageX,y:point.pageY};
	}

	window.start = start;

	function end(e){
		if(!startPonter) return;
		var point = isMobile ? e.changedTouches[0] : e;
		if(startPonter.x!=point.pageX && startPonter.y!=point.pageY) return false;
		startPonter = null;
		return true;	
	}

	function viewCard(el,e){
		if(!end(e)) return;
		if(!window.Base64 || !Base64.encode) return;
		var id = parseInt(el.getAttribute('data-id'));
		var data= findById(mdata,id);
		//拼接成custom参数
		var paramStr = '';
		for(var key in data){
			paramStr+='&'+key+'='+encodeURIComponent(data[key]);
		}
		if(paramStr.length) paramStr=paramStr.substr(1,paramStr.length-1);
		var customUrl = cardUrl + "&custom=" +  Base64.encode(paramStr);
		window.location.href=customUrl;
	}

	window.viewCard = viewCard;

	function toggerCard(el,e){
		if(!end(e)) return;
		el.classList.toggle('active');
		var hasUl = el.nextElementSibling && el.nextElementSibling.tagName.toLowerCase()==="ul";
		if(!hasUl){ 
			var id = el.getAttribute('data-id');
			if(!id) return;
			var data= findById(mdata,id);
			applyInsertAfterTemplate({'item':data},"itemUl_template",el.parentElement,el);
		}
		el.nextElementSibling.classList.toggle('show');	
	}

	window.toggerCard = toggerCard;

	function change(e){ 
		var option = {};
		var shopname = nameEl.value.trim(),
			city = citySel.value,
			second = secondSel.value,
			addr = addrEl.value.trim();
		if(shopname) option['shopname'] = shopname;
		if(city && city!="0") option['city'] = city;
		if(second && second!="0"){ 
			option['second'] = second;
		}
		if(addr) { 
			option['zone'] = option['addr'] = addr;
		}
		setOpt(option);
		queryByOption(option);
	}

	function queryByOption(option){ 
		if(!option) return;
		var resultData = query(mdata,option);
		resultData && initContainer(resultData);		
	}

	function initContainer(resultData){
		var orgLen = resultData.length;
		if(orgLen>maxLen) resultData.length = maxLen;
		if(resultData.length){
			result.style.display="block";
			container.innerHTML = '';
			var temp = "搜索结果：共 <span>{0}</span> 条";
			if(orgLen>maxLen) temp += "，显示前 <span>{1}</span> 条";
			var showStr = replace(temp,orgLen,maxLen);
			result.querySelector('h2').innerHTML=showStr;
			applyTemplate({"data":resultData},'item_template',container);	
		}
		else{
			result.style.display="none";
		}
	}

	function initSelect(data,sel){
		sel.innerHTML = '';
		applyTemplate(data,"select_template",sel); 
	}

	function getSelData(data){ 
		var cityObj = {},secondObj = {},thirdObj = {};
		var cityArr = [],secondArr = [];
		for(var i=0,l=data.length;i<l;i++){ 
			var item = data[i],
				city = item.city,
				second = item.second,
				third = item.third;
			if(city && !cityObj[city]) {
				cityObj[city]=city;
				cityArr.push({'text':city,'value':city});
			}
			if(second && !secondObj[second]) { 
				secondObj[second]=second;
				var text = second;
				if(second==="NULL" || second==="null") text = "未分类";
				secondArr.push({'text':text,'value':second});
			}
			//if(third && !thirdObj[third]) thirdObj[third]=third;
		}
		return {'city':cityArr,'second':secondArr,'third':thirdObj};
	}

	function query(data,option){
		var arr=[];
		for(var i=0,l=data.length;i<l;i++){ 
			var item = data[i];
			var isAdd = true;
			for(var key in option){
				var value = option[key];
				var temp = item[key];
				if(!temp || (temp.indexOf(value)<0 && value.indexOf(temp)<0)){ 
					isAdd = false;
					break;
				}
			}
			/*
			if(isAdd) sum++;
			if(sum>maxLen){
				alert('搜索结果多于'+maxLen+'条，请修改搜索条件！');
				return;
			}
			*/
			if(isAdd) arr.push(item);
		}
		return arr;
	}

	function findById(data,shopid){
		for(var i=0,l=data.length;i<l;i++){ 
			var item = data[i];
			if(item.shopid==shopid) return item;
		}
	}

	function setOpt(option){ 
		localStorage.lastOpts = JSON.stringify(option);
	}

	function getOpt () {
		if(!localStorage.lastOpts) return;
		return  JSON.parse(localStorage.lastOpts);
	}

	function resetInput(option){
		if(!option) return;
		 if(option.shopname) nameEl.value = option.shopname;
		 if(option.city) citySel.value = option.city;
		 if(option.second) secondSel.value = option.second;
		 if(option.zone || option.addr) addrEl.value = option.zone || option.addr;
	}

	function init(){ 
		var option = getOpt();
		resetInput(option);
		queryByOption(option);
	}

	init();
};
function addScript(src){ 
	var JSONP = document.createElement('script');
	JSONP.type="text/javascript"; 
	JSONP.src=src + "?__="+Math.random();
	document.getElementsByTagName("head")[0].appendChild(JSONP);
}
!function(){
	addScript(jsonpUrl);
}();
