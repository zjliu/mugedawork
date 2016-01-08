!function(){
	'use strict'

	function setActiveLable(radio_id){
		var activeEl = Q('#page5 li.active');
		activeEl && activeEl.classList.remove('active');
		var label = Q(`#page5 label[for=${radio_id}]`);
		label.parentElement.classList.add('active');
	}
	Array.prototype.forEach.call(document.querySelectorAll('#tableList input[name=tbRadio]'),el=>el.onchange=e=>{
		localStorage.setItem('last_tbRadio',e.target.id);
		setActiveLable(e.target.id);
	});
	var lastTbRadio = localStorage.getItem('last_tbRadio');
	if(lastTbRadio){
		G(lastTbRadio).click();
		setActiveLable(lastTbRadio);
	}

	//--all tables tblist
	var all_tb = new zjTable({ container:'#allTableContainer', queryUrl:'/db/tblist', updateUrl:'/db/updateTb', type:'row' });

	//--add table--
	var tb=new zjTable({ container:'#addTable', queryUrl:'/db/get', updateUrl:'/db/update', tableId:1, type:'table' });
	var inputName = G('tableName');
	G('addTableBtn').addEventListener('click',(e)=>{
		var value = inputName.value.trim();
		if(!/^[a-z]+$/.test(value)) return;
		var promise = ajax({ url:'/db/add', type:'POST', data:{name:value} });
		promise.then(()=>{
		});
	});

	//--update data--
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
	if(localTbName){ tableNameInput.value = localTbName; queryTable(localTbName); }


	//--update stct--
	var updateStct;
	var tableNameInput_stct = G('tableNameInput_stct');
	function queryStct(name){
		var promise = ajax({ url:'/db/getId', type:'POST', data:{pname:name} });
		promise.then((data)=>{
			if(!data.success) return;
			updateStct=new zjTable({ 
				container:'#updateTable_stct', 
				queryUrl:'/db/getStct', 
				updateUrl:'/db/update', 
				tableId:data.data.id, 
				type:'table' 
			});
			localStorage.setItem('zjTable_tbName_stct',name);
		});
	}
	G('queryTableBtn_stct').addEventListener('click',(e)=>{
		var value = tableNameInput_stct.value.trim();
		if(!/^[a-z]+$/.test(value)) value='0';
		queryStct(value);
	});
	var localTbName_stct = localStorage.getItem('zjTable_tbName_stct');
	if(localTbName_stct){ tableNameInput_stct.value = localTbName_stct; queryStct(localTbName_stct); }

}();
