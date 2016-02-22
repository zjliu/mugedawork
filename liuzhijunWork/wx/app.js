var express=require('express');
var app=express();
var router = express.Router();
var jsSHA = require("jssha");
var nodegrass = require('nodegrass');
var formidable = require("formidable");

app.use(express.static(__dirname + '/app'));

router.get('/', function(req, res) { res.render('index', { title: '' }); });

function getSignature(appid,secret,url,callback){
    function calcSignature(ticket, noncestr, ts) {
		var str = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${ts}&url=${url}`;
        var shaObj = new jsSHA("SHA-1", 'TEXT');
			shaObj.update(str);
        return shaObj.getHash('HEX');
    }
    function createNonceStr() {
          return Math.random().toString(36).substr(2, 15);
    }
    function createTimeStamp() {
          return parseInt(new Date().getTime() / 1000) + '';
    }
    var accUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
    nodegrass.get(accUrl,function(data,status){
		if(!status===200){ callback(false); return; }
		var obj = JSON.parse(data);
        var ticket_url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${obj.access_token}&type=jsapi`;
        nodegrass.get(ticket_url,function(data,status){
			if(!status===200){ callback(false); return; }
			var ticketObj = JSON.parse(data);
			var reObj = {appId:appid,nonceStr:createNonceStr(),timestamp:createTimeStamp()};
				reObj.signature=calcSignature(ticketObj.ticket,reObj.nonceStr,reObj.timestamp);
			callback(reObj);
        });
    });
}

app.get('/querySignture',function(req,res){ 
	var appid = 'wx501b4f006c6939be';
	var secret = 'ba7448218aef98f28f1b95e13374358d';
	var url = req.query.url;
	getSignature(appid,secret,url,function(signObj){
		res.json(signObj);
	});
});

app.post('/photos/upload',function(res,req){
	var form = new formidable.IncomingForm();   //创建上传表单
		form.encoding = 'utf-8';				//设置编辑
		form.uploadDir = 'uploads/';			//设置上传目录
		form.keepExtensions = true;				//保留后缀
		form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
	
	  form.parse(req, function(error, fields, files) {
		if (error)  return;		
		/*
		var extName = '';  //后缀名
		console.log(err,fields,files);
		switch (files.fulAvatar.type) {
			case 'image/pjpeg': extName = 'jpg'; break;
			case 'image/jpeg': extName = 'jpg'; break;		 
			case 'image/png': extName = 'png'; break;
			case 'image/x-png': extName = 'png'; break;		 
		}
		if(extName.length == 0){ res.locals.error = '只支持png和jpg格式图片'; res.render('index', { title: "" }); return;}
		var avatarName = Math.random() + '.' + extName;
		var newPath = form.uploadDir + avatarName;
		fs.renameSync(files.fulAvatar.path, newPath);  //重命名
		*/
		var types       = files.upload.name.split('.');
		var date        = new Date();
		var ms          = Date.parse(date);
		console.log(4);
		fs.renameSync(files.upload.path,"uploads/"+ ms +"."+String(types[types.length-1]));
		console.log(5);
	  });
});

app.listen(4000);
