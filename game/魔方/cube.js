function Cube(id,opts){
	//储存Cube信息
	this.container=document.getElementById(id);//容器
	this.opts=opts||{};//所有信息
	this.order=this.opts.order||3;//设定魔方阶乘，默认是三阶
	this.borderLength=this.opts.borderLength||240;//容器边长，默认240
	this.boxBorderLength=parseInt(this.borderLength/this.order/2)*2;//计算出每个块的边长
	this.borderLength=this.boxBorderLength*this.order;//重计算容器边长，避免小数点误差
	this.vColor=this.opts.vColor||'#999';//设定魔方材料颜色，默认是白色
	this.mouseSen=this.opts.mouseSen||0.5;//默认鼠标灵敏度是1
	this.oneTime=this.opts.oneTime||500;//转动一次的时间 毫秒
	this.oneTimeBatch=this.opts.oneTimeBatch||200;//批量扭动时扭动一次的时长

	this.turnOn=typeof(this.opts.turnOn) == 'undefined'?true:this.opts.turnOn;//是否点击扭动，默认是
	this.turnArrowColor=this.opts.turnArrowColor||'pink';
	//置空容器
	this.container.innerHTML='';

	//建立DOM结构
	this.boxsData=[];//存放魔方的每个小块 格式[{dom:dom,x:0,y:0,z:0,coorX:'x',coorY:'y',coorZ:'z',faces:[dom,dom..]},,]

	this.boxsDataLength=Math.pow(this.order,3);
	for(var i=0;i<this.boxsDataLength;i++){
		var boxs={};
		boxs.dom=document.createElement('div');//建立小块
		this.container.appendChild(boxs.dom);//将小块添加进去
		boxs.faces=[];//存放每个小块的6个面
		for(var j=0;j<6;j++){
			var aDiv=document.createElement('div');//建立面
			boxs.dom.appendChild(aDiv);//将面添加进去
			boxs.faces.push(aDiv);//存储面
		}
		boxs.x=boxs.intx=i%this.order;
		boxs.y=boxs.inty=(parseInt(i/this.order))%this.order;
		boxs.z=boxs.intz=(parseInt(i/Math.pow(this.order,2)))%this.order;
		this.boxsData.push(boxs);//存储小块
	}

	this.turnOn&&this.addArrow();

	this.initStyle();
	//初始化各面颜色
	this.initColors=this.opts.colors||[['yellow'],['#fff'],['blue'],['green'],['red'],['orange']];
	//this.initColors=this.opts.colors||[['none'],['none'],['none'],['none'],['none'],['none']];
	this.initColor();

	//给容器加旋转事件
	this.containerMouseMove();

}

