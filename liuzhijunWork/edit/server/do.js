var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('./server/db.sqlite3');

var userType={
	'admin':0,
	'user':1
}

var catType={
	'public':0,
	'private':1
}

var articleType={
	'public':0,
	'private':1,
	'website':2
}

function getInsertSql(table,obj,fileds){
	var sql = "insert into "+table+"("+Object.keys(fileds)+") values(";
	var values = [];
	for(var key in fileds){
		var value = obj[key]===undefined ? 'null' : obj[key];
		values.push(fileds[key]?"'"+value+"'":value);
	}
	sql+=values+")";
	return sql;
}

function getUpdateSql(table,obj,fileds,whereSql){
	var sql = "update "+table+" set ";
	var values = [];
	for(var key in fileds){
		var value = obj[key];
		if(obj[key]===undefined) continue;
		values.push(key+"="+(fileds[key]?"'"+value+"'":value));
	}
	return sql+values+' '+(whereSql||'');
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
	var sql = 'select cid,text,type,(select count(*) from article where cid=c.cid) count from cat c';
	query(sql,function(data){
		callback && callback(data);
	});
}

function getArticleList(callback){
	var sql = 'select c.cid,c.text cname,a.aid,a.title from article a,cat c where a.cid = c.cid and a.type='+articleType.public;
	query(sql,function(data){
		callback && callback(data);
	});
}

