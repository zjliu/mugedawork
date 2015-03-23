//通用手机定制事件
var EventObj = (function(win){ 
	var EventFun = function(){ 
		this.isMobile = 'ontouchstart' in win;
		this.Start = this.isMobile ? "touchstart" : "mousedown",
		this.Move = this.isMobile ? "touchmove" : "mousemove",
    	this.End = this.isMobile ? "touchend" : "mouseup";
	}
   	EventFun.prototype = { 
   		addEvent:function(a,b,c){ 
   			c || (c = "load"); 
    		b || (b = win); 
    		b.attachEvent ? b.attachEvent("on" + c, a) : b.addEventListener(c, a, false) 
   		},
   		tapClick:function(callback,dom){ 
   			var self = this;
   			var startPoint = {};
   			this.addEvent(function(e){ 
   				var point = self.isMobile ? e.touches[0] : e;
				self.startPonter = {x:point.pageX,y:point.pageY};
   			},dom,this.Start);
   			this.addEvent(function(e){ 
				e.preventDefault();
	    		e.stopPropagation();
				if(!self.startPonter) return;
				var point = self.isMobile ? e.changedTouches[0] : e;
				if(self.startPonter.x!=point.pageX && self.startPonter.y!=point.pageY) return;
				self.startPonter = null;
				callback(dom,e);
   			},dom,this.End);
   		}
   	}
   	return new EventFun();
})(window);

!function(){

	window.getSectionCount=function(){ 
		var items = document.querySelectorAll('section[data-id]');
		return items.length;
	}

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
				//url:'http://weika.mugeda.com/server/cards.php/user/data/list',
				type:'get',
				data:{'pageIndex':pageIndex,'crid':'55010063a3664efa7a000091'}
			}
		},
		//处理数据回调方法
		dealAjaxData_callback:function(data){
			var mdata = JSON.parse(JSON.stringify(data.records));
			for(var i=0,l=mdata.length;i<l;i++){ 
				var item = mdata[i];
				var tdata = item.data;
				try{
					item.data = JSON.parse(tdata.replace(/&quot;/g,'"'));
				}
				catch(e){ 
					console.log('data-error',tdata);
				}
				if(item.data && item.data.voice) item.data = item.data.voice;
			}
			return mdata;
		},
		fillDataCompleteCallback:function(data){ 
			var count = data.length || 0;
			var msgCountEl = document.getElementById('msgCount');
			var sumCount = parseInt(msgCountEl.innerText);
			msgCountEl.innerText = sumCount - count;
		},
		frameData:function(){ 
			return { 
				"url":"http://www.baidu.com",	//返回首页url
				"msgCount": 350				    //新信息数量
			}
		}
	});

	//播放声音事件
	EventObj.tapClick(function(dom,e){ 
		var el = e.target;
		if(el.tagName.toLowerCase()==="img"){ 
			el = el.parentNode;
		}
		var url = el.getAttribute('data-url');
		if(url){ 
			//播放声音代码放这
			alert(url);
		}
	},document.getElementById('container'));

}();