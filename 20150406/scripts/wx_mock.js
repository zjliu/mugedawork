var wx={};
var wxMockManager={};

wxMockManager.config=function(callName,options){
	this[callback]=options;
}

//通过config接口注入权限验证配置
wx.config=function(options){ 
}
wxMockManager.config=function(){ 
	
}

//通过ready接口处理成功验证
wx.ready=function(callback){ 
}

//判断当前客户端版本是否支持指定JS接口
wx.checkJsApi=function(options){

}
wxMockManager.

//拍照或从手机相册中选图接口
wx.chooseImage=function(options){ 

}

//上传图片接口
wx.uploadImage=function(options){

}

//下载图片接口
wx.downloadImage=function(){ 

}

//开始录音接口
wx.startRecord=function(){

}

//停止录音接口
wx.stopRecord=function(options){

}

//监听录音自动停止接口
wx.onVoiceRecordEnd=function(options){

}

//播放语音接口
wx.playVoice=function(options){

}

//暂停播放接口
wx.pauseVoice=function(options){

}

//停止播放接口
wx.stopVoice=function(options){

}

//监听语音播放完毕接口
wx.onVoicePlayEnd=function(options){

}

//上传语音接口
wx.uploadVoice=function(options){

}

//下载语音接口
wx.downloadVoice=function(options){

}

