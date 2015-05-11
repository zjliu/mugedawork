var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./server/db.sqlite3');

var userType={
	'admin':0,
	'user':1
}

var articleType={
	'public':0,
	'private':1,
	'website':2
}

function doLogin(name,pwd,callback){
	var crypto = require('crypto');
	var md5 = crypto.createHash('md5');
	md5.update(pwd);
	pwd = md5.digest('hex');
	var sql = "select uid from user where name='"+name+"' and pwd='"+pwd+"'";
	query(sql,function(data){
		callback && callback(data);
	});
}

function getCategoryList(callback){
	var sql = 'select cid,text from cat';
	query(sql,function(data){
		callback && callback(data);
	});
}

function getArticleList(callback){
	var sql = 'select c.cid,c.text cname,a.aid,a.title from article a,cat c where a.cid = c.cid';
	query(sql,function(data){
		callback && callback(data);
	});
}

function getArticle(aid,callback,queryObj,res){ 
	var sql = 'select title,content,cid from article where aid='+aid;
	var type = queryObj.type;
	var min = queryObj.min === "true";
	query(sql,function(data){
		if(type && data && data.length){
			var contentValue = '';
			var value = unescape(data[0].content);
			switch(type){
				case 'js':
					contentValue = "application/x-javascript";
					if(min){
						try{
							var UglifyJS = require("uglify-js");
							var result = UglifyJS.minify(value, {fromString: true});
							value = result.code;
						}catch(e){
							console.log(e.message);
						}
					}
				break;
				case 'css':
					contentValue = 'text/css';
					if(min){
						try{
							var uglifycss = require('uglifycss');
							value = uglifycss.processString(value);
						}catch(e){
							console.log(e.message);
						}
					}
				break;
				case 'html':
					contentValue =  'text/html';
				break;
			}
			if(contentValue){
				res.writeHead(200,{"Content-Type":	contentValue});
				res.write(value);
				res.end();
			}
		}
		else{
			data && data.length && callback && callback(data[0]);
		}
	});
}

function addArticle(cid,uid,title,content,callback){
	var sql = "insert into article(cid,uid,title,content,cdate,udate) values("
	+cid+","+uid+",'"+title+"','"+escape(content)+"',datetime('now'),datetime('now'))";
	exec(sql,function(error){
		if(!callback) return;
		if(error===null){
			var sql = "select max(aid) aid from article";
			query(sql,function(data){
				data && data.length && callback(true,data[0]);
			});
		}
		else{
			callback(false);
		}
	});
}

function saveArticle(aid,title,content,callback){
	var titleSql = !!title?"title='"+title+"'":"";
	var splitStr = title && content ? ',' : '';
	var contentSql = !!content?"content='"+escape(content)+"'":"";
	var sql = 'update article set '+titleSql+splitStr+contentSql+' where aid='+aid;
	exec(sql,function(error){
		callback && callback(error===null);
	});
}

function deleteArticle(aid,callback){ 
	var sql = 'delete from article where aid='+aid;
	exec(sql,function(error){
		callback && callback(error===null);
	});
}

function query(sql,callback){
	db.serialize(function(){
		db.all(sql,function(err,rows){
			callback && callback(rows);
		});
	});
}

function exec(sql,callback){
	db.serialize(function(){
		db.exec(sql,function(err,data){
			callback && callback(err,data);
		});
	});
}

exports.getCategoryList = getCategoryList;
exports.getArticleList = getArticleList;
exports.getArticle = getArticle;
exports.addArticle = addArticle;
exports.saveArticle = saveArticle;
exports.deleteArticle = deleteArticle;
exports.login = doLogin;

