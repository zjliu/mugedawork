HTMLElement.prototype.appendHTML = function(html) {
    var divTemp = document.createElement("div"), nodes = null
        // 文档片段，一次性append，提高性能
        , fragment = document.createDocumentFragment();
    divTemp.innerHTML = html;
    nodes = divTemp.childNodes;
    for (var i=0, length=nodes.length; i<length; i+=1) {
       fragment.appendChild(nodes[i].cloneNode(true));
    }
    this.appendChild(fragment);
    // 据说下面这样子世界会更清净
    nodes = null;
    fragment = null;
}

HTMLElement.prototype.insertBeforeHTML = function(html,existingElement) {
    var divTemp = document.createElement("div"), nodes = null
        // 文档片段，一次性append，提高性能
        , fragment = document.createDocumentFragment();
    divTemp.innerHTML = html;
    nodes = divTemp.childNodes;
    for (var i=0, length=nodes.length; i<length; i+=1) {
       fragment.appendChild(nodes[i].cloneNode(true));
    }
    this.insertBefore(fragment,existingElement)
    // 据说下面这样子世界会更清净
    nodes = null;
    fragment = null;
}


var AjaxUtil = {
	// 基础选项
	options : {
		method : "get", // 默认提交的方法,get post
		url : "", // 请求的路径 required
		params : {}, // 请求的参数
		type : 'text', // 返回的内容的类型,text,xml,json
		callback : function() {
		}// 回调函数 required
	},
	// 创建XMLHttpRequest对象
	createRequest : function() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");// IE6以上版本
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");// IE6以下版本
			} catch (e) {
				try {
					xmlhttp = new XMLHttpRequest();
					if (xmlhttp.overrideMimeType) {
						xmlhttp.overrideMimeType("text/xml");
					}
				} catch (e) {
					alert("您的浏览器不支持Ajax");
				}
			}
		}
		return xmlhttp;
	},
	// 设置基础选项
	setOptions : function(newOptions) {
		for ( var pro in newOptions) {
			this.options[pro] = newOptions[pro];
		}
	},
	// 格式化请求参数
	formateParameters : function() {
		var paramsArray = [];
		var params = this.options.params;
		for ( var pro in params) {
			var paramValue = params[pro]; 
			paramsArray.push(pro + "=" + paramValue);
		}
		return paramsArray.join("&");
	},

	// 状态改变的处理
	readystatechange : function(xmlhttp) {
		// 获取返回值
		var returnValue;
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			switch (this.options.type) {
			case "xml":
				returnValue = xmlhttp.responseXML;
				break;
			case "json":
				var jsonText = xmlhttp.responseText;
				if(jsonText){
					returnValue = eval("(" + jsonText + ")");
				}
				break;
			default:
				returnValue = xmlhttp.responseText;
				break;
			}
			if (returnValue) {
				this.options.callback.call(this, returnValue);
			} else {
				this.options.callback.call(this);
			}
		}
	},

	// 发送Ajax请求
	request : function(options) {
		var ajaxObj = this;

		// 设置参数
		ajaxObj.setOptions.call(ajaxObj, options);

		// 创建XMLHttpRequest对象
		var xmlhttp = ajaxObj.createRequest.call(ajaxObj);

		// 设置回调函数
		xmlhttp.onreadystatechange = function() {
			ajaxObj.readystatechange.call(ajaxObj, xmlhttp);
		};

		// 格式化参数
		var formateParams = ajaxObj.formateParameters.call(ajaxObj);

		// 请求的方式
		var method = ajaxObj.options.method;
		var url = ajaxObj.options.url;

		if ("GET" === method.toUpperCase()) {
			url += "?" + formateParams;
		}

		// 建立连接
		xmlhttp.open(method, url, true);

		if ("GET" === method.toUpperCase()) {
			//发送请求
			xmlhttp.send(null);
		} else if ("POST" === method.toUpperCase()) {
			// 如果是POST提交，设置请求头信息
			xmlhttp.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");
			//发送请求
			xmlhttp.send(formateParams);
		}
	}
};

