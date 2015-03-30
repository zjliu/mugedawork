var util = require('util');
var async = require('async');   //npm install async

/*
var notesdb = require('./nodesdb-sqlite3');

notesdb.connect(function(error){
	if (error) throw error;
});

notesdb.setup(function(error){
	if (error){
		util.log('ERROR ' + error);
		throw error;
	}
	async.series(
		[function(cb){
			notesdb.add("test", "testtest",function(error){
				if (error) util.log('ERROR ' + error);
				cb(error);
			});
		}],
		function(error, results){
			if (error) util.log('ERROR ' + error);
			notesdb.disconnect(function(err){});
		}
	);
});
*/

exports.obj={};