function getArticle(aid,callback,queryObj,res){ 
	var sql = 'select title,content,cid,(select type from cat where cid=a.cid) type from article a where aid='+aid;
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

function addArticle(uid,params,callback){
	params.uid = uid;
	params.cdate = "datetime('now')";
	params.udate = "datetime('now')";
	var fileds = {
		"cid":false,"uid":false,"title":true,
		"content":true,"cdate":false,"udate":false
	};
	params.content = escape(params.content);
	var sql = getInsertSql('article',params,fileds);
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

function addPen(uid,params,callback){
	params.userId = uid;
	params.type = articleType.public;
	params.sortcode = 0;
	params.cdate = "datetime('now')";
	params.udate = "datetime('now')";
	//false 代表不用引号包围
	var fileds = {
		'title':true,'desc':true,
		'userId':false, 'htmlId':false,
		'cssId':false, 'jsId':false,
		'type':false, 'sortcode':false,
		'cdate':false, 'udate':false
	};
	var sql = getInsertSql('codepen',params,fileds);
	exec(sql,function(error){
		if(!callback) return;
		if(error===null){
			var sql = "select max(pid) aid from codepen";
			query(sql,function(data){
				data && data.length && callback(true,data[0]);
			});
		}
		else{
			callback && callback(false);
		}
	});
}

function updatePen(uid,params,callback){
	var pid = params.pid;
	var sql = "select userId from codepen where pid="+pid;
	query(sql,function(data){
		if(!data || !data.length) return;
		var userId = data[0].userId;
		if(uid!==userId){
			callback && callback(false,'no permission to update!');
			return;
		}
		var fileds = {
			'title':true,'desc':true,
			'htmlId':false,'cssId':false, 
			'jsId':false,'udate':false
		};
		params.udate = "datetime('now')";
		var whereSql = 'where pid='+pid;
		var updateSql = getUpdateSql('codepen',params,fileds,whereSql);
		exec(updateSql,function(error){
			callback && callback(error===null);
		});
	});
}

function deletePen(uid,pid,callback){
	var sql = "select userId from codepen where pid="+pid;
	query(sql,function(data){
		if(!data || !data.length) return;
		var userId = data[0].userId;
		if(uid!==userId){
			callback && callback(false,'no permission to update!');
			return;
		}
		var deleteSql = "delete from codepen where pid="+pid;
		exec(deleteSql,function(error){
			callback && callback(error===null);
		});
	});
}

function getPenList(uid,callback){
	var sql = 'select * from codepen where userId='+uid;
	query(sql,function(data){
		callback && callback(data);
	});
}

function getPen(pid,res,params){
	var htmlSql = "(select content from article where aid=c.htmlId) html,";
	var sql = "select "+htmlSql+"cssId,jsId from codepen c where pid="+pid;
	query(sql,function(data){
		if(!data || !data.length){
			callback && callback(false);
			return;
		}
		var obj = data[0];
		var html = unescape(obj.html);
		var cssId = obj.cssId;
		var cssText = '<link class="csslink" href="/article/'+cssId+'?type=css&min=true" rel="stylesheet">';
		var jsId = obj.jsId;
		var jsText = '<script class="jsscriptlink" src="/article/'+jsId+'?type=js&min=true"></script>';
		var stopJs = '<script class="noscriptlink" src="/article/45?type=js&min=true"></script>';
		
		var cheerio = require('cheerio');
		$ = cheerio.load(html);

		var isIframe = params.type==="iframe";
		var $head = $('head');
		if($head){
			$head.append(cssText);
			isIframe && $head.append(stopJs);
		}
		var $body = $('body');
		if($head){
			$body.append(jsText);
		}
		var value = $.html();
		if(!$('link.csslink').length) value=cssText+value;
		if(isIframe && !$('script.noscriptlink').length) value=stopJs+value;
		if(!$('script.jsscriptlink').length) value+=jsText;

		res.writeHead(200,{"Content-Type":"text/html"});
		res.write(value);
		res.end();
	});
}

function addCategory(params,callback){
	params.udate = "datetime('now')";
	var fileds = {
		'text':true,'udate':false
	};
	var sql = getInsertSql('cat',params,fileds);
	exec(sql,function(error){
		if(!callback) return;
		if(error===null){
			var sql = "select max(cid) cid from cat";
			query(sql,function(data){
				data && data.length && callback(true,data[0]);
			});
		}
		else{
			callback && callback(false);
		}
	});
}

function deleteCategory(params,callback){
	var cid = params.cid;
	var sql = 'select count(*) count from article where cid='+cid;
	query(sql,function(data){
		var count = data[0].count;
		if(count>0){
			callback && callback(false,'只能删除无文件的分类!');
			return;
		}
		var msql = 'delete from cat where cid='+cid;
		exec(msql,function(error){
			callback && callback(error===null);
		});
	});
}

function createDBTable(params,callback){
	params.udate = "datetime('now')";
	var fileds = { 'stct':true,'data':true,'type':false,'udate':false};
	var sql = getInsertSql('db',params,fileds);
	exec(sql,function(error){
		if(!callback) return;
		if(error===null){
			var sql = "select max(id) id from db";
			query(sql,function(data){
				data && data.length && callback(true,data[0]);
			});
		}
		else{
			callback && callback(false);
		}
	});
}

function getDBTable(param,callback){
	var sql = 'select * from db where id='+param.pid;
	query(sql,function(rows){
		callback && callback(~~rows.length,rows[0]);
	});
}

function updateDBTable(param,callback){
	var index = param.index; 
	var sql = 'select data from db where id='+param.id;
	query(sql,function(rows){
		if(rows.length){
			var row = JSON.parse(rows[0].data);
			row[index]=JSON.parse(param.data);
			var fields = {'data':true,'udate':false};
			var pd = {udate:"datetime('now')",data:JSON.stringify(row)};
			var whereSql = 'where id='+param.id;
			var updateSql = getUpdateSql('db',pd,fields,whereSql);
			exec(updateSql,function(error){
				callback && callback(error===null);
			});
		}else{
			callback && callback(false);
		}
	});

	/*
	var data = param.data;
	var index = param.index; 
	var id = param.id;
	var fileds = {
		'stct':true,'data':true,'type':false,'udate':false
	};
	params.udate = "datetime('now')";
	var whereSql = 'where id='+param.id;
	var updateSql = getUpdateSql('db',params,fileds,whereSql);
	exec(updateSql,function(error){
		callback && callback(error===null);
	});
	*/
}

function dropDBTable(param,callback){
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
exports.addPen = addPen;
exports.getPenList= getPenList;
exports.getPen = getPen;
exports.updatePen = updatePen;
exports.deletePen = deletePen;
exports.addCategory = addCategory;
exports.deleteCategory = deleteCategory;

exports.createDBTable = createDBTable;
exports.updateDBTable = updateDBTable;
exports.dropDBTable = dropDBTable;

exports.getDBTable = getDBTable;