var messageBox = (function(win){ 
	/*
	var item = {
		'status':0,
		'crid': 'xxxxxxxxxxxxxxx',
		'title': '有你的每一秒',
		'thumb':img,
		'hashid':'xxxxxxxxxxxxxx',
		'count':20,
		'cpp':20,
		'page':0,
		'datas':[
			{
				'id':'79962',
				'time':'5分钟之前',
				'data':'生活中有你很美好！希望今 后你永远开心和快乐！',
				'thumb': '用户上传图片缩略图地址信息',
				'avatar':img,
				'name':'sMall.ff',
				'message':''
			}
		]
	}
	*/

	function G(id){ 
		return document.getElementById(id);
	}
	function clone(data){ 
		return JSON.parse(JSON.stringify(data));
	}
	function applyTemplate(data,templateId,el,isInsert){ 
		var scriptTemplate = G(templateId).innerHTML,
			compiled = _.template(scriptTemplate),
			html = compiled(data);
		el.appendHTML(html);
	}
	function applyInsertBeforeTemplate(data,templateId,el,existingElement){ 
		var scriptTemplate = G(templateId).innerHTML,
			compiled = _.template(scriptTemplate),
			html = compiled(data);
		el.insertBeforeHTML(html,existingElement);
	}


	var opts={ 
		//容器
		container:document.body,
		//内容器（frame）模板Id
		boxTemplateId:'box_template',
		//子填充项（section）模板Id
		itemTemplateId:'section_item',
		//加载图标模板Id
		loadingTemplateId:'loading_template',
		//获取数据接口，由外部回调提供
		data_url_callback:function(pageIndex){ 
		},
		//ajax请求方式
		ajaxType:'post',
		//加载的图标
		ladding_img_url:'images/list_loading.gif'
	}

	var loadStatus = { 
		loading:'loading',
		loaded:'loaded'
	};

	var msgBox = function(opt){ 
		if(!win._){ 
			console.log('need underscore.js');
			return;
		}
		this.opt = opts;
		for(var key in opt){ 
			this.opt[key] = opt[key];
		}
		this.pageIndex = 0;
		this.status = loadStatus.loaded;
		//this.pageCount = this.opt.pageCount;
		this.init();
	}
	msgBox.prototype={ 
		init:function(){ 
			//添加内容器到父窗口
			this.initBox();
			this.initEvent();
			this.showLoading();
			this.queryNext();
		},
		initEvent:function(){ 
			var self = this;
				opt = self.opt,
				container = self.container,
				height = Math.max(container.scrollHeight,container.offsetHeight,container.clientHeight);

			container.onscroll=function(){ 
				if((this.scrollTop + this.offsetHeight - this.scrollHeight > -16) && self.status===loadStatus.loaded){ 
					self.status = loadStatus.loading;
					self.queryNext();
				}
			}
		},
		initBox:function(){ 
			var opt=this.opt;
			applyTemplate(null,opt.boxTemplateId,opt.container);
			this.container = opt.container.querySelector('.container');
		},
		queryNext:function(){ 
			var nextPage = this.pageIndex + 1;
			if(!this.pageCount || nextPage<this.pageCount){
				this.queryPage(nextPage,this.proxy(this.fillData));
			}
		},
		queryPage:function(pageIndex,successCallback){ 
			var self = this,
				opt = self.opt,
				urlData = opt.data_url_callback(pageIndex);

			var data_url = urlData.url,
				data_params = urlData.params,
				_t = parseInt(Date.now()+Math.random()*100);

			data_params['_t']=_t;
			AjaxUtil.request({ 
				url: data_url,
				type:'json',
				params:data_params,
				method:'get',
				callback:function(data){ 
					successCallback && successCallback(data);
					self.pageIndex = self.pageIndex +1;
					if(data.count){ 
						this.pageCount = parseInt(data.pageCount);
					}
					self.status = loadStatus.loaded;
				}
			});
		},
		fillData:function(data){ 
			var opt = this.opt;
			var reData = this.dealData(data);
			applyInsertBeforeTemplate({data:reData},opt.itemTemplateId,container,this.loadingEl);	
		},
		dealData:function (data){
			return clone(data.datas);
		},
		showLoading:function(){
			var opt = this.opt;
			applyTemplate({'ladding_img_url':opt.ladding_img_url},opt.loadingTemplateId,container);	
			this.loadingEl = this.container.querySelector('.loadding_section');
		},
		proxy:function(func){ 
			var self = this;
			return (function(){ 
				return func.apply(self,arguments);
			});
		}
	}
	return msgBox;
})(window);