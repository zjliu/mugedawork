
!function(){
	var box=new messageBox({ 
		container:document.body,
		data_url_callback:function(pageIndex){
			return { 
				url:'scripts/data.json',
				params:{'pageIndex':pageIndex}
			}
		}
	});
}();