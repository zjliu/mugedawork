
function ajax(opt){
	return new Promise(function(resolve,reject){
		var isPost = opt.type.toLowerCase()==='post';
			opt.data._=+new Date;
		var paramStr = ''; for(var key in opt.data) paramStr=[paramStr,'&',key,'=',opt.data[key]].join('');
		var xhr = new XMLHttpRequest();
		xhr.onload=()=>xhr.status===200 && resolve(JSON.parse(xhr.responseText));
		xhr.onerror=()=>reject(xhr.responseText);
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
	});
}

function eachList(dom,selector,callback){
	if(!callback) return;
	Array.prototype.forEach.call(dom.querySelectorAll(selector),callback);
}

function getHEX(el,name){
	var rgbaStr = getComputedStyle(el)[name];
	return '#'+rgbaStr.split(/[(,)]/).splice(1,3).map(function(p){var c=(~~p).toString(16); return c.length===1?'0'+c:c;}).join('');
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
		<tr class="tbData<%=data.edit?" edit newRow":""%>"<%=attr("tableId",!data.edit && 1)%>>
			<td></td>
			<%if(data.edit){for(var value of item){switch(value.type){%>
				<%case 'color':%>
					<td class="field"><input type="color" value="<%=value.value%>" /></td>
				<%break;case 'date':%>
					<td class="field"><input type="text" readonly="readonly" class="Wdate" onClick="WdatePicker()" value="<%=value.value%>"/></td>
				<%break;case "list":%>
					<td class="field"><select>
						<%for(var i=0,l=value.value.length;i<l;i++){%>
							<option value="<%=i%>"><%=value.value[i]%></option>
						<%}%>
					</select></td>
				<%break;default:%><td class="field"><input type="text" value="<%=value.value%>" /></td><%break;%>
			<%}}}else{var fields=data.fields[data.fields.length-1];for(var i=0,l=item.length;i<l;i++){var field=fields[i];%>
				<%if(field.type==="list"){%>
					<td class="field" sindex="<%=item[i]%>"><%=field.data[item[i]]%></td>
				<%}else if(field.type==="color"){%>
					<td class="field"><span style="background-color:<%=item[i]%>"></span></td>
				<%}else{%><td class="field"><%=unescape(item[i])%></td> <%}%>
			<%}}%>
			<%if(data.operate){with(data.operate){%>
				<%if(add+update+drop>0){%>
					<td class="zjtable_opr_data ow<%=add+update+drop%>">
						<%if(add){%> <i class="zjtable_row_add fa fa-plus" title="添加"></i> <%}%>
						<%if(update){%> 
							<%if(data.edit){%> <i class="zjtable_row_update fa fa-check" title="保存"></i> 
							<%}else{%> <i class="zjtable_row_update fa fa-pencil-square-o" title="修改"></i> <%}%>
						<%}%>
						<%if(drop){%> <i class="zjtable_row_delete fa fa-times" title="删除"></i> <%}%>
					</td>
				<%}%>
				<%if(up+down>0){%>
					<td class="zjtable_opr_move ow<%=up+down%>">
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
							<%=unescape(item.text)%>
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
			<%if(data.operate){with(data.operate){if(add+update+drop+up+down>0){%>
				<tr class="tipTr">
					<td class="zjtable_tip_tr" colspan="<%=data.fields[data.fields.length-1].length+1%>"></td>
					<td colspan="2" class="zjtable_opr_all">
						<i class="zjtable_row_update fa fa-pencil-square-o update_all" title="修改全部"></i>
						<i class="zjtable_row_update fa fa-check save_all" title="保存全部"></i>
						<i class="zjtable_row_delete fa fa-times delete_all" title="清空数据"></i>
					</td>
				</tr>
			<%}}}%>
		</table>
	`;
	var selectFun = template(selectTemplate,'data,value');
	var headerFun = template(headerTemptStr);
	var rowFun = template(rowDataTemplate,'data,item');
	var options = {
		container:null,
		queryUrl:'/db/get',
		updateUrl:'/db/update',
		showops:true,
		tableId:null
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
				var operation = JSON.parse(data.operation);
				var data = JSON.parse(data.data||'[]');
				self.operation = operation;
				self.tData = tData;
				if(!data || !data.length) data = [self.getEmptyTrData().map(p=>p.type==="list"?0:p.value)];
				self.tableData = { fields:tData, data:data, operate:operation, tableWidth:self.getTableWidth() };
				self.show(self.data);
				if(!info.success){ self.showTip('数据请求失败！'); return; }
				else self.showTip('数据请求成功！'); 
			});
		},
		queryData:function(callback){
			var data = {pid:this.opts["tableId"]};
			ajax({type:'POST',url:this.opts.queryUrl,data:data}).then(callback);
		},
		showTip:function(tip){
			var tipEl = this.containerEl.querySelector('.zjtable_tip_tr');
			if(!tipEl) return;
			tipEl.innerText =  tip;
			setTimeout(function(){ tipEl.innerText = ''; },1000);
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
					break;
					default:
						value = escape(value);
					break;
				}
				arr.push(value);
			}
			return arr;
		},
		getTableWidth:function(){
			var arr = this.tData[this.tData.length-1].map(p=>twObj[p.type]);
			var optW = 41; //顺号宽
			with(this.operation){
				switch(add+update+drop){ case 3: optW+=100; break; case 2: optW+=80; break; case 1: optW+=60; break; }
				switch(up+down){ case 2: optW+=80; break; case 1: optW+=60; break; }
			}
			arr.push(optW);
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
					case 'color': obj.value = '#000000'; break;
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
			this.containerEl.addEventListener('click',(e)=>{
				var target = e.target,clist=target.classList;
				if(clist.contains('update_all')) {this.update_all();return;}
				if(clist.contains('save_all')) {this.save_all();return;}
				if(clist.contains('delete_all')) {this.delete_all();return;}
				var trEl = this.getTargetTr(target);
				if(clist.contains('zjtable_row_add')) {this.addNewRow(trEl);return;}
				if(clist.contains('zjtable_row_update')){this.modifyRow(trEl);return;}
				if(clist.contains('zjtable_row_delete')) {this.deleteRow(trEl);return;}
				if(clist.contains('zjtable_row_up')) {this.rangeRow(trEl,true);return;}
				if(clist.contains('zjtable_row_down')) {this.rangeRow(trEl);return;}
			});
			this.containerEl.addEventListener('dblclick',(e)=>{
				var tr = this.getTargetTr(e.target);
				tr && !tr.classList.contains('edit') && this.modifyRow(tr);
			});
		},
		getTargetTr:function(el){
			return el.closest(p=>p.tagName.toLowerCase()==='tr');
		},
		getQueryData:function(data,type,index){
			return {data:data,type:type,index:index,id:this.opts["tableId"]};
		},
		data_save:function(data,index,isNew,callback){
			var self = this;
			var promise = ajax({
				url:self.opts.updateUrl,
				type:'POST',
				data:self.getQueryData(JSON.stringify(data),isNew?"add":"update",index)
			});
			promise.then(function(info){
				self.showTip(`数据${isNew?"添加":"更新"}${info.success?"成功":"失败"}`);
				if(info.success && callback) callback();
			});
		},
		addNewRow:function(trEl){
			var temp = document.createElement('tbody');
			temp.innerHTML = rowFun({ tbData:this.tData, edit:true, operate:this.tableData.operate }, this.getEmptyTrData());
			if(trEl.nextElementSibling) trEl.parentElement.insertBefore(temp.firstChild,trEl.nextElementSibling);
			else trEl.parentElement.appendChild(temp.firstChild);
		},
		modifyRow:function(trEl,genObj){
			var promise = new Promise((resolve,reject)=>{
				var arr = this.tData[this.tData.length-1];
				var el = trEl.querySelector('.zjtable_row_update');
				if(trEl.classList.contains('edit')){
					var subData=this.getRowData(trEl);
					var index = trEl.sindex('tr.tbData');
					var isNew = trEl.classList.contains('newRow');
					this.data_save(subData,index,isNew,function(){
						var tds = trEl.querySelectorAll('.field');
						for(var i=0,l=arr.length;i<l;i++){
							var td = tds[i],value = td.querySelector('input,select').value;
							if(arr[i].type==='color') td.innerHTML = `<span style="background-color:${value}"></span>`;
							else if(arr[i].type==='list') td.innerText = arr[i].data[~~value];
							else td.innerText = value;
						}
						trEl.classList.remove('edit');
						trEl.classList.remove('newRow');
						el.classList.remove('fa-check');
						el.classList.add('fa-pencil-square-o');
						resolve();
					});
					return;
				}
				trEl.classList.add('edit');
				el.classList.remove('fa-pencil-square-o');
				el.classList.add('fa-check');
				el.setAttribute('title','保存');
				for(var i=0,l=arr.length;i<l;i++){
					var item = arr[i];
					var td = trEl.children[i+1];
					switch(item.type){
						case 'list':
							td.innerHTML=selectFun(item.data,~~td.getAttribute('sindex'));
						break;
						case 'datetime':
						case 'date':
							td.innerHTML=`<input type="text" class="Wdate" readonly="readonly" onclick="WdatePicker()" value="${td.innerText}" >`;
						break;
						case 'color':
							var color = getHEX(td.querySelector('span'),'background-color');
							td.innerHTML=`<input type="color" value="${color}">`;
						break;
						default:
							td.innerHTML=`<input type="text" value="${td.innerText}">`;
						break;
					}
				}
			});
			genObj && promise.then(()=>genObj.next());
			return promise;
		},
		deleteRow:function(trEl,genObj){
			var promise = new Promise((resolve,reject)=>{
				if(trEl.parentNode.querySelectorAll('tr.tbData').length===1){ this.showTip('最后一行不能删除'); return; }
				var isNew = trEl.classList.contains('newRow');
				if(isNew) { this.removeTr(trEl);return; }
				var index = trEl.sindex('tr.tbData');
				var promise = ajax({
					url:this.opts.updateUrl,
					type:'POST',
					data:this.getQueryData([],'delete',index)
				});
				promise.then(info=>{
					if(info.success) this.removeTr(trEl);
					this.showTip(`删除${info.success?"成功":"失败"}！`);
					resolve();
				});
			});
			genObj && promise.then(()=>genObj.next());
			return promise;
		},
		removeTr:function(trEl){
			trEl.classList.add('deleted');
			trEl.parentElement.removeChild(trEl);
		},
		rangeRow:function(trEl,isup){
			if(trEl.classList.contains('edit')) return;
			var index = trEl.sindex('tr.tbData');
			if(index===0 && isup || !trEl.nextElementSibling.classList.contains('tbData') && !isup) return;
			var queryData = this.getQueryData([],'exchange',index); queryData.isup = ~~isup;
			var promise = ajax({ url:this.opts.updateUrl, type:'POST', data:queryData });
			promise.then(info=>{
				this.showTip(`排序${info.success?"成功":"失败"}！`);
				if(!info.success) return;
				var cpTr = trEl.cloneNode(true);
				var tbody=trEl.parentNode,preEl = trEl.previousElementSibling,nextEl=trEl.nextElementSibling;
				if(!trEl.parentNode) return;
				trEl.parentNode.removeChild(trEl);
				if(isup) { tbody.insertBefore(cpTr,preEl); return;}
				if(nextEl.nextElementSibling) tbody.insertBefore(cpTr,nextEl.nextElementSibling);
				else tbody.appendChild(cpTr);
			});
		},
		update_all:function(trEl){
			eachList(this.containerEl,'.tbData .fa-pencil-square-o',(el,index)=>this.modifyRow(this.getTargetTr(el)));
		},
		save_all:function(trEl){
			"use strict";
			var self = this;
			var genObj;
			function* iterTree(arr){
				for(let i=0,l=arr.length;i<l;i++) yield self.modifyRow(self.getTargetTr(arr[i]),genObj);
			}
			genObj=iterTree(this.containerEl.querySelectorAll('.tbData .fa-check'));
			genObj.next();
		},
		delete_all:function(trEl){
			"use strict";
			var self = this;
			var genObj;
			function* iterTree(arr){
				for(let i=0,l=arr.length;i<l;i++) yield self.deleteRow(self.getTargetTr(arr[i]),genObj);
			}
			genObj=iterTree(this.containerEl.querySelectorAll('.tbData .zjtable_row_delete'));
			genObj.next();
		}
	}
	return table;
})();

