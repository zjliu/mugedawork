var zjData= [ 
	[
		{name:"base", text:"固有属性", colspan:2},
		{name:"other", text:"添加属性", colspan:2}
	],
	[
		{ name:"sex", text:"性别", type:"shortInt"},
		{ name:"name", text:"姓名",  type:"string"},
		{ name:"address", text:"地址",  type:"string"},
		{ name:"date", text:"日期",  type:"date"}
	]
];

var mdata = [
	['男','刘致军','北京','2015-03-14'],
	['男','刘致军','北京','2015-03-14'],
	['男','刘致军','北京','2015-03-14'],
	['男','刘致军','北京','2015-03-14'],
	['男','刘致军','北京','2015-03-14'],
	['男','刘致军','北京','2015-03-14'],
	['男','刘致军','北京','2015-03-14']
];

function ajax(opt){
	var isPost = opt.type.toLowerCase()==='post';
	opt.data._=+new Date;
	var paramStr = ''; for(var key in opt.data) paramStr=[paramStr,'&',key,'=',opt.data[key]].join('');
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange=function(){
		if(this.readyState===4 && this.status===200) opt.success(JSON.parse(this.responseText));
	}
	if(isPost){
		xhr.open(opt.type,opt.url);
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xhr.send(paramStr.replace(/^./,''));
	}
	else {
		opt.url = opt.url.indexOf('?')>0?opt.url+paramStr:opt.url+paramStr.replace(/^./,'?');
		xhr.open(opt.type,opt.url);
		xhr.send(null);
	}
}

var zjTable = (function(){
	//template
	var headerTemptStr = `
		<table class="zjtable">
			<%data.fields.forEach(function(jtem,jndex){%>
				<tr<%=attr("class",jndex===data.fields.length-1?"fileds":"header")%>>
					<%jtem.forEach(function(item){%>
						<th<%=attr("type",item.type)%><%=attr("rowspan",item.rowspan)%><%=attr("colspan",item.colspan)%>>
							<%=item.text%>
						</th>
					<%});%>
				</tr>
			<%});%>
			<%data.data.forEach(function(item){%>
				<tr class="tbData"><%for(var value of item){%><td><%=value%></td><%}%></tr>
			<%});%>
		</table>
	`;
	var headerFun = template(headerTemptStr);
	var options = {
		container:null,
		dataUrl:null
	};
	var table = function(opts){
		this.opts = {};
		for(var key in options) 
			this.opts[key]=opts[key]||options[key];
		this.init();
	}
	table.prototype={
		init:function(){
			var opt = this.opts;
			if(!opt.container) return;
			this.containerEl = document.querySelector(opt.container);
			if(!this.containerEl) return;

			this.initData();
		},
		initData:function(){
			var self = this;
			this.queryData(function(data){
				self.containerEl.innerHTML = headerFun(data);
			});
		},
		queryData:function(callback){
			ajax({ type:'POST', url:this.opts.dataUrl, data:{a:1,b:2}, success:callback });
		}
	}
	return table;
})();