Cube.prototype.addArrow=function(){
	//添加 arrow
	var order=this.order;
	var b=this.order-1;
	var filter=[{y:0},{y:b},{x:0},{x:b},{z:b},{z:0}];
	var coordir=[{up:{coor:'x',dir:1},bottom:{coor:'x',dir:0},left:{coor:'z',dir:0},right:{coor:'z',dir:1}},
				{up:{coor:'x',dir:0},bottom:{coor:'x',dir:1},left:{coor:'z',dir:1},right:{coor:'z',dir:0}},
				{up:{coor:'y',dir:0},bottom:{coor:'y',dir:1},left:{coor:'z',dir:1},right:{coor:'z',dir:0}},
				{up:{coor:'y',dir:1},bottom:{coor:'y',dir:0},left:{coor:'z',dir:0},right:{coor:'z',dir:1}},
				{up:{coor:'x',dir:1},bottom:{coor:'x',dir:0},left:{coor:'y',dir:0},right:{coor:'y',dir:1}},
				{up:{coor:'x',dir:0},bottom:{coor:'x',dir:1},left:{coor:'y',dir:1},right:{coor:'y',dir:0}},
	];
	//添加arrow
	for(var i=0;i<6;i++){
		var dom=this.getDomByPos(filter[i]);
		for(var j=0;j<dom.length;j++){
			if(parseInt(j/order)==0){
				dom[j].faces[i].innerHTML+='<div class="arrow top" coor="'+coordir[i].up.coor+'" num="'+(j%order)+'" dir="'+coordir[i].up.dir+'"></div>';
			}
			if(parseInt(j/order)==b){
				dom[j].faces[i].innerHTML+='<div class="arrow bottom" coor="'+coordir[i].bottom.coor+'" num="'+(j%order)+'" dir="'+coordir[i].bottom.dir+'"></div>';
			}
			if(j%order==0){
				dom[j].faces[i].innerHTML+='<div class="arrow left" coor="'+coordir[i].left.coor+'" num="'+parseInt(j/order)+'" dir="'+coordir[i].left.dir+'"></div>';
			}
			if(j%order==b){
				dom[j].faces[i].innerHTML+='<div class="arrow right" coor="'+coordir[i].right.coor+'" num="'+parseInt(j/order)+'" dir="'+coordir[i].right.dir+'"></div>';
			}

		}
	}

	//设置样式 //想用jquery了·~·，算了就这点
	var width=parseInt(this.boxBorderLength/2);
	var left=parseInt(this.boxBorderLength/4);
	var height=parseInt(this.boxBorderLength/5);
	var arr=this.container.getElementsByClassName('arrow');
	var arrtop=this.container.getElementsByClassName('top');
	var arrbottom=this.container.getElementsByClassName('bottom');
	var arrleft=this.container.getElementsByClassName('left');
	var arrright=this.container.getElementsByClassName('right');
	for(var i=0;i<arr.length;i++){
		arr[i].style.position='absolute';
		arr[i].style.cursor='pointer';
		arr[i].style.display='none';
		arr[i].style.width='0';
		arr[i].style.height='0';
	}
	var length=arrtop.length;
	for(var i=0;i<length;i++){
		arrtop[i].style.borderLeft=arrtop[i].style.borderRight=width/2+'px solid transparent';
		arrtop[i].style.borderBottom=height+'px solid '+this.turnArrowColor;
		arrtop[i].style.left=left+'px';
		arrtop[i].style.top=0;
		arrbottom[i].style.borderLeft=arrbottom[i].style.borderRight=width/2+'px solid transparent';
		arrbottom[i].style.borderTop=height+'px solid '+this.turnArrowColor;
		arrbottom[i].style.left=left+'px';
		arrbottom[i].style.bottom=0;
		arrleft[i].style.borderTop=arrleft[i].style.borderBottom=width/2+'px solid transparent';
		arrleft[i].style.borderRight=height+'px solid '+this.turnArrowColor;
		arrleft[i].style.top=left+'px';
		arrleft[i].style.left=0;
		arrright[i].style.borderTop=arrright[i].style.borderBottom=width/2+'px solid transparent';
		arrright[i].style.borderLeft=height+'px solid '+this.turnArrowColor;
		arrright[i].style.top=left+'px';
		arrright[i].style.right=0;
	}

	//添加hover显示事件
	for(var i=0;i<this.boxsDataLength;i++){
		var faces=this.boxsData[i].faces;
		for(var j=0;j<6;j++){
			faces[j].onmouseenter=function(){
				var arrs=this.getElementsByClassName('arrow');
				var length=arrs.length;
				for(var j=0;j<length;j++){
					arrs[j].style.display='block';
				}
			};
			faces[j].onmouseleave=function(){
				var arrs=this.getElementsByClassName('arrow');
				var length=arrs.length;
				for(var j=0;j<length;j++){
					arrs[j].style.display='none';
				}
			};
		}
	}


	//添加点击扭动事件
	var _this=this;
	for(var i=0;i<arr.length;i++){
		arr[i].onclick=function(){
			var coor=this.getAttribute('coor');
			var num=this.getAttribute('num');
			var dir=this.getAttribute('dir');
			_this.turn(coor,num,Number(dir));
		}
	}

}

