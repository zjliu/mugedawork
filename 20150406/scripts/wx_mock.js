!function(win){

	var wx={};
	var wxMockManager={};

	//成功标志
	var success = 'success';
	//失败标志
	var fail = 'fail'; 
	//完成标志
	var complete = 'complete';
	//取消标志
	var cancel = 'cancel';
	//配置前缀
	var prefix = '_';

	win.wx=wx;
	win.wxMockManager = wxMockManager;


	function callResult(options,callName){ 
		var resultData = wxMockManager[prefix+callName];
		options = options || {};
		resultData = resultData || {};

		resultData.result = resultData.result || success;	//默认执行成功方法
		var result = resultData.result;
		var data = resultData.data;
		var successCallback = options.success || resultData.success;
		var failCallback = options.error || resultData.error;
		var completeCallback = options.complete || resultData.complete;
		var cancelCallback = options.cancel || resultData.cancel;
		if(result===success && successCallback) successCallback(data);
		if(result===fail && failCallback) failCallback(data); 
		if(result===complete && completeCallback) completeCallback(data);
		if(result===cancel && cancelCallback) cancelCallback(data);
	}

	wxMockManager.config=function(callName,options){
		this[prefix+callName] = options;
	}

	//通过config接口注入权限验证配置
	wx.config=function(options){
		var resultData = wxMockManager[prefix+'config']; 
		resultData = resultData || {};
		resultData.result = resultData.result || success;
		if(resultData.result===success && wxMockManager._ready) wxMockManager._ready();
		if(resultData.result===fail && wxMockManager._error) wxMockManager._error();
	}

	//通过ready接口处理成功验证
	wx.ready=function(callback){ 
		if(callback) wxMockManager._ready=callback;
	}

	//通过error接口处理失败验证
	wx.error=function(callback){ 
		if(callback) wxMockManager._error=callback;
	}

	wxMockManager.fireMenuShare=function(type){ 
		var mType = getShareType(type);
		if(!mType) return;
		var callbackName = 'onMenuShare'+mType;
		wx[callbackName] && wx[callbackName]({});
	}

	function getShareType(type){ 
		if((/Timeline/i).test(type)) return 'Timeline';
		if((/AppMessage/i).test(type)) return 'AppMessage';
		if((/QQ/i).test(type)) return 'QQ';
		if((/Weibo/i).test(type)) return 'Weibo';
	}

	//需要有回调的方法
	var callbackMethods = [
		'checkJsApi',				//判断当前客户端版本是否支持指定JS接口
		'chooseImage',				//拍照或从手机相册中选图接口
		'uploadImage',				//上传图片接口
		'downloadImage',			//下载图片接口
		'stopRecord',				//停止录音接口
		'onVoiceRecordEnd',			//监听录音自动停止接口
		'onVoicePlayEnd',			//监听语音播放完毕接口
		'uploadVoice',				//上传语音接口
		'downloadVoice',			//下载语音接口
		'onMenuShareTimeline',		//分享到朋友圈
		'onMenuShareAppMessage',	//分享给朋友
		'onMenuShareQQ',			//分享到QQ
		'onMenuShareWeibo'			//分享到腾讯微博
	];

	callbackMethods.forEach(function(item){ 
		wx[item] = function (options){ 
			callResult(options,item);
		}
	});

	var noneCallbackMethods = [ 
		'startRecord',	//开始录音接口	
		'playVoice',	//播放语音接口
		'pauseVoice',	//暂停播放接口	
		'stopVoice'		//停止播放接口
	];

	noneCallbackMethods.forEach(function(item){ 
		wx[item] = function(options){}
	})

}(window);