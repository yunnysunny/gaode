var map = null;
var defaultLevel = 11;

var $ = SJS['$'];
var addLoadEvent = SJS['addLoadEvent'];
var hasClassName = SJS['hasClassName'];
var addClass = SJS['addClass'];
var removeClass = SJS['removeClass'];
var show = SJS['show'];
var hide = SJS['hide'];
var getElementsByClassName = SJS['getElementsByClassName'];
var log = SJS['log'];
var isMobile = (navigator.userAgent.toLowerCase().indexOf('mobile') != -1);
//alert(isMobile);
var longitude = 116.404;
var latitude = 39.915;
var selectedCity = '北京市';

function showArea() {				
	$('showArea').onclick = function() {
		if ($('area').style.display == 'block')
		{
			hide($('area'));
			this.innerHTML = '[切换地区]';					
		}
		else 
		{
			show($('area'));
			this.innerHTML = '[隐藏]';
		}
		return false;
	}
	/**
	* @param 父级区域的节点
	* @param 子级区域容器的ID
	* @param 需要处理的子级区域的className
	*/
	function showSubArea(parentAreaObj,subAreaDiv,subAreaClass) {
		parentAreaObj.onclick = function() {
			hide($('districts'));
			if (subAreaDiv == 'districts')
			{
				selectedCity = parentAreaObj.innerHTML;
			}
			if (!hasClassName(parentAreaObj.className,'clicked'))//以前没有点击过
			{
				addClass(parentAreaObj,"clicked");
			}
			var subArea = $(subAreaDiv); 
			show(subArea);

			var parentId = parentAreaObj.getAttribute('id');
			getElementsByClassName(subArea,'span',subAreaClass).each(function() {
				var subAreaNow = this;
				//alert(subAreaNow.getAttribute('id'));
				if (hasClassName(subAreaNow.className,parentId))
				{
					show(subAreaNow,'inline');
				}
				else
				{
					hide(subAreaNow);
				}
			});
		}
	}
	if (isMobile)
	{
		getElementsByClassName($('toolbar'),'span,img,div,input','tool').each(function() {				
			$('toolbar').removeChild(this);
		});
		///$('searchTip').style.fontSize = '12px';
	}
	
	getElementsByClassName($('provinces'),'span','province').each(function() {//省的响应事件				
		showSubArea(this,'citys','city');				
	});
	getElementsByClassName($('citys'),'span','city').each(function() {//市的响应事件
		showSubArea(this,'districts','district');
	});
	getElementsByClassName($('districts'),'span','district').each(function() {//县的响应事件
		var obj = this;
		obj.onclick = function() {
			var longitude = obj.getAttribute('long');
			var latitude = obj.getAttribute('lat');
			var point = new AMap.LngLat(longitude, latitude); // 创建点坐标  
			map.setZoomAndCenter(17,point);
			$('cityNow').innerHTML = selectedCity;
			log.info('selected city now:' + selectedCity);
			
			if (!hasClassName(obj.className,'clicked'))
			{
				addClass(obj,'clicked');
			}
			//$('cityNow').innerHTML = obj.innerHTML;
		}				
	});

	show($('toolbar'));
	log.info('[showArea] end');
}