//设置初始样式
Cube.prototype.initStyle=function(){
	//设置容器样式  宽高 相对定位 开启3D效果
	this.container.style.width=this.container.style.height=this.borderLength+'px';
	this.container.style.positon='relative';
	this.container.style.WebkitTransformStyle='preserve-3d';
	this.container.style.WebkitTransform='perspective(800px) rotateZ(0deg) rotateY(0deg) rotateX(0deg)';
	//设置每个盒子的样式 宽高 固定定位到中间 边线  平移量
	for(var i=0;i<this.boxsDataLength;i++){
		this.boxsData[i].dom.style.position='absolute';
		this.boxsData[i].dom.style.width=this.boxsData[i].dom.style.height=this.boxBorderLength+'px';
		this.boxsData[i].dom.style.left=this.boxsData[i].dom.style.top=(this.order/2-0.5)*this.boxBorderLength+'px';
		//设置没个盒子偏移量
		var x=this.boxsData[i].translateX=(this.boxsData[i].x+0.5-(this.order/2))*this.boxBorderLength;
		var y=this.boxsData[i].translateY=(this.boxsData[i].y+0.5-(this.order/2))*this.boxBorderLength;
		var z=this.boxsData[i].translateZ=(this.boxsData[i].z+0.5-(this.order/2))*this.boxBorderLength;
		var rx=this.boxsData[i].rotateX=0;
		var ry=this.boxsData[i].rotateY=0;
		var rz=this.boxsData[i].rotateZ=0;
		this.boxsData[i].dom.style.WebkitTransformStyle='preserve-3d';
		this.boxsData[i].dom.style.WebkitTransform='rotateX('+rx+'deg) rotateY('+ry+'deg) rotateZ('+rz+'deg) translateZ('+z+'px) translate('+x+'px,'+y+'px)';
		for(var j=0;j<6;j++){
			//设置每个面的属性
			this.boxsData[i].faces[j].style.position='absolute';
			this.boxsData[i].faces[j].style.top=this.boxsData[i].faces[j].style.left=0;
			this.boxsData[i].faces[j].style.width=this.boxsData[i].faces[j].style.height='100%';
			this.boxsData[i].faces[j].style.border='2px solid '+this.vColor;//设置边线 默认2px
			this.boxsData[i].faces[j].style.boxSizing='border-box';//设置边线 属性
			this.boxsData[i].faces[j].style.background=this.vColor; //设置面的原始颜色 同材料颜色
			this.boxsData[i].faces[j].style.borderRadius=parseInt(this.boxBorderLength/10)+'px'; //设置面的圆角，默认每小块的1/10
			//设置每个面的偏移量
			var tx=0,ty=0,tz=0,rx=0,ry=0,rz=0;
			switch(j){
				case 0:ty=-this.boxBorderLength/2;rx=90;break;
				case 1:ty=this.boxBorderLength/2;rx=90;break;
				case 2:tx=-this.boxBorderLength/2;ry=90;rx=90;break;
				case 3:tx=this.boxBorderLength/2;ry=90;rx=90;break;
				case 4:tz=this.boxBorderLength/2;break;
				case 5:tz=-this.boxBorderLength/2;break;
			}
			var transformstyle='';
			transformstyle+=tx?'translateX('+tx+'px) ':'';
			transformstyle+=ty?'translateY('+ty+'px) ':'';
			transformstyle+=tz?'translateZ('+tz+'px) ':'';
			transformstyle+=rx?'rotateX('+rx+'deg) ':'';
			transformstyle+=ry?'rotateY('+ry+'deg) ':'';
			transformstyle+=rz?'rotateZ('+rz+'deg) ':'';
			this.boxsData[i].faces[j].style.WebkitTransform=transformstyle;
//this.boxsData[i].faces[j].innerHTML=i;
		}

	}
};
//干掉魔方上所有颜色的方法，，只剩下材料颜色
Cube.prototype.delColor=function(){
	for(var i=0;i<this.boxsDataLength;i++){
		var doms=this.boxsData[i].faces;
		for(var j=0;j<6;j++){
			doms[j].style.backgroundColor=this.vColor;
		}
	}
}
//设定魔方颜色设定 格式[[color,color,上面的9个点],[下],[]..]
Cube.prototype.setColor=function(colorarr){
	var _this=this;
	this.delColor();
	this.colors=colorarr||(function(){
		var arr=[];
		for(var i=0;i<_this.initColors.length;i++){
			var subarr=_this.initColors[i].slice(0);
			arr.push(subarr);
		}
		return arr;
	})();
	//容错this.colors,如果每一个面只给一个颜色或少给颜色，按前一个颜色算;
	for(i=0;i<+6;i++){
		if(!this.colors[i]){this.colors[i]=this.colors[i-1];}
		for(var j=0;j<Math.pow(this.order,2);j++){
			if(!this.colors[i][j]){this.colors[i][j]=this.colors[i][j-1]}
		}
	}
	var b=this.order-1;
	var filter=[{y:0},{y:b},{x:0},{x:b},{z:b},{z:0}];
	//添加颜色
	for(var i=0;i<6;i++){
		var dom=this.getDomByPos(filter[i]);
		for(var j=0;j<dom.length;j++){
			dom[j].faces[i].style.background=this.colors[i][j];
		}
	}
};
//初始化颜色
Cube.prototype.initColor=function(){
	this.foots=0;
	this.setColor();
}
//通过坐标筛选boxsData; json格式 {x:num,y:num,z:num}  可省略条件
Cube.prototype.getDomByPos=function(filterJson){
	var arr=[];
	var filterJson=filterJson||{};
	var x=/[\d+]/.test(filterJson.x)?filterJson.x:'all';
	var y=/[\d+]/.test(filterJson.y)?filterJson.y:'all';
	var z=/[\d+]/.test(filterJson.z)?filterJson.z:'all';
	for(var i=0;i<this.boxsDataLength;i++){
		if((this.boxsData[i].x==x||x=='all')&&(this.boxsData[i].y==y||y=='all')&&(this.boxsData[i].z==z||z=='all')){
			arr.push(this.boxsData[i]);
		}
	}
	return arr;
};
//自己写的一个拖拽事件
Cube.prototype.drag=function(obj,fndown,fnmove,fnup){
		if(!obj)return;
		if(arguments.length==2){
			var fnmove=fndown;
			fndown=null;
		}
		var mousedown=function(ev){
			var oEvent = ev||event;
			var oldX = oEvent.clientX;
			var oldY = oEvent.clientY;
			fndown&&fndown();
			var mousemove=function(ev){
				var oEvent = ev||event;
				var newX = oEvent.clientX;
				var newY = oEvent.clientY;
				fnmove&&fnmove(newX-oldX,newY-oldY);
				oldX=newX;oldY=newY;
			};
			document.addEventListener('mousemove',mousemove);

			var mouseup=function(){
				document.removeEventListener('mousemove',mousemove);
				document.removeEventListener('mousemove',mousemove);
				fnup&&fnup();
				obj.releaseCapture&&obj.releaseCapture();
			};
			document.addEventListener('mouseup',mouseup);
			obj.setCapture&&obj.setCapture();
			ev.preventDefault();
		};
		obj.addEventListener('mousedown',mousedown);
	};
