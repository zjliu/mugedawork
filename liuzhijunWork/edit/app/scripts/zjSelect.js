!function(){
	"use strict";
	var zjSelectPro=Object.create(HTMLDivElement.prototype);
	var selectTemplate = `
		<div>
			<span></span><a></a>
			<select id="<%=data.id%>">
				<%data.data.forEach(obj=>{%>
					<option<%=attr('selected',obj.checked && "selected"||"")%> 
						value="<%=unescape(obj.value)%>"><%=unescape(obj.key)%></option>
				<%});%>
			</select>
		</div>
	`;
	var selectFun = template(selectTemplate);
	zjSelectPro.setSize = function(){
		var root = this.shadowRoot;
		var width = this.getAttribute('width');
		var height = this.getAttribute('height');
		var reg = /^\d+(\.\d+)?(px)?$/;
		reg.test(width) && (root.querySelector('div').style.width=parseFloat(width)+"px");
		reg.test(height) && (root.querySelector('div').style.height=parseFloat(height)+"px");
	}
	zjSelectPro.createdCallback=function(){
		let root = this.createShadowRoot();
		let url = this.getAttribute('x_get_url');
		var opt = {
			type:'post',
			url:this.getAttribute('x_get_url'),
			data:{name:this.getAttribute('x_tb_name'),where:this.getAttribute('x_tb_where')}
		};
		ajax(opt).then(data=>{
			if(!data.success) return;
			root.innerHTML= selectFun({data:data.data,id:"abc"});
			var selectEl = root.querySelector('select');
			var self = this;
			selectEl.onchange=function(e){
				root.querySelector('a').innerText = this.selectedOptions[0].innerText; 
				self.value = this.value;
				if(self.onchange) self.onchange(e);
			}
			selectEl.onchange();
			this.setSize();
		});
	}
	zjSelectPro.attributeChangedCallback=function(attrName, oldVal, newVal){
		if(attrName==='width' || attrName==='height') this.setSize();
	}
	var zjSelect=document.registerElement('x-zjselect',{prototype:zjSelectPro});
	window.HTMLZJSelectElement = zjSelect;
}();
