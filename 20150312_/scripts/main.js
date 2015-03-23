
!function(){
	var box=new messageBox({ 
		//父容器
		container:document.body,
		//滚动容器选择器
		rollContainerSelector:'.container',
		//内容器（frame）模板Id
		boxTemplateId:'box_template',
		//子填充项（section）模板Id
		itemTemplateId:'section_item',
		//加载图标模板Id
		loadingTemplateId:'loading_template',
		//加载容器选择器
		loadingContainerSelector:'.loading_section',
		//ajax请求方式
		ajaxType:'post',
		//加载的图标
		loading_img_url:'images/list_loading.gif',
		//加载图标字段
		loadingField:'loading_img_url',
		//获取数据接口，由外部回调提供
		data_url_callback:function(pageIndex){
			//url  请求url
			//type 请求类型 /^(post|get)$/
			//data 参数
			return { 
				url:'scripts/data.json',
				type:'get',
				data:{'pageIndex':pageIndex}
			}
		},
		//处理数据回调方法
		dealAjaxData_callback:function(data){
			return data.datas; 
		},
		fillDataCompleteCallback:function(data){ 
			var count = data.length || 0;
			var msgCountEl = document.getElementById('msgCount');
			var sumCount = parseInt(msgCountEl.innerText);
			msgCountEl.innerText = sumCount - count;
		}
	});
}();