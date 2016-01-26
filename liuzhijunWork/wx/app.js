var express=require('express');
var app=express();
var jsSHA = require("jssha");
var nodegrass = require('nodegrass');
function getSignature(appid,secret,url,callback){
    function calcSignature(ticket, noncestr, ts, url) {
        var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts +'&url=' + url;
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
			var reObj = {appId:appid,nonceStr:createNonceStr(),timestamp:createTimeStamp(),url:url};
				reObj.signature=calcSignature(ticketObj.ticket,reObj.nonceStr,reObj.timestamp,url);
			callback(reObj);
        });
    });
}

app.post('/querySignture',function(req,res){ 
	var appid = 'wx501b4f006c6939be';
	var secret = 'ba7448218aef98f28f1b95e13374358d';
	var url = req.body.url;
	getSignature(appid,secret,url,function(signObj){
		res.json(signObj);
	});
});

app.listen(4000);
