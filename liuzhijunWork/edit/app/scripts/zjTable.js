var zjData= [ 
/*
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
*/
	[
		{name:"field",text:"属姓名",type:"int"},
		{name:"type",text:"类型",type:"list", data:['整数','短整数','字符串','日期'] },
		{name:"opacity",text:"日期",type:"date"}
	]
];

var mdata = [
	['男',0,'2015-03-14'],
	['男',1,'2015-03-14'],
	['男',2,'2015-03-14'],
	['男',0,'2015-03-14'],
	['男',1,'2015-03-14'],
	['男',1,'2015-03-14'],
	['男',2,'2015-03-14']
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

HTMLElement.prototype.index=function(){
	return Array.prototype.indexOf.call(this.parentNode.children,this);
}

var zjTable = (function(){
	var twObj={'int':70,'shortInt':40,'string':70,'shortString':40,'date':120,'datetime':150,'list':120};
	function getNowString(ctime){
		var d = new Date;
		var str = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
		return str+(ctime?' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':'):'')
	}
	//template
	var selectTemplate = `
		<select>
			<%for(var i=0,l=data.length;i<l;i++){%>
				<option value="<%=i%>"<%=attr('selected',value===data[i])%>><%=data[i]%></option>
			<%}%>
		</select>
	`;
	//data,item,edit
	var rowDataTemplate = `
		<tr class="tbData<%=data.edit?" edit":""%>">
			<%if(data.edit){for(var value of item){switch(value.type){%>
				<%case "list":%>
					<td><select>
						<%for(var i=0,l=value.value.length;i<l;i++){%>
							<option value="<%=i%>"><%=value.value[i]%></option>
						<%}%>
					</select></td>
				<%break;default:%><td><input type="text" value="<%=value.value%>" /></td><%break;%>
			<%}}}else for(var i=0,l=item.length;i<l;i++){%><td><%=item[i]%></td><%}%>
			<%if(data.operate){with(data.operate){%>
				<%if(add+update+drop>0){%>
					<td class="zjtable_opr_data">
						<%if(add){%> <i class="zjtable_row_add fa fa-plus" title="添加"></i> <%}%>
						<%if(update){%> <i class="zjtable_row_update fa fa-pencil-square-o" title="修改"></i> <%}%>
						<%if(drop){%> <i class="zjtable_row_delete fa fa-times" title="删除"></i> <%}%>
					</td>
				<%}%>
				<%if(up+down>0){%>
					<td class="zjtable_opr_move">
						<%if(up){%> <i class="zjtable_row_up fa fa-arrow-up" title="上移"></i><%}%>
						<%if(down){%> <i class="zjtable_row_down fa fa-arrow-down" title="下移"></i> <%}%>
					</td>
				<%}%>
			<%}}%>
		</tr>
	`;
	var headerTemptStr = `
		<table class="zjtable" width="<%=data.tableWidth%>px">
			<%data.fields.forEach(function(jtem,jndex){%>
				<%var isLast=jndex===data.fields.length-1;%>
				<tr<%=attr("class",isLast?"fields":"header")%>>
					<%jtem.forEach(function(item){%>
						<th<%=attr("type",item.type)%><%=attr("rowspan",item.rowspan)%><%=attr("colspan",item.colspan)%>>
							<%=item.text%>
						</th>
					<%});%>
					<%if(isLast && data.operate){with(data.operate){%>
						<%if(add+update+drop+up+down>0){%>
							<th<%=attr("colspan",~~!!(add+update+drop) + ~~!!(up+down)===2?2:0)%>>操作</th>
						<%}%>
					<%}}%>
				</tr>
			<%});%>
			<%data.data.forEach(function(item){%> ${rowDataTemplate} <%});%>
		</table>
	`;
	var selectFun = template(selectTemplate,'data,value');
	var headerFun = template(headerTemptStr);
	var rowFun = template(rowDataTemplate,'data,item');
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
			this.initEvent();
		},
		initData:function(){
			var self = this;
			this.queryData(function(data){
				self.tData = zjData;
				self.containerEl.innerHTML = headerFun({
					fields:zjData,
					data:mdata,
					operate:{add:1,update:1,drop:1,up:1,down:1},
					tableWidth:self.getTableWidth()
				});
			});
		},
		queryData:function(callback){
			ajax({ type:'POST', url:this.opts.dataUrl, data:{a:1,b:2}, success:callback });
		},
		getColData:function(tdEl){
			return this.tData[tdEl.index()];
		},
		getTableWidth:function(){
			var arr = this.tData[this.tData.length-1].map(p=>twObj[p.type]);
				arr.push(180);
			return arr.reduce((a,b)=>a+b);
		},
		getEmptyTrData:function(){
			var tData = this.tData[this.tData.length-1];
			var arr=[],obj;
			for(var item of tData){
				obj = {};
				obj.type = item.type;
				switch(item.type){
					case 'shortInt': case 'int': obj.value = 0; break;
					case 'date': obj.value = getNowString(); break;
					case 'datetime': obj.value = getNowString(true); break;
					case 'list': obj.value = item.data; break;
					default: obj.value = ''; break;
				}
				arr.push(obj);
			}
			return arr;
		},
		initEvent:function(){
			this.initOperate();	
		},
		initOperate:function(){
			var self = this;
			this.containerEl.addEventListener('click',function(e){
				var target = e.target;
				if(/zjtable_row_add/.test(target.className)) {self.addNewRow(target);return;}
				if(/zjtable_row_update/.test(target.className)) {self.modifyRow(target);return;}
				if(/zjtable_row_delete/.test(target.className)) {self.deleteRow(target);return;}
				if(/zjtable_row_up/.test(target.className)) {self.rangeRow(target,true);return;}
				if(/zjtable_row_down/.test(target.className)) {self.rangeRow(target);return;}
			});
		},
		addNewRow:function(el){
			var trEl = el.closest(p=>p.tagName.toLowerCase()==='tr');
			var temp = document.createElement('tbody');
			temp.innerHTML = rowFun({
				tbData:this.tData, edit:true,
				operate:{add:1,update:1,drop:1,up:1,down:1}
			}, this.getEmptyTrData());
			if(trEl.nextElementSibling) trEl.parentElement.insertBefore(temp.firstChild,trEl.nextElementSibling);
			else trEl.parentElement.appendChild(temp.firstChild);
		},
		modifyRow:function(el){
			var trEl = el.closest(p=>p.tagName.toLowerCase()==='tr');
				trEl.classList.add('edit');
			var arr = this.tData[this.tData.length-1];
			for(var i=0,l=arr.length;i<l;i++){
				var item = arr[i];
				var td = trEl.children[i];
				switch(item.type){
					case 'list':
						td.innerHTML = selectFun(item.data,0);
					break;
					default:
						td.innerHTML = `<input type="text" value="${td.innerText}">`;
					break;
				}
			}
		},
		deleteRow:function(el){
			var trEl = el.closest(p=>p.tagName.toLowerCase()==='tr');
			trEl.parentElement.removeChild(trEl);
		},
		rangeRow:function(el,isup){
		}
	}
	return table;
})();
