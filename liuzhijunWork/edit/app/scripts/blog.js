!function(){
	var tb=new zjTable({
		container:'.addTable',
		queryUrl:'/db/get',
		updateUrl:'/db/update'
	});
	var inputName = G('tableName');
	G('addTableBtn').addEventListener('click',(e)=>{
		var value = inputName.value.trim();
		if(!/^[a-z]+$/.test(value)) return;
		var promise = ajax({ url:'/db/add', type:'POST', data:{name:value} });
		promise.then(()=>{
		});
	});
}();
