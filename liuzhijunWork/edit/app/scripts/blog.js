!function(){
	'use strict'
	//--page5--
	var tb=new zjTable({
		container:'#addTable',
		queryUrl:'/db/get',
		updateUrl:'/db/update',
		tableId:1
	});
	var inputName = G('tableName');
	G('addTableBtn').addEventListener('click',(e)=>{
		var value = inputName.value.trim();
		if(!/^[a-z]+$/.test(value)) return;
		var promise = ajax({ url:'/db/add', type:'POST', data:{name:value} });
		promise.then(()=>{
		});
	});

	//--page6--
	var updateDB;
	var tableNameInput = G('tableNameInput');
	function queryTable(name){
		var promise = ajax({ url:'/db/getId', type:'POST', data:{pname:name} });
		promise.then((data)=>{
			if(!data.success) return;
			updateDB=new zjTable({container:'#updateTable',queryUrl:'/db/get',updateUrl:'/db/update',tableId:data.data.id});
			localStorage.setItem('zjTable_tbName',name);
		});
	}
	G('queryTableBtn').addEventListener('click',(e)=>{
		var value = tableNameInput.value.trim();
		if(!/^[a-z]+$/.test(value)) value='0';
		queryTable(value);
	});
	var localTbName = localStorage.getItem('zjTable_tbName');
	if(localTbName){
		tableNameInput.value = localTbName;
		queryTable(localTbName);
	}

}();
