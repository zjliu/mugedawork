var express=require('express');
var app=express();
var jsSHA = require("jssha");
var nodegrass = require('nodegrass');
function getSignature(appid,secret,callback){
    function calcSignature(ticket, noncestr, ts) {
        var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ ts;
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
	getSignature(appid,secret,function(signObj){
		res.json(signObj);
	});
});

app.listen(4000);
