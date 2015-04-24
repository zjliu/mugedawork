var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./server/db.sqlite3');

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

function getArticle(aid,callback){ 
	var sql = 'select title,content,cid from article where aid='+aid;
	query(sql,function(data){
		data && data.length && callback && callback(data[0]);
	});
}

function addArticle(cid,title,content,callback){
	var sql = "insert into article(cid,title,content,cdate,udate) values("
	+cid+",'"+title+"','"+content+"',datetime('now'),datetime('now'))";
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
	var contentSql = !!content?"content='"+content+"'":"";
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

