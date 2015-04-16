var Tetris = (function(win){
	//形状数据
	var Shape=[
		//-------------------------- I
		[
			[1,1,1,1],
		],
		[
			[1],
			[1],
			[1],
			[1],
		],

		//---------------------------L
		[ 
			[1,0,0],
			[1,1,1],
		],
		[ 
			[1,1],
			[1,0],
			[1,0],
		],
		[ 
			[1,1,1],
			[0,0,1],
		],
		[ 
			[0,1],
			[0,1],
			[1,1],
		],
		//----------------------------J
		[ 
			[0,0,1],
			[1,1,1],
		],
		[ 
			[1,0],
			[1,0],
			[1,1],
		],
		[ 
			[1,1,1],
			[1,0,0],
		],
		[ 
			[1,1],
			[0,1],
			[0,1],
		],

		//-----------------------------O
		[ 
			[1,1],
			[1,1],
		],

		//----------------------------- S
		[ 
			[0,1,1],
			[1,1,0],
		],
		[ 
			[1,0],
			[1,1],
			[0,1],
		],
		//----------------------------- Z
		[ 
			[1,1,0],
			[0,1,1],
		],
		[ 
			[0,1],
			[1,1],
			[1,0],
		],

		//-----------------------------T
		[ 
			[0,1,0],
			[1,1,1],
		],
		[ 
			[1,0],
			[1,1],
			[1,0],
		],	
		[ 
			[1,1,1],
			[0,1,0],
		],
		[ 
			[0,1],
			[1,1],
			[0,1],
		]
	];

	//矩阵操作
	function getMatrixRightRotate(arr){ 
		var matrix = [];
		var yLen = arr.length;
		var xLen = arr[0].length;
		for(var i=0;i<xLen;i++){ 
			var row = [];
			for(var j=yLen-1;j>=0;j--){ 
				row.push(arr[j][i]);
			}
			matrix.push(row);
		}
		return matrix;
	}

	var Matrix2D={ 
		rightRotate:function(arr){ 
			var matrix = [];
			var yLen = arr.length;
			var xLen = arr[0].length;
			for(var i=0;i<xLen;i++){ 
				var row = [];
				for(var j=yLen-1;j>=0;j--){ 
					row.push(arr[j][i]);
				}
				matrix.push(row);
			}
			return matrix;
		},
		rotateCycle:function(arr){ 
			var arrs = [arr];
			var temp = arr;
			for(var i=0;i<4;i++){ 
				var rightArr = this.rightRotate(temp);
				temp = rightArr;
				if(this.containsRow(arrs,rightArr)) continue;
				arrs.push(rightArr);
			}
			return arrs;
		},
		containsRow:function(arr,row){ 
			var value = JSON.stringify(row)
			return arr.some(function(item){
				return JSON.stringify(item)===value;
			});
		}
	};

	//分组数据
	var shapeInfo=[
		// I
		{ 
			color:"#F60",
			from:0,
			to:1
		},
		//L
		{ 
			color:"#00C",
			from:2,
			to:5
		},
		//J
		{ 
			color:"#C0F",
			from:6,
			to:9
		},
		//O
		{ 
			color:"#F00",
			from:10,
			to:10
		},
		//S
		{ 
			color:"#6CF",
			from:11,
			to:12
		},
		//Z
		{ 
			color:"#0F0",
			from:13,
			to:14
		},
		//T
		{ 
			color:"#FF0",
			from:15,
			to:18
		}
	];

	function eRandom(m,n){ 
		return m+ Math.floor((n-m+1)*Math.random());
	}

	function randomArr(arr){
		return arr[eRandom(0,arr.length-1)];
	}

	function getRandomShapeInfo(){ 
		return randomArr(shapeInfo);
	}

	function getChangeGridIndex(infoObj,index){ 
		var from = infoObj.from;
		var to = infoObj.to;
		return index===to ? from : index+1;
	}

	function getShapeInfoByShapeIndex(index){ 
		for(var i=0,l=shapeInfo.length;i<l;i++){ 
			var info = shapeInfo[i];
			if(index>=info.from && index<=info.to) return i;
		}
	}

	function ShapeEach(shape,callback,needReturn){ 
		if(!shape || !callback) return;
		for(var i=0,il=shape.length;i<il;i++){ 
			var iItem = shape[i];
			for(var j=0,jl=iItem.length;j<jl;j++){ 
				var item = iItem[j];
				var result = callback(i,j,item);
				if(needReturn && !result) return false;
			}
		}
		return true;
	}

	function detect(spirit,shape,mapData,m,n,cm,cn){
		var result = ShapeEach(shape,function(i,j,value){ 
			if(value===1){ 
				var m = (this.m || spirit.m) + j + (cm || 0);
				var n = (this.n || spirit.n) + i + (cn || 0);
				var name = n + '_' + m;
				if(m>=0 && n>=0 && mapData[n][m]){ 
					return false;
				}
			}
			return true;
		}.bind({'m':m,'n':n}),true);
		return result;
	}

	//常量
	var gridR = 20,
	gridWidthCount = 10,
	gridHeightCount = 20,
	w = gridWidthCount * gridR,
	h = gridHeightCount * gridR,
	strokeStyle = '#000',
	lineWidth = "1px";

	var originShapeLength = Shape.length;
	var originShapeInfoLength = shapeInfo.length;

	//info 指是哪个shapeInfo类型，index指是哪个Shape，m指所在列，n指所在行
	function Spirit(info,index,m,n){ 
		this.info = info;
		this.index = index;
		this.m=m;
		this.n=n;
		this.over=false;
		this.speed = 1;
	}

	Spirit.prototype={ 
		update:function(mapData){ 
			var shape = Shape[this.index];
			if(this.n+shape.length<gridHeightCount) {
				var success = detect(this,shape,mapData,null,this.n+1);
				if(success) this.n+=this.speed;
				if(!success) this.setOver(shape,mapData);
			}
			else this.setOver(shape,mapData);
		},
		draw:function(cxt){ 
			cxt.save();
			cxt.beginPath();
			var shape = Shape[this.index];
			ShapeEach(shape,function(i,j,value){ 
				if(value===1){
					var x = (this.m + j)*gridR;
					var y = (this.n + i)*gridR;
					cxt.rect(x,y,gridR,gridR);
				}
			}.bind(this));
			cxt.fillStyle=this.info.color;
			cxt.strokeStyle = strokeStyle;
			cxt.lineWidth = lineWidth;
			cxt.fill();
			cxt.stroke();
			cxt.closePath();			
			cxt.restore();
		},
		toLeft:function(mapData){ 
			if(this.m>0) { 
				var shape = Shape[this.index];
				var success = detect(this,shape,mapData,this.m-1,null);
				if(success) this.m--;
			}
		},
		toRight:function(mapData){ 
			var shape = Shape[this.index];
			if(this.m+shape[0].length<gridWidthCount) { 
				var success = detect(this,shape,mapData,this.m+1,null);
				if(success) this.m++;
			}
		},
		change:function(mapData){ 
			var nextIndex = getChangeGridIndex(this.info,this.index); 
			var nextSpirit = Shape[nextIndex];
			if(this.n+nextSpirit.length>gridHeightCount) return;
			var shape = Shape[nextIndex];
			//对是 I 形的进行特殊处理
			var cm = this.index<2 ? (this.index?-1:1) : 0;
			var cn = this.index<2 ? (this.index?1:-1) : 0;
			var success = detect(this,shape,mapData,null,null,cm,cn);
			var changeSuccess = this.changeDetect(shape);
			if(success && changeSuccess) { 
				this.index = nextIndex;
				this.m += cm;
				this.n += cn;
			}
		},
		setOver:function(shape,mapData){ 
			ShapeEach(shape,function(i,j,value){ 
				if(value===1 && (this.n+i>-1) && (this.m+j>-1)){
					mapData[this.n+i][this.m+j] = this.info.color; 
				}
			}.bind(this));
			this.over = true;
		},
		changeDetect:function(shape){ 
			return ShapeEach(shape,function(i,j,value){ 
				if(value===1){ 
					var m = this.m + j;
					var n = this.n + i;
					if(m<0 || m>gridWidthCount-1 || n>gridHeightCount-1) return false;
				}
				return true;
			}.bind(this),true);
		}
	}

	var GameStatus={ 
		preStart:0,		//游戏未开始
		Run:1,			//游戏运行
		Pause:2,		//游戏暂停
		Over:3 			//游戏结束
	};

	var empty = function(){};

	var option = { 
		'normal_speed':300,				//平时速度
		'up_speed':100,					//加速时的速度
		'scoreArr':[10,30,60,100],		//消除一行10分，2行30分，3行60分，4行100分
		'scoreChangeCallback':empty,	//当分数改变时的回调
		'gameOverCallback':empty		//当游戏结束时的回调
	};

	function Tetris(opts){ 
		opts = opts || {};
		for(var key in option){ 
			this[key] = opts[key] || option[key];
		}

		var canvas = G('Tetris'),
			cxt = canvas.getContext('2d');

		cxt.strokeStyle = strokeStyle;
		cxt.lineWidth = lineWidth;
		this.cxt = cxt;
		
		this.currentSpeed = this.normal_speed;
		this.status = GameStatus.preStart;
		this.spirits = [];
		this.score = 0;
		this.drawbgCanvas();
	}

	Tetris.prototype={ 
		start:function(){ 
			this.resetGame();

			this.initData();
			this.createSpirit();
			this.initEvent();
			this.run();
		},
		initData:function(){ 
			//初始化mapData 这个是用来存储已经over的spirit的格子的
			this.mapData=[];
			for(var i=0;i<gridHeightCount;i++){ 
				var arr = [];
				for(var j=0;j<gridWidthCount;j++){
					arr.push(null);
				}
				this.mapData.push(arr);
			}
		},
		createSpirit:function(){ 
			//创建新的spirit
			var info = getRandomShapeInfo(Shape);
			var index = Math.round(eRandom(info.from,info.to));
			var shape = Shape[index];
			function create(){ 
				return new Spirit(info,index,Math.round((gridWidthCount-shape[0].length)/2),-2);
			}
			this.spirit = this.nextSpirit || create();
			this.nextSpirit = create();
			setTimeout(function(){ 
				if(this.status===GameStatus.Run && this.nextSpirit) this.drawNextSpirit();
			}.bind(this),2000);
			this.spirits.push(this.spirit);
		},
		run:function(){ 
			this.status = GameStatus.Run;
			var self = this;
			var lastTime = Date.now();
			function loop(){
				if(self.status===GameStatus.Over) { 
					cancelAnimationFrame(self.loopFlag);
					return;
				}
				//控制速度 begin
				var currentTime = Date.now();
				if(currentTime - lastTime<self.currentSpeed) { 
					self.loopFlag = requestAnimationFrame(loop);
					return;
				}
				lastTime = currentTime;
				//end
				var spirit = self.spirit;
				//清屏
				self.cxt.clearRect(0,0,w,h);
				//画出已经固定的spirit
				self.drawOver();
				//画出当前移动的spirit
				spirit.draw(self.cxt);
				//更新数据（向下移动 n++）
				spirit.update(self.mapData);
				//当前spirit结束
				if(spirit.over) { 
					//最新的spirit出来不了，说明堆到顶了，游戏结束
					if(spirit.n<=0){ 
						self.gameOver();
						return;
					}
					else{
						//处理消除
						self.eliminate();
						//创建新的spirit
						self.createSpirit();
						//重新设置速度值（让上次加速的把速度减下来）
						self.changeSpeed();
					}
				}
				self.loopFlag = requestAnimationFrame(loop);
			}
			loop();
		},
		initEvent:function(){ 
			//处理键盘事件
			var timeSpan = 100;
			var leftTime = Date.now();
			var topTime = leftTime;
			var rightTime = leftTime;
			var bottomTime = leftTime;

			var self = this;
			function keyDown(e) {
				if(!self.spirit) return;
				var keycode = e.which;
				var now = Date.now();
				if(keycode>=37 && keycode<=40){ 
					switch(keycode){ 
						case 37: 	//左
							if(now-leftTime<timeSpan) return;
							leftTime = now;
							self.spirit.toLeft(self.mapData);
						break;
						case 38: 	//上
							if(now-topTime<timeSpan) return;
							topTime = now;
							self.spirit.change(self.mapData);
						break;
						case 39: 	//右
							if(now-rightTime<timeSpan) return;
							rightTime = now;
							self.spirit.toRight(self.mapData);
						break;
						case 40: 	//下
							self.changeSpeed(true);
						break;
					}
				}
		   }
		   document.onkeydown = keyDown;
		},
		changeSpeed:function(isup){ 
			var orgSpeed = this.currentSpeed;
			this.currentSpeed = isup ? this.up_speed : this.normal_speed;
			if(this.currentSpeed===orgSpeed) return;
		},
		gameOver:function(){ 
			this.status = GameStatus.Over;
			cancelAnimationFrame(this.loopFlag);
			this.cxt.clearRect(0,0,w,h);
			this.clearNextSpirit();
			this.showMessage("游戏结束");
			this.showMessage('分数：'+this.score,30);
			this.gameOverCallback();

			this.resetGame();
		},
		toggerPauseOrPlay:function(){ 
			if(this.status===GameStatus.preStart) return;
			if(this.status===GameStatus.Pause) this.gameContinue();
			else if(this.status===GameStatus.Run) this.gamePause();
			return this.status;
		},
		gamePause:function(){ 
			this.status = GameStatus.Pause;
			if(this.loopFlag){ 
				cancelAnimationFrame(this.loopFlag);
			}
		},
		gameContinue:function(){ 
			this.run();
		},
		resetGame:function(){ 
			//重新设置参数
			this.score = 0;
			this.scoreChangeCallback(0);
			this.status = GameStatus.preStart;
			this.spirits = [];
			this.currentSpeed = this.normal_speed;
			delete this.mapData;
			delete this.spirit;
			delete this.nextSpirit;
			if(this.loopFlag){ 
				cancelAnimationFrame(this.loopFlag);
				delete this.loopFlag;
			}
			this.clearNextSpirit();			
		},
		drawbgCanvas:function(){ 
			var bgCanvas = G('bgTetris'),
				bgCxt = bgCanvas.getContext('2d'),
				bgW = w,
				bgH = h;
			this.bgCxt = bgCxt;
			bgCxt.save();
			bgCxt.translate(5,5);
			for(var i=1;i<gridHeightCount;i++){ 
				bgCxt.moveTo(0,i*gridR);
				bgCxt.lineTo(bgW,i*gridR);
			}
			for(var j=1;j<gridWidthCount;j++){ 
				bgCxt.moveTo(j*gridR,0);
				bgCxt.lineTo(j*gridR,bgH);
			}
			bgCxt.strokeStyle = "rgba(255,255,0,0.1)";
			bgCxt.stroke();	
			bgCxt.restore();
		},
		drawOver:function(){ 
			var cxt = this.cxt;
			cxt.save();
			if(!this.mapData) debugger;
			for(var i=0,l=this.mapData.length;i<l;i++){ 
				var item = this.mapData[i];
				for(var j=0,jl=item.length;j<jl;j++){ 
					var color = item[j];
					if(!color) continue;
					cxt.save();
					cxt.beginPath();
					cxt.rect(j*gridR,i*gridR,gridR,gridR);
					cxt.fillStyle=color;
					cxt.fill();
					cxt.strokeStyle = strokeStyle;
					cxt.lineWidth = lineWidth;
					cxt.stroke();
					cxt.closePath();
				}
			}
			cxt.restore();
		},
		drawNextSpirit:function(){ 
			var bgCxt = this.bgCxt,
				bgCanvas = bgCxt.canvas,
				bgW = bgCanvas.width,
				hgH = bgCanvas.height;

			var margin = 5;
			var nextW = gridR * 4;
			var nextH = gridR * 4;
			
			bgCxt.save();
			bgCxt.translate(bgW - nextW - margin,margin);
			this.bgCxt.clearRect(-margin,-margin,nextW+margin,nextH+margin);

			bgCxt.beginPath();
			var sp = this.nextSpirit;
			var shape = Shape[sp.index];
			ShapeEach(shape,function(i,j,value){ 
				if(value===1){
					bgCxt.rect(j*gridR,i*gridR,gridR,gridR);
				}
			});
			bgCxt.fillStyle=sp.info.color;
			bgCxt.fill();
			bgCxt.stroke();
			bgCxt.closePath();

			bgCxt.restore();
		},
		clearNextSpirit:function(){ 
			var bgCxt = this.bgCxt,
				bgCanvas = bgCxt.canvas,
				bgW = bgCanvas.width;
			var margin = 5;
			var nextW = gridR * 4;
			var nextH = gridR * 4;
			bgCxt.save();
			bgCxt.translate(bgW - nextW - margin,margin);
			bgCxt.clearRect(0,0,nextW,nextH);
			bgCxt.restore();
		},
		showMessage:function(text,hx){ 
			var cxt = this.cxt;
			cxt.save();
			var gradient=cxt.createLinearGradient(0,0,w,0);
			gradient.addColorStop("0","magenta");
			gradient.addColorStop("0.5","blue");
			gradient.addColorStop("1.0","red");
			var fontSize = 20;
			cxt.strokeStyle=gradient;
			cxt.font=fontSize + "px Arial";
			cxt.strokeText(text,(w-fontSize*text.length)/2,(h-fontSize)/2+(hx || 0),w);
			cxt.restore();
		},
		eliminate:function(){
			//消除格子被占满时的所有行（mapData中此行所有的格子对应的mapData数据设置为null）
			var deleteRows = [];
			for(var i=0,l=this.mapData.length;i<l;i++){ 
				var row = this.mapData[i];
				var isEliminate = row.every(function(item){ return !!item;});
				if(isEliminate) {
					deleteRows.push(i);
				}
			}
			if(deleteRows.length){
				this.eliminateDown(deleteRows);
				this.score += this.scoreArr[deleteRows.length-1];
				this.scoreChangeCallback(this.score);
			}
		},
		eliminateDown:function(arr){
			//当一行消除之后，这一行之上的所有行向下退一格
			var self = this;
			arr.forEach(function(i){ 
				self.mapData.splice(i,1);
				self.mapData.splice(0,0,getArr(gridWidthCount));
			});
			function getArr(count){ 
				var temp=[];
				for(var i=0;i<count;i++){ 
					temp.push(null);
				}
				return temp;
			}
		},
		//Extend
		//添加形状到游戏中
		addShape:function(arr,mcolor){
			if(!(arr instanceof Array) || arr.length!=4 || arr[0].length!=4 || !mcolor) return;
			//对4*4的arr进行最小化(没有数据都为0的整行或整列)
			function smallShape(arr){
				var iArr=[],jArr=[];
				for(var i=0,l=arr.length;i<l;i++){ 
					var row = arr[i];
					for(var j=0,jl=row.length;j<jl;j++){ 
						var item = row[j];
						if(item===1){ 
							iArr.push(i);
							jArr.push(j);
						}
					}
				}
				var minI = Math.min.apply(null,iArr);
				var maxI = Math.max.apply(null,iArr);
				var minJ = Math.min.apply(null,jArr);
				var maxJ = Math.max.apply(null,jArr);

				var temp = [];
				for(var i=minI;i<=maxI;i++){ 
					var tRow = [];
					for(var j=minJ;j<=maxJ;j++){
						tRow.push(arr[i][j]); 
					}
					temp.push(tRow);
				}
				return temp;
			}
			function checkHasShape(arr){ 
				var str = JSON.stringify(arr);
				for(var i=0,l=Shape.length;i<l;i++){ 
					if(JSON.stringify(Shape[i])===str) return true;
				}
			}
			arr = smallShape(arr);
			if(!arr.length) return {status:0,errorMsg:'添加形状为空'};
			if(checkHasShape(arr)){ 
				return {status:0,errorMsg:'已经有此形状'};
			}
			var changeArrs = Matrix2D.rotateCycle(arr);
			shapeInfo.push({ 
				color:mcolor,
				from:Shape.length,
				to:Shape.length + changeArrs.length -1
			});
			Shape = Shape.concat(changeArrs);
			return {status:1,errorMsg:''};
		},
		addShapeArray:function(shapes,shapeInfos){ 
			Shape = Shape.concat(shapes);
			shapeInfo = shapeInfo.concat(shapeInfos);
		},
		getShapes:function(isNew){ 
			if(isNew) return Shape.slice(originShapeLength,Shape.length); 
			var arr = [];
			for(var i=0,l=shapeInfo.length;i<l;i++){ 
				arr.push(Shape[shapeInfo[i].from]);
			}
			return arr;
		},
		getShapeInfos:function(isNew){ 
			return isNew?shapeInfo.slice(originShapeInfoLength,shapeInfo.length):shapeInfo;
		},
		deleteShape:function(index){ 
			if(index<originShapeInfoLength) return {status:0,errorMsg:'不能删除原有形状！'};
			if(index>shapeInfo.length-1) return {status:0,errorMsg:'没有此形状！'};
			var info = shapeInfo[index];
			Shape.splice(info.from,info.to);
			Shape.splice(index,1);	
			return {status:1,errorMsg:''};
		},
	}
	return Tetris;
})(window);
