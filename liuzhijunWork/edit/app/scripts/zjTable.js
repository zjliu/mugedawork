/*
var zjData= [ 
	[
		{name:"table", text:"表字段", colspan:4}
	],
	[
		{name:"field",text:"属姓名",type:"string",hidden:false},
		{name:"type",text:"类型",type:"list", data:['int','shortInt','string','date'],hidden:false },
		{name:"color",text:"顔色",type:"color",hidden:false},
		{name:"udate",text:"更新日期",type:"date",hidden:false}
	]
];

var mdata = [
	['name',0,'#33FF33','2015-03-14'],
	['sex',1,'rgba(23,233,78,0.5)','2015-03-14'],
	['region',2,'red','2015-03-14'],
	['city',0,'hsl(0, 50%, 50%)','2015-03-14'],
	['cuntry',1,'red','2015-03-14'],
	['area',1,'red','2015-03-14'],
	['date',2,'red','2015-03-14']
];
*/

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

function getHEX(el,name){
	var rgbaStr = getComputedStyle(el)[name];
	return '#'+rgbaStr.split(/[(,)]/).splice(1,3).map(p=>(~~p)?(~~p).toString(16):'00').join('');
}

HTMLElement.prototype.index=function(){
	return Array.prototype.indexOf.call(this.parentNode.children,this);
}

HTMLElement.prototype.sindex=function(selector){
	return Array.prototype.indexOf.call(this.parentNode.querySelectorAll(selector),this);
}

var zjTable = (function(){
	var twObj={'int':70,'shortInt':40,'string':70,'color':70,'shortString':40,'date':120,'datetime':150,'list':120};
	function getNowString(ctime){
		var d = new Date;
		var str = [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
		return str+(ctime?' '+[d.getHours(),d.getMinutes(),d.getSeconds()].join(':'):'')
	}
	//template
	var selectTemplate = `
		<select>
			<%for(var i=0,l=data.length;i<l;i++){%>
				<option value="<%=i%>"<%=attr('selected',value===i)%>><%=data[i]%></option>
			<%}%>
		</select>
	`;
	//data,item,edit
	var rowDataTemplate = `
		<tr class="tbData<%=data.edit?" edit newRow":""%>">
			<td></td>
			<%if(data.edit){for(var value of item){switch(value.type){%>
				<%case 'color':%>
					<td><input type="color" value="<%=value.value%>" /></td>
				<%break;case 'date':%>
					<td><input type="text" readonly="readonly" class="Wdate" onClick="WdatePicker()" value="<%=value.value%>" /></td>
				<%break;case "list":%>
					<td><select>
						<%for(var i=0,l=value.value.length;i<l;i++){%>
							<option value="<%=i%>"><%=value.value[i]%></option>
						<%}%>
					</select></td>
				<%break;default:%><td><input type="text" value="<%=value.value%>" /></td><%break;%>
			<%}}}else{var fields=data.fields[data.fields.length-1];for(var i=0,l=item.length;i<l;i++){var field=fields[i];%>
				<%if(field.type==="list"){%>
					<td class="field" sindex="<%=item[i]%>"><%=field.data[item[i]]%></td>
				<%}else if(field.type==="color"){%>
					<td class="field"><span style="background-color:<%=item[i]%>"></span></td>
				<%}else{%><td class="field"><%=item[i]%></td> <%}%>
			<%}}%>
			<%if(data.operate){with(data.operate){%>
				<%if(add+update+drop>0){%>
					<td class="zjtable_opr_data">
						<%if(add){%> <i class="zjtable_row_add fa fa-plus" title="添加"></i> <%}%>
						<%if(update){%> 
							<%if(data.edit){%> <i class="zjtable_row_update fa fa-check" title="保存"></i> 
							<%}else{%> <i class="zjtable_row_update fa fa-pencil-square-o" title="修改"></i> <%}%>
						<%}%>
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
				<tr<%=attr("class",(jndex===data.fields.length-1)?"fields":"header")%>>
					<%if(jndex===0){%>
						<th type="index"<%=attr("rowspan",data.fields.length)%>>序号</th>
					<%}%>
					<%jtem.forEach(function(item){%>
						<th<%=attr("type",item.type)%><%=attr("rowspan",item.rowspan)%><%=attr("colspan",item.colspan)%>>
							<%=item.text%>
						</th>
					<%});%>
					<%if(jndex===0 && data.operate){with(data.operate){%>
						<%if(add+update+drop+up+down>0){%>
							<th<%=attr("colspan",~~!!(add+update+drop) + ~~!!(up+down)===2?2:0)%> rowspan="<%=data.fields.length%>">操作</th>
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
			this.queryData(function(info){
				if(!info.success) return;
				var data = info.data;
				var tData = JSON.parse(data.stct);
				var data = JSON.parse(data.data);
				self.tData = tData;
				self.tableData = {
					fields:tData,
					data:data,
					operate:{add:1,update:1,drop:1,up:1,down:1},
					tableWidth:self.getTableWidth()
				};
				self.show(self.data);
			});
		},
		queryData:function(callback){
			ajax({ type:'POST', url:this.opts.dataUrl, data:{pid:1}, success:callback });
		},
		show:function(){
			this.containerEl.innerHTML = headerFun(this.tableData);
		},
		getColData:function(tdEl){
			return this.tData[tdEl.index()];
		},
		getRowData:function(trEl){
			var tds = trEl.children;
			var tData = this.tData[this.tData.length-1];
			var arr = [],td,value;
			for(var i=0,l=tData.length;i<l;i++){
				td = tds[i+1];
				value = td.querySelector('input,select').value;
				switch(tData[i].type){
					case 'int':case'shortInt':case 'list':
						value = ~~value;
					default:
					break;
				}
				arr.push(value);
			}
			return arr;
		},
		getTableWidth:function(){
			var arr = this.tData[this.tData.length-1].map(p=>twObj[p.type]);
				arr.push(221);
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
				var target = e.target,clist=target.classList;
				function dis(){target.style.opacity=0.5;}
				if(clist.contains('zjtable_row_add')) {self.addNewRow(target);return;}
				if(clist.contains('zjtable_row_update')){self.modifyRow(target);return;}
				if(clist.contains('zjtable_row_delete')) {self.deleteRow(target);return;}
				if(clist.contains('zjtable_row_up')) {self.rangeRow(target,true);return;}
				if(clist.contains('zjtable_row_down')) {self.rangeRow(target);return;}
			});
		},
		getTargetTr:function(el){
			return el.closest(p=>p.tagName.toLowerCase()==='tr');
		},
		data_save:function(data,index){
			ajax({
				url:'/db/update',
				type:'post',
				data:{data:JSON.stringify(data),index:index,id:1},
				success:function(info){
					if(info.success) alert('成功！');
					else alert('失败！');
				}
			});
		},
		addNewRow:function(el){
			var trEl = this.getTargetTr(el);
			var temp = document.createElement('tbody');
			temp.innerHTML = rowFun({ tbData:this.tData, edit:true, operate:this.tableData.operate }, this.getEmptyTrData());
			if(trEl.nextElementSibling) trEl.parentElement.insertBefore(temp.firstChild,trEl.nextElementSibling);
			else trEl.parentElement.appendChild(temp.firstChild);
		},
		modifyRow:function(el){
			var trEl = this.getTargetTr(el);
			if(trEl.classList.contains('edit')){
				var subData=this.getRowData(trEl);
				var index = trEl.sindex('tr.tbData:not(.newRow)');
				this.data_save(subData,index);
				return;
			}
			trEl.classList.add('edit');
			el.classList.remove('fa-pencil-square-o');
			el.classList.add('fa-check');
			el.setAttribute('title','保存');
			var arr = this.tData[this.tData.length-1];
			for(var i=0,l=arr.length;i<l;i++){
				var item = arr[i];
				var td = trEl.children[i+1];
				switch(item.type){
					case 'list':
						td.innerHTML = selectFun(item.data,~~td.getAttribute('sindex'));
					break;
					case 'datetime':
					case 'date':
						td.innerHTML = `<input type="text" class="Wdate" readonly="readonly" onclick="WdatePicker()" value="${td.innerText}" >`;
					break;
					case 'color':
						var color = getHEX(td.querySelector('span'),'background-color');
						td.innerHTML = `<input type="color" value="${color}">`;
					break;
					default:
						td.innerHTML = `<input type="text" value="${td.innerText}">`;
					break;
				}
			}
		},
		deleteRow:function(el){
			var trEl = this.getTargetTr(el);
			trEl.classList.add('deleted');
			setTimeout(function(){ trEl.parentElement.removeChild(trEl); },500);
		},
		rangeRow:function(el,isup){
			var trEl = this.getTargetTr(el);
			if(trEl.classList.contains('edit')) return;
			var index = trEl.sindex('tr.tbData');
			if(index===0 && isup || !trEl.nextElementSibling && !isup) return;
			var data = this.tableData.data;
			data.splice(index+(isup?-1:1),0,data.splice(index,1)[0]);
			this.show();
		}
	}
	return table;
})();