//给容器加拖拽事件
Cube.prototype.containerMouseMove=function(){
	var _this=this;
	//默认状态为X,Y旋转0deg
	this.oldRotateX=this.rotateX=this.rotateX||0;
	this.oldRotateY=this.rotateY=this.rotateX||0;
	this.oldRotateZ=this.rotateZ=this.rotateZ||0;

	var scale,scale2;

	this.drag(_this.container,function(){
	},function(dx,dy){
//		_this.oldRotateX=_this.rotateX;
//		_this.oldRotateY=_this.rotateY;
//		_this.oldRotateZ=_this.rotateZ;
		var dydeg=_this.rotateY%360;
		if(dydeg<0){dydeg+=360;}
		if(dydeg>180){dydeg=360-dydeg;}
		scale=(90-(dydeg))/90;
		var dydeg2=_this.rotateY%360;
		if(dydeg2<0){dydeg2+=360;}
		if(dydeg2>270){dydeg2=540-dydeg2;}else if(dydeg2<90){dydeg2=180-dydeg2;}
		scale2=(180-dydeg2)/90;

		_this.rotateY+=(dx*_this.mouseSen);
		_this.rotateX-=(dy*_this.mouseSen*scale);
		if(_this.rotateX>45){_this.rotateX=45;}else if(_this.rotateX<-45){_this.rotateX=-45;}
		_this.rotateZ-=(dy*_this.mouseSen*scale2);
		if(_this.rotateZ>45){_this.rotateZ=45;}else if(_this.rotateZ<-45){_this.rotateZ=-45;}
		_this.container.style.WebkitTransform='perspective(800px) rotateY('+_this.rotateY+'deg) rotateX('+_this.rotateX+'deg) rotateZ('+_this.rotateZ+'deg)';
	});
};
//初始化魔方位子
Cube.prototype.initL=function(){
	this.rotateX=this.rotateY=this.rotateZ=0;
	this.container.style.WebkitTransform='perspective(800px) rotateY('+this.rotateY+'deg) rotateX('+this.rotateX+'deg) rotateZ('+this.rotateZ+'deg)';
};
//设置容器拖拽时候的鼠标灵敏度
Cube.prototype.setMouseSen=function(n){
	this.mouseSen=n;
};

//某一面假定躺着的方向旋转90度后重新配色  for reSetColorByTurnEnd方法
Cube.prototype.trunRightColorChange=function(arr,n){
	if(!arr)return;
	var n=n||1;
	var cacheArr=[];
	var order=this.order;
	var length=arr.length;
	var cacheArr2=arr.slice(0);
	for(var i=0;i<n;i++){
		cacheArr=cacheArr2.slice(0);
		for(var j=0;j<length;j++){
			var dj=(j%order)*order+order-1-parseInt(j/order);
			cacheArr2[j]=cacheArr[dj];
		}
	}
	return cacheArr2;
};

//某一面假定向上下反转 for reSetColorByTurnEnd方法
Cube.prototype.trunTabX=function(arr){
	if(!arr)return;
	var cacheArr=arr.slice(0);
	var order=this.order;
	var length=arr.length;
	var cacheArr2=[];
	for(var i=0;i<length;i++){
		var dj=(order-1-parseInt(i/order))*order+(i%order);
		cacheArr2[i]=cacheArr[dj];
	}
	return cacheArr2;
};

Cube.prototype.trunTabY=function(arr){
	if(!arr)return;
	var cacheArr=arr.slice(0);
	var order=this.order;
	var length=arr.length;
	var cacheArr2=[];
	for(var i=0;i<length;i++){
		var dj=parseInt(i/order)*order+(order-1-i%order);
		cacheArr2[i]=cacheArr[dj];
	}
	return cacheArr2;
};

//拧后重新设定颜色，，for trun方法
Cube.prototype.reSetColorByTurnEnd=function(coor,num,dir){
	var nums=[];
	var order=this.order;
	var Morder=order*order;
	var name=['上','下','左','右','前','后'];
	for(var i=0;i<order;i++){nums.push(i);}
	var color0=this.colors[0].slice(0);
	var color1=this.colors[1].slice(0);
	var color2=this.colors[2].slice(0);
	var color3=this.colors[3].slice(0);
	var color4=this.colors[4].slice(0);
	var color5=this.colors[5].slice(0);
//	console.log(color0);
//	console.log(color1);
//console.log(2)
//	console.log(color2);
//console.log(4)
//	console.log(color4);
//console.log(3)
//	console.log(color3);
//console.log(5)
//	console.log(color5);
		switch(coor){
			case 'x':
				if(dir){
					for(var i=0;i<this.order;i++){
						var n=Number(num)+order*i;
						this.colors[0][n]=color4[n];
						this.colors[4][n]=this.trunTabX(color1)[n];
						this.colors[1][n]=color5[n];
						this.colors[5][n]=this.trunTabX(color0)[n];
					}
					//左转动
					if(num==0){
						this.colors[2]=this.trunRightColorChange(this.colors[2],3);
					}
					if(num==order-1){
						this.colors[3]=this.trunRightColorChange(this.colors[3],3);
					}
				}else{
					for(var i=0;i<this.order;i++){
						var n=Number(num)+order*i;
						this.colors[4][n]=color0[n];
						this.colors[1][n]=this.trunTabX(color4)[n];
						this.colors[5][n]=color1[n];
						this.colors[0][n]=this.trunTabX(color5)[n];
					}
					//左转动
					if(num==0){
						this.colors[2]=this.trunRightColorChange(this.colors[2],1);
					}
					if(num==order-1){
						this.colors[3]=this.trunRightColorChange(this.colors[3],1);
					}
				}
			break;
			case 'y':
				if(dir){
					for(var i=0;i<this.order;i++){
						var m=Number(num)+order*i;
						var n=Number(num)*order+i;
						this.colors[4][n]=this.trunTabY(this.trunRightColorChange(color2,3))[n];
						this.colors[3][m]=this.trunRightColorChange(color4,1)[m];
						this.colors[5][n]=this.trunRightColorChange(this.trunTabY(color3),1)[n];
						this.colors[2][m]=this.trunRightColorChange(color5,1)[m];
					}
					//上转动
					if(num==0){
						this.colors[0]=this.trunRightColorChange(this.colors[0],1);
					}
					//下转动
					if(num==order-1){
						this.colors[1]=this.trunRightColorChange(this.colors[1],1);
					}
				}else{
					for(var i=0;i<this.order;i++){
						var n=Number(num)+order*i;
						var m=Number(num)*order+i;
						this.colors[2][n]=this.trunTabY(this.trunRightColorChange(color4,3))[n];
						this.colors[4][m]=this.trunRightColorChange(color3,3)[m];
						this.colors[3][n]=this.trunRightColorChange(this.trunTabY(color5),1)[n];
						this.colors[5][m]=this.trunRightColorChange(color2,3)[m];
					}
					//上转动
					if(num==0){
						this.colors[0]=this.trunRightColorChange(this.colors[0],3);
					}
					//下转动
					if(num==order-1){
						this.colors[1]=this.trunRightColorChange(this.colors[1],3);
					}
				}
			break;
			case 'z':
				if(dir){
					for(var i=0;i<this.order;i++){
						var m=Number(num)*order+i;;
						this.colors[0][m]=this.trunTabY(color2)[m];
						this.colors[2][m]=color1[m];
						this.colors[1][m]=this.trunTabY(color3)[m];
						this.colors[3][m]=color0[m];
					}
					//后转动
					if(num==0){
						this.colors[5]=this.trunRightColorChange(this.colors[5],3);
					}
					//前转动
					if(num==order-1){
						this.colors[4]=this.trunRightColorChange(this.colors[4],3);
					}
				}else{
					for(var i=0;i<this.order;i++){
						var m=Number(num)*order+i;;
						this.colors[2][m]=this.trunTabY(color0)[m];
						this.colors[1][m]=color2[m];
						this.colors[3][m]=this.trunTabY(color1)[m];
						this.colors[0][m]=color3[m];
					}
					//后转动
					if(num==0){
						this.colors[5]=this.trunRightColorChange(this.colors[5],1);
					}
					//前转动
					if(num==order-1){
						this.colors[4]=this.trunRightColorChange(this.colors[4],1);
					}
				}
			break;
		}
	this.setColor(this.colors);
};
//设置魔法拧动一次的时长 毫秒
Cube.prototype.setOneTime=function(n){
	this.oneTime=n;
};
//设置魔方批量拧动时的一次时长 毫秒
Cube.prototype.setOneTimeBatch=function(n){
	this.oneTimeBatch=n;
};


