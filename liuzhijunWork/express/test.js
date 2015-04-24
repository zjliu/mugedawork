var express=require('express');
var app=express();

app.get('/',function(req,res){
	res.send('hello world');
});

app.get('/abc',function(req,res){
	res.send('hello world');
});

app.listen(4000);
