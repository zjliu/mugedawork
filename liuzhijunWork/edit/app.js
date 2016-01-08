var express=require('express');
var app=express();
var jwt = require('jwt-simple');
var moment = require('moment');

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.set('jwtTokenSecret', 'liuzhijunToken9527@beijing');

app.use(bodyParser());

app.use(express.static(__dirname + '/app'));

app.param(function(name, fn){
	if (fn instanceof RegExp) {
		return function(req, res, next, val){
			var captures;
			if (captures = fn.exec(String(val))) {
				req.params[name] = captures;
				next();
			} else {
				next('route');
			}
		}
	}
});

function checkToken(req){
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	if(!token) return;
	try{
		var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
		if (decoded.exp <= Date.now()) {
			return false;
		}
		return decoded;
	}
	catch(err){
		return;
	}
}

function createToken(data){
	if(!data || !data.length) return;
	var user = data[0];
	var expires = moment().add(7,'days').valueOf();
	var token = jwt.encode({ iss: user.uid,exp: expires}, app.get('jwtTokenSecret'));
	return token;
}

var tokenError = {'success':false,'message':'access_token error or expired!'};

app.post('/login',function(req,res){
	var name = req.body.name;
	var pwd = req.body.pwd;
	var Q = require('./server/do');
	Q.login(name,pwd,function(data){
		var result = {'success':!!data.length,'token':createToken(data)};
		res.json(result);
	});
});

app.get('/categoryList',function(req,res){
	var Q = require('./server/do');
	Q.getCategoryList(function(data){
		res.json(data);
	});
});

app.get('/category',function(req,res){
	var Q = require('./server/do');
	Q.getArticleList(function(data){
		res.json(data);
	});
});

app.param('aid',/^\d+$/);
app.get('/article/:aid',function(req,res){
	var Q = require('./server/do');
	Q.getArticle(req.params.aid,function(data){
		res.json(data);
	},req.query,res);
});

app.post('/article/add',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var cid = req.body.cid;
	var title = req.body.title;
	var content = req.body.content;
	if(!cid || !title || !content) {
		res.json({'success':false,'message':'参数不足'});
		return;
	}
	var uid = tokenObj.iss;
	Q.addArticle(uid,req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/article/save',function(req,res){
	if(!checkToken(req)){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var aid = req.body.aid;
	var title = req.body.title;
	var content = req.body.content;
	if(!aid) {
		res.json({'success':false,'message':'参数aid不足'});
		return;
	}
	if(!title && !content){
		res.json({'success':false,'message':'参数title及content至少有一个'});
		return;
	}
	Q.saveArticle(aid,title,content,function(success){
		res.json({'success':success});
	});
});

app.get('/article/delete',function(req,res){
	if(!checkToken(req)){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var aid = req.query.aid;
	if(!aid){
		res.json({'success':false,'message':'参数aid不足'});
		return;
	}
	Q.deleteArticle(aid,function(success){
		res.json({'success':success});
	});
});

app.post('/pen/add',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var uid = tokenObj.iss;
	Q.addPen(uid,req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/pen/update',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var uid = tokenObj.iss;
	Q.updatePen(uid,req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/pen/delete',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var uid = tokenObj.iss;
	Q.deletePen(uid,req.body.pid,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.get('/pen/list',function(req,res){
	var tokenObj = checkToken(req);
	if(!tokenObj){
		res.json(tokenError);
		return;
	}
	var Q = require('./server/do');
	var uid = tokenObj.iss;
	Q.getPenList(uid,function(data){
		res.json(data);
	});
});

app.param('pid',/^\d+$/);
app.get('/pen/:pid',function(req,res){
	var Q = require('./server/do');
	var pid = req.params.pid;
	Q.getPen(pid,res,req.query);
});

app.post('/cat/add',function(req,res){
	var Q = require('./server/do');
	Q.addCategory(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/cat/delete',function(req,res){
	var Q = require('./server/do');
	Q.deleteCategory(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/get',function(req,res){
	var Q = require('./server/do');
	Q.getDBTable(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/getStct',(req,res)=>{
	var Q = require('./server/do');
	Q.getDBTableStct(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/getId',function(req,res){
	var Q = require('./server/do');
	Q.getDBTableByName(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/add',function(req,res){
	var Q = require('./server/do');
	Q.createDBTable(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/update',function(req,res){
	var Q = require('./server/do');
	Q.updateDBTable(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/updateTb',function(req,res){
	var Q = require('./server/do');
	Q.updateDBTableAll(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/delete',function(req,res){
	var Q = require('./server/do');
	Q.dropDBTable(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/db/tblist',function(req,res){
	var Q = require('./server/do');
	Q.queryTableList(req.body,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.listen(4000);