function initMap(longitudeNow, latitudeNow) {

	var opt = {  
		level:defaultLevel,//设置地图缩放级别  
		center:new AMap.LngLat(longitudeNow,latitudeNow),//设置地图中心点     
		doubleClickZoom:true,//双击放大地图  
		scrollwheel:false//鼠标滚轮缩放地图  
	}  
	map = new AMap.Map("container",opt);

	map.plugin(["AMap.ToolBar","AMap.OverView,AMap.Scale"],function(){
		//加载工具条  
		var tool = new AMap.ToolBar({  
			autoPosition:false//禁止自动定位  
		});  
		map.addControl(tool);      
		//加载鹰眼
		view = new AMap.OverView({visible:false});
		map.addControl(view);
		var scale = new AMap.Scale();  
		map.addControl(scale);     
	});

	addMapFunction();	//添加地图监听函数
}
function addMapFunction() {	

	$('search').onclick = function() {	
		var keywords;
		if (!isMobile)
		{
			keywords = $('searchArea').value;
		
			log.info('search');
		}
		else
		{			
			keywords = prompt('请输入查询地点');			
		}
		if (keywords)
		{
			var PoiSearchOption = {  
				srctype:"POI",//数据来源  
				type:"",//数据类别  
				number:10,//每页数量,默认10  
				batch:1,//请求页数，默认1  
				range:3000, //查询范围，默认3000米  
				ext:""//扩展字段  
            };
			var MSearch = new AMap.PoiSearch(PoiSearchOption);  
			MSearch.byKeywords(keywords,selectedCity,keywordSearch_CallBack);  
		}
	}

	var resultCount=10;  
    var marker = new Array();  
    var windowsArr = new Array();  
    function addmarker(i,d){  
        var markerOption = {  
			icon:"http://api.amap.com/webapi/static/Images/"+(i+1)+".png",  
			position:new AMap.LngLat(d.x,d.y)  
		};            
		var mar =new AMap.Marker(markerOption);  
		mar.id=(i+1);  
		var infoWindow = new AMap.InfoWindow  
		({  
			content:"<h3><font color=\"#00a6ac\">&nbsp;&nbsp;"+(i+1) + ". "+ d.name +"</font></h3>"+TipContents(d.type,d.address,d.tel),  
			size:new AMap.Size(300,0),
			autoMove:true//设置自动调整信息窗口至视野范围 
		});  
		windowsArr.push(infoWindow);  
		map.addOverlays(mar);  
		var aa=function(e){infoWindow.open(map,mar.getPosition());};  
		map.bind(mar,"click",aa);  
	}  
	function keywordSearch_CallBack(data){  
		var resultStr="";  
        if(data.status=="E0")  
        {  
			resultCount=data.list.length;  
			for (var i = 0; i < data.list.length; i++) {  
			   resultStr += "<div id='divid"+(i+1)+"' onmouseover='openMarkerTipById1("+(i+1)+",this)' onmouseout='onmouseout_MarkerStyle("+(i+1)+",this)' style=\"font-size: 12px;cursor:pointer;padding:0px 0 4px 2px; border-bottom:1px solid #C1FFC1;\"><table><tr><td><img src=\"http://api.amap.com/webapi/static/Images/"+(i+1)+".png\"></td>"+"<td><h3><font color=\"#00a6ac\">名称: "+data.list[i].name+"</font></h3>";  
				resultStr += TipContents(data.list[i].type,data.list[i].address,data.list[i].tel)+"</td></tr></table></div>";  
				addmarker(i,data.list[i]);            
			} 
                    
         	map.setFitView();
                    
         }  
        else if(data.status =="E1")  
        {  
             resultStr = "未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。";     
        }  
        else  
        {  
             resultStr= "错误信息："+data.state;  
        }  
		document.getElementById("result").innerHTML = resultStr;  
    }  
    function TipContents(type,address,tel){  
        if (type == "" || type == "undefined" || type == null || type == " undefined" || typeof type == "undefined") {  
            type = "暂无";  
        }  
        if (address == "" || address == "undefined" || address == null || address == " undefined" || typeof address == "undefined") {  
            address = "暂无";  
        }  
        if (tel == "" || tel == "undefined" || tel == null || tel == " undefined" || typeof address == "tel") {  
            tel = "暂无";  
        }  
        var str ="&nbsp;&nbsp;地址：" + address + "<br />&nbsp;&nbsp;电话：" + tel + " <br />&nbsp;&nbsp;类型："+type;  
        return str;  
    }  
    function openMarkerTipById1(pointid,thiss){  //根据id打开搜索结果点tip  
        thiss.style.background='#CAE1FF';  
        map.openInfoWindow(pointid,windowsArr[pointid-1]);  
    }  
    function onmouseout_MarkerStyle(pointid,thiss) { //鼠标移开后点样式恢复  
       thiss.style.background="";  
    }  
		
}	
function resizeLayout() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;

	var con = $('container');
	con.style.height = (windowHeight*0.87) + 'px';
	con.style.width = windowWidth + 'px';
}
function loadMap() {
	resizeLayout();
	initMap(longitude,latitude);
}
window.onresize = function() {
	resizeLayout();
	resizeLayout();
}
addLoadEvent(loadMap);
addLoadEvent(showArea);	