//设置魔方操作  参数 轴XYZ 第几排 顺/逆时针 旋转完成后
Cube.prototype.turn=function(coor,num,dir,fnComplete){
	//阻止多次点击
	this.runing=this.runing||false;
	if(this.runing)return;
	var num=num||0;
	if(num>this.order-1)return;
	this.runing=true;
	if(dir==false){var dir=false}else{var dir=true};//true代表正向
	//累计步数
	this.foots++;
	//找到操作的元素
	var filter={};
	filter[coor]=num;
	var dom=this.seletDoms=this.getDomByPos(filter);
	//添加动作
	var n=0;//记录转动完成的数
	var domLength=dom.length;
	var _this=this;
	function transend(){
		this.removeEventListener('transitionend',transend,false);
		this.style.transition='none';
		n++;
		if(n==domLength){
		//全部旋转完成后
			//调整颜色
			_this.reSetColorByTurnEnd(coor,num,dir);
			//位置回归
			for(var i=0;i<domLength;i++){
				dom[i].dom.style.WebkitTransform='rotateZ(0deg) rotateY(0deg) rotateX(0deg)  translateZ('+dom[i].translateZ+'px) translate('+dom[i].translateX+'px,'+dom[i].translateY+'px)';
			}
			_this.runing=false;
			fnComplete&&fnComplete();
		}
	}
	for(var i=0;i<domLength;i++){
		dom[i].dom.style.transition=this.oneTime/1000+'s all ease';
		//改变ROTATE
		var drx=0,dry=0,drz=0;//默认全部旋转的0度
		var dirNumber=dir?1:-1;
		switch(coor){
			case 'x':drx=90*dirNumber;break;
			case 'y':dry=90*dirNumber;break;
			case 'z':drz=90*dirNumber;break;
		}
		dom[i].dom.addEventListener('transitionend',transend,false);
		dom[i].dom.style.WebkitTransform='rotateZ('+drz+'deg) rotateY('+dry+'deg) rotateX('+drx+'deg)  translateZ('+dom[i].translateZ+'px) translate('+dom[i].translateX+'px,'+dom[i].translateY+'px)';
	}
};

//设置3阶魔方的简易操作 type  为 u,d,l,r,f,b,u',d',l',r',f',b'
Cube.prototype.turn3=function(type,fnComplete){
	if(this.order!=3)return;
	var fnComplete=fnComplete||function(){};
	var json={u:{'coor':'y',num:0,dir:true},
			u_:{'coor':'y',num:0,dir:false},
			d:{'coor':'y',num:2,dir:true},
			d_:{'coor':'y',num:2,dir:false},
			l:{'coor':'x',num:0,dir:true},
			l_:{'coor':'x',num:0,dir:false},
			r:{'coor':'x',num:2,dir:true},
			r_:{'coor':'x',num:2,dir:false},
			f:{'coor':'z',num:2,dir:true},
			f_:{'coor':'z',num:2,dir:false},
			b:{'coor':'z',num:0,dir:true},
			b_:{'coor':'z',num:0,dir:false}
			};

	var obj=json[type.replace('\'','_')];
	obj&&this.turn(obj.coor,obj.num,obj.dir,fnComplete);
};

//设置三阶魔方的批量操作 type 例如 uu'rr'bb'
Cube.prototype.turn3s=function(type,fnComplete){
	var type=type.replace(' ','');
	var arr=type.match(/\w\'?/g);
	var length=arr.length;
	var now=0;
	var _this=this;
	var time=this.oneTime;
	this.oneTime=this.oneTimeBatch;
	function dg(){
		_this.turn3(arr[now],function(){
			now++;
			if(now<length){
				var timeout=setTimeout(function(){
					clearTimeout(timeout);
					dg();
				},0);
			}else{
				_this.oneTime=time;
				fnComplete&&fnComplete();
			}
		});
	}
	if(length>0){dg();};
};

Cube.prototype.getFoots=function(){
	return this.foots;
};

//获取两个整数数之间的随机整数数 包含a，不包含b  for random方法
Cube.prototype.getRandom=function(a,b){
	return parseInt(a+Math.random()*(b-a));
};

//随机打乱的方法，参数为随机打乱的步数。默认30
Cube.prototype.random=function(n){
	var _this=this;
	var n=n||30;
	var i=0;
	var speed=this.oneTime;
	var order=this.order;
	var coors=['x','y','z'];
	var linshi=parseInt(1000/n);
	this.oneTime=linshi<50?50:linshi;
	function turn_random(){
		i++;
		if(i>n){
			_this.oneTime=speed;
		}else{
			var coor=coors[_this.getRandom(0,3)];
			var num=_this.getRandom(0,order);
			var dir=_this.getRandom(0,2);
			_this.turn(coor,num,dir,function(){
				var timeout=setTimeout(function(){
					clearTimeout(timeout);
					turn_random();
				},0);
			})
		}
	}
	turn_random();
};
