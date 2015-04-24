var express=require('express');
var app=express();
var bodyParser = require('body-parser');

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
	});
});

app.post('/article/add',function(req,res){
	var Q = require('./server/do');
	var cid = req.body.cid;
	var title = req.body.title;
	var content = req.body.content;
	if(!cid || !title || !content) {
		res.json({'success':false,'message':'参数不足'});
		return;
	}
	Q.addArticle(cid,title,content,function(success,data){
		res.json({'success':success,'data':data});
	});
});

app.post('/article/save',function(req,res){
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

app.listen(4000);
