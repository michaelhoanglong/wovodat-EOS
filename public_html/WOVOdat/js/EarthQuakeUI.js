
/**
* Store every javaScript functions to draw Earthquakes for php file
/*Created by Luis Ngo - 21/2/2016
*/

 
 var earthquakes = {};
 var eruptions = {};
/*
 * Object to store the queried array of data for the 3D display
 */
var gmt3DData = {};
var gmt2DData = {};
// store reference to the plotted graphs in the equake section
// this variable will help us when we need to do the printing
var equakeGraphs = [];
// left graphs
equakeGraphs[1] = {};
// right graphs
equakeGraphs[2] = {};
// the google maps (for both Time Series view and Compare Volcano view
var map=[];
// the list of station for each station type
var stationsDatabase = {};
// the list of station for each station type - The second volcano - in Compare Volcano view
var compStationsDatabase = {};
// the markers and infowindows for volcano stations
var markers = [],infoWindows = [];

//All information of the loaded volcano
var volcanoInfo = {};
// this link to all the plotted graph
var graphs = [];

// the variable store the reference to the overview graph
var overviewGraph;
// these marks will show the eruption start time 
// eruptions data
var eruptionsData = {};
eruptionsData.compEruptions = [];
// reference data to since between various graphs
var referenceTime = null;
// full details scaled data


var totalGraph = [];
var graphCount = [];

var ccMap = new Map();
var eqMap = new Map();

 /**
 * Draw the equake graphs under the equake panels
 */
  
function drawEquake(o){
	hideMarkers(o);

	var source = o.source;
	var id = source.id;
	$("#twoDEquakeFlotGraph" + o.mapUsed).hide();
	$("#2DGMTEquakeGraph" + o.mapUsed).hide();
	$("#3DGMTEquakeGraph" + o.mapUsed).hide();
	if(id.indexOf('3D') >0)
		drawEquake3DGMT(o);
	else if(id.indexOf('2DGMT') >0)
		drawEquake2DGMT(o);
	else drawEquake2D(o);
	if(document.getElementById("Map") != null){
		//map[o.mapUsed].setZoom(10);
		map[o.mapUsed].setCenter(map[o.mapUsed].centerPoint);	
		var size = parseInt($("#wkm"+o.mapUsed).val()*1000);
		var bound = calcBounds(new google.maps.LatLng(map[o.mapUsed].centerPoint.lat(),map[o.mapUsed].centerPoint.lng()), {width: size * 2, height: size * 2});
		map[o.mapUsed].fitBounds(bound);
	}
	
}

/**
 * Help function to draw equake in 2 dimensions using Flot
 */
function drawEquake2D(o){
	//console.log("DRAW 2D");
	var cavw = volcanoInfo[o.mapUsed].cavw;
	var mapUsed = o.mapUsed;
	if (!earthquakes[cavw]){
		Wovodat.loadEarthquakes({
			numberOfEvents: $("#Evn"+mapUsed).val(),
			mapUsed: mapUsed,
			volInfo: volcanoInfo[mapUsed],
			handlers: [insertMarkersForEarthquakes,plotEarthquakeData]
		});
	}
	else{
		insertMarkersForEarthquakes("",cavw,mapUsed);
		plotEarthquakeData(cavw,mapUsed);
	}  

	if (!eruptions[cavw]){
		Wovodat.loadEruptions({
			vd_id: cavw,
			handlers: insertEruptionsForEarthquakes
		});
	}
}

/**
 * Draw the earthquakes around the volcano displayed in the
 * map in two dimensions. This function is using GMT to draw the map in case
 * the user don't have access to googel map
 */
function drawEquake2DGMT(o){
	var mapUsed = o.mapUsed;

	var cavw = volcanoInfo[mapUsed].cavw;
	var volName = volcanoInfo[mapUsed].volName;                  //Nang added   
	var vlat = volcanoInfo[mapUsed].lat;                         //Nang added
	var vlon = volcanoInfo[mapUsed].lon;                         //Nang added               

	var id = o.source.id;

	if(gmt2DData[cavw] == undefined){
		Wovodat.get2DGMTMap({
			cavw: cavw,
			qty: document.getElementById('Evn' + mapUsed).value,
			date_start: document.getElementById('SDate' + mapUsed).value,
			date_end: document.getElementById('EDate' + mapUsed).value,
			dr_start: document.getElementById('DepthLow' + mapUsed).value,
			dr_end: document.getElementById('DepthHigh' + mapUsed).value,
			eqtype: document.getElementById('EqType' + mapUsed).value,
			wkm: document.getElementById('wkm' + mapUsed).value,   // Nang added
			vname:volName,                         // Nang added
			vlat:vlat,                             //Nang added
			vlon:vlon,                             //Nang added  
			errorbar: document.getElementById('errorbars'+mapUsed).checked,               
			//Only 3D GMT needs these two degree & init_azim.               
			//  degree: document.getElementById('degree' + mapUsed).value, 
			//  init_azim: document.getElementById('azim' + mapUsed).value,         

			handler: function(ar){
				gmt2DData[cavw] = ar; 
				show2DGMT(ar, mapUsed);
			}
		});
	
	}else{
		show2DGMT(gmt2DData[cavw], mapUsed);
	}
	
	if (!earthquakes[cavw]){
		Wovodat.loadEarthquakes({
			numberOfEvents: document.getElementById('Evn' + mapUsed).value,
			mapUsed: o.mapUsed,
			volInfo: volcanoInfo[o.mapUsed],
			handlers: [insertMarkersForEarthquakes]
		});
	}
	else{
		insertMarkersForEarthquakes("",cavw,o.mapUsed);
	}
}

/**
*
*/
function show2DGMT(ar, mapUsed){
	var directory = ar['directory'];
	var placeholder = document.getElementById('2DGMTEquakeGraph' + mapUsed);
	$("#imageLink",placeholder).attr('href',directory + "/" + ar['imageSrc']);
	$("#image",placeholder).attr('src',directory + "/" + ar['imageSrc']);
	$("#gifImage",placeholder).attr('href',directory + "/" + ar['imageSrc']);
	$("#gmtScriptFile",placeholder).attr('href',ar['gmtScriptFile']);
	if(getSelectedEquakesButton(mapUsed) == 2)
		placeholder.style.display = "block";
}

/**
 * Draw the earthquakes around the volcano displayed in the
 * map in three dimensions. This function is using GMT to draw the map in case
 * the user don't have access to googel map.
 * 
 */
function drawEquake3DGMT(o){
	var mapUsed = o.mapUsed;
	var cavw = volcanoInfo[mapUsed].cavw;

	var volName = volcanoInfo[mapUsed].volName;         //Nang added 
	var vlat = volcanoInfo[mapUsed].lat;                //Nang added
	var vlon = volcanoInfo[mapUsed].lon;                //Nang added                

	if(gmt3DData[cavw] == undefined){
		Wovodat.get3DMap({
			cavw: cavw,
			qty: document.getElementById('Evn' + mapUsed).value,                    
			date_start: document.getElementById('SDate' + mapUsed).value,
			date_end: document.getElementById('EDate' + mapUsed).value,
			dr_start: document.getElementById('DepthLow' + mapUsed).value,
			dr_end: document.getElementById('DepthHigh' + mapUsed).value,
			eqtype: document.getElementById('EqType' + mapUsed).value,
			wkm: document.getElementById('wkm' + mapUsed).value,   // Nang added    
			vname:volName,                // Nang added
			vlat:vlat,                    //Nang added
			vlon:vlon,                    //Nang added                                  
			degree: document.getElementById('degree' + mapUsed).value,
			init_azim: document.getElementById('azim' + mapUsed).value,
			handler: function(ar){
				gmt3DData[cavw] = ar; 
				show3DGMT(ar, mapUsed);
			}
		});
	}else{
		show3DGMT(gmt3DData[cavw], mapUsed);
	}
	if (!earthquakes[cavw]){
		Wovodat.loadEarthquakes({
			numberOfEvents: document.getElementById('Evn' + mapUsed).value,
			mapUsed: o.mapUsed,
			volInfo: volcanoInfo[o.mapUsed],
			handlers: [insertMarkersForEarthquakes]
		});
	}
	else{
		insertMarkersForEarthquakes("",cavw,o.mapUsed);
	}
}

/**
 * Private function to help putting the 3D images and information
 * on the equake panel
 * This function will set the image , add the function for the 
 */
function show3DGMT(ar, mapUsed){
	function padding(value){
		value = value + "";
		var l = value.length;
		l = 6 - l;
		while(l > 0){
			value = "0" + value;
			l--;
		}
		return "/frame_" + value + ".jpg";
	}
	var placeholder = $('#3DGMTEquakeGraph' + mapUsed);
	var numberOfImages = ar['numberOfImages'];
	var imageLink = ar['directory'] + '/frame_000000.jpg';
	var currentLink = 0;
	$("#3DImage #title",placeholder).html(ar['title']);
	$("#3DImage #image",placeholder).attr('src',imageLink);
	$("#3DImage #imageLink",placeholder).attr('href',imageLink);
	
	// clear previous registered handlers
	$("#showAnimation",placeholder).unbind('click');
	$("#previousButton",placeholder).unbind('click');
	$("#nextButton",placeholder).unbind('click');
	
	// add handlers for navigation button
	$("#showAnimation",placeholder).click(function(){
		$("#3DImage #image",placeholder).attr('src',ar['animationImage']);
		$("#3DImage #imageLink",placeholder).attr('href',ar['animationImage']);
	});
	$("#previousButton",placeholder).click(function(){
		currentLink = (currentLink - 1 + numberOfImages) % numberOfImages;
		$("#3DImage #image",placeholder).attr('src',ar['directory'] + padding(currentLink));
		$("#3DImage #imageLink",placeholder).attr('href',ar['directory'] + padding(currentLink));
	});
	$("#nextButton",placeholder).click(function(){
		currentLink = (currentLink + 1 + numberOfImages) % numberOfImages;
		$("#3DImage #image",placeholder).attr('src',ar['directory'] + padding(currentLink));
		$("#3DImage #imageLink",placeholder).attr('href',ar['directory'] + padding(currentLink));
	});
	
	
	$("#gifImage",placeholder).attr('href',ar['animationImage']);
	$("#gmtScriptFile",placeholder).attr('href',ar['gmtScriptFile']);
	if(getSelectedEquakesButton(mapUsed) == 3)
		placeholder.show();
}

 /**
 * Insert markers for earthquakes
 * This function will also show the marker of earthquake event in the
 * Google map of either mapUsed
 * Author: Tran Thien Nam
 * 2012-07-19
 */
function insertMarkersForEarthquakes(data,cavw,mapUsed){
	// the function will initialize the earthquake variable when 
	// there is no equake data stored at the client side for a
	// specific volcano.
	var catalogOwner = new Set();
	var eqTypeSet = new Set(); //vutuan added to store the cc_id of earthquakes
	
	if (!earthquakes[cavw]){
		earthquakes[cavw]={};
		// the latitude and longitude of the volcano that this earthquake surround
		earthquakes[cavw]['vlat']=volcanoInfo[mapUsed]['lat'];
		earthquakes[cavw]['vlon']=volcanoInfo[mapUsed]['lon'];
		var equakeSet = {};
		var vlat = volcanoInfo[mapUsed]['lat'];
		var vlon = volcanoInfo[mapUsed]['lon'];
		equakeSet = data.split(";");
		// eliminate the empty elements at the end of the ajax data
		while (equakeSet[equakeSet.length-1] == " ")
			equakeSet.length--;

		var index,nextQuake,lat,lon,depth,mag,time,type,id;
		var total1 = 0;
		var total2 = 0;

		for (var i in equakeSet){
			total1++;
			index = Wovodat.trim(equakeSet[i]);
			if (earthquakes[cavw][index] != undefined){
				//console.log(earthquakes[cavw][index] + " " + index);
			}
			nextQuake = index.split(",");
			lat = nextQuake[0];
			lon = nextQuake[1];
			depth = nextQuake[2];
			mag = nextQuake[3];
			time = nextQuake[4];
			type = nextQuake[5];
			id = nextQuake[6]; // Catalog owner cc_id
			
			//newly added for error bars
			herr = nextQuake[7];
			xerr = nextQuake[8];
			yerr = nextQuake[9];
			derr = nextQuake[10];
			rms = nextQuake[11];

			// ignore earthquakes that have no information on depth and/or magnitude
			if (depth == "" || typeof depth=="undefined" || mag=="" || typeof mag=="undefined"){
				console.log("problem event " + index)
				continue;
			}
				
			// ignore earthquakes that have no information on type and/or the owner
			// if (type == "" || typeof type=="undefined" || id=="" || typeof id=="undefined")
			if (id=="" || typeof id=="undefined"){
				console.log("problem event " + index)
				continue;
			}
				
			// //vutuan added
			if(id != undefined && id != "")
				catalogOwner.add(id);
			// if(type != undefined && type != "")
				eqTypeSet.add(type);
			// store the quake data in the earthquakes[cavw] object
			var result = Wovodat.calculateD(lat, lon, vlat, vlon);

			earthquakes[cavw][index]=[];
			earthquakes[cavw][index]['eqtype'] = type;
			earthquakes[cavw][index]['lat']=lat;
			earthquakes[cavw][index]['lon']=lon;
			earthquakes[cavw][index]['time']=time;
			earthquakes[cavw][index]['available'] = 0;
			earthquakes[cavw][index]['mag']=mag;
			earthquakes[cavw][index]['depth']=depth;
			earthquakes[cavw][index]['distance'] = result[0];
			earthquakes[cavw][index]['latDistance'] = result[2];
			earthquakes[cavw][index]['lonDistance'] = result[1];
			earthquakes[cavw][index]['timestamp'] = Wovodat.convertDate(time);
			earthquakes[cavw][index]['cc_id'] = id; // add cc_id attribute to earthquakes object - vutuan

			// for error bars
			earthquakes[cavw][index]['herr'] = herr;
			earthquakes[cavw][index]['xerr'] = xerr;
			earthquakes[cavw][index]['yerr'] = yerr;
			earthquakes[cavw][index]['derr'] = derr;
			earthquakes[cavw][index]['rms'] = rms;
			total2++;
		}
		console.log('total1 ' + total1);
		console.log('total2 ' + total2);
		var counter = 0;
		for (var i in earthquakes[cavw]) {
			counter += 1;
		}
		counter -= 2;
		console.log(counter);
		displayElement(catalogOwner,mapUsed,'cc_id');
		displayElement(eqTypeSet,mapUsed,'EqType');
		insertMarkersForEarthquakes(null,cavw,mapUsed);
	}
	else{
		// if we already had the cached data, just display it in the specific 
		// map
		initializeFilter(earthquakes[cavw],mapUsed);
		var marker,count = 1;
		filterData(cavw,mapUsed);
		var nEvent = $('#Evn' + mapUsed).val();
		//console.log(earthquakes[cavw]);
		for (var i in earthquakes[cavw]){
			if(!isNaN(nEvent) && count > nEvent){
				break;
			} 
			if(earthquakes[cavw][i]!=undefined){
				if (earthquakes[cavw][i]['available'] == 2 && filter(cavw,mapUsed,i)){
					marker = createMarker(earthquakes[cavw][i],mapUsed);
					earthquakes[cavw][i]['marker' + mapUsed] = marker;
				}
				else if(typeof earthquakes[cavw][i]['marker' + mapUsed] != "undefined"){
					earthquakes[cavw][i]['marker' + mapUsed].setMap(null);
				}
			}
			count++;   
		}
		var a = document.getElementById('showHideMarkers' + mapUsed);
		$(a).unbind('click');
		$(a).html("Hide earthquake");
		$(a).click(function(){
			hideMarkers({mapUsed:mapUsed,button:a}); 
		});
	}   
}

function insertEruptionsForEarthquakes(data,cavw){	
	if (!eruptions[cavw]){
		eruptions[cavw]={};

		var eruptionSet = {};
		eruptionSet = data.split(";");
		//eliminate the empty elements at the end of the ajax data
		while (eruptionSet[eruptionSet.length-1] == " ")
			eruptionSet.length--;

		var nextEruption, index, code, stime;

		for (var i in eruptionSet){
			index = Wovodat.trim(eruptionSet[i]);
			if (eruptions[cavw][index] != undefined){
				//console.log(earthquakes[cavw][index] + " " + index);
			}
			nextEruption = index.split("&");
			code = nextEruption[0];
			stime = nextEruption[1];

			if (stime != "" && stime != undefined){
				eruptions[cavw][index]=[];
				eruptions[cavw][index]['code'] = code;
				eruptions[cavw][index]['stime']= stime;
			}						
		}
	}
}

/**
*Display Element
*/
 function displayElement(set,mapUsed,element){
 	var catalogString = "";
	var html="";
	var tableName = element+mapUsed;
	var table = document.getElementById(tableName);
	var tableRows = table.getElementsByTagName('tr');
	var numberOfRows = tableRows.length;
	var i = 1;
	var tableId;
	if(element === 'cc_id') tableId = 1;
	else tableId = 2;
	set.forEach(function(value){
		var checkBoxId = tableName + 'CheckBox' + i;
		var row = table.insertRow(numberOfRows);
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var clickString = "onClick='untoggle(this,"+tableId+","+mapUsed+")'";
		cell1.innerHTML = "<input type='checkbox'"+ clickString +
		" name='" + tableName +"' value='" + value + "' id='" + checkBoxId + "' checked/>";
		var name = nameConverter(value,element);
		cell2.innerHTML = name;
		if(element === 'cc_id'){
			catalogString += name;
			catalogString += ", ";
		}
		numberOfRows++;
		i++;
	});
	var owners = document.getElementById('owner'+mapUsed);
	if(owners.innerHTML.length < 1) // prevent caching
		owners.innerHTML = "Catalog owners: " + catalogString;
}


/**
* Create maker
*/
function createMarker(equakeObj,mapUsed){
	var mag,depth,size,icon,lat,lon,marker,time;
	mag = equakeObj['mag'];
	depth = equakeObj['depth'];
	size = getSizeOfEquake(mag);
	icon = createMarkerIcon(depth,size);
	lat = equakeObj['lat'];
	lon = equakeObj['lon'];
	time = equakeObj['time'];
	// set marker
	marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat,lon),
		icon:icon,
		map: map[mapUsed]
	});
	var contentText = "<table><tr><td><b>Lat</b> </td><td>" + 
		lat + "</td></tr><tr><td><b>Lon</b></td><td>" + 
		lon + "</td></tr><tr><td><b>Time</b></td><td>" + 
		time + "</td></tr><tr><td><b>Depth</b></td><td>" + 
		depth + "</td></tr><tr><td><b>Magnitude</b></td><td>" 
		+ mag+"</td></tr></table>";
	// create tooltip
	new Tooltip({marker:marker,content:contentText,cssClass:"earthquakeTooltip"});
	return marker;
}
/*
 * hide all the markers when user closes the Earthquakes panel section
 * This function is accomplished by setting the map of each pointer
 * to null value
 */
 
function hideMarkers(o){
	var mapUsed = o.mapUsed;
	if(volcanoInfo[mapUsed] == undefined) return;
	var cavw = volcanoInfo[mapUsed].cavw;
	var currentEquakeSet = [];
	for (var i in earthquakes[cavw])
		if (typeof earthquakes[cavw][i]['marker' + mapUsed] != "undefined"){
			if(earthquakes[cavw][i]['marker' + mapUsed].getMap() != null){
				currentEquakeSet.push(earthquakes[cavw][i]['marker' + mapUsed]);
				earthquakes[cavw][i]['marker' + mapUsed].setMap(null);
			}
	}
	var button = o.button;
	$(button).unbind('click');
	$(button).html("Show earthquake");
	$(button).click(function(){
		_showMarkers(this);
	});
	function _showMarkers(o){
		$(o).html('Hide earthquake');
		var l = currentEquakeSet.length;
		for(var i = 0 ; i < l ; i++){
			currentEquakeSet[i].setMap(map[mapUsed]);
		}
		$(o).unbind('click');
		$(o).click(function(){
			_hideMarkers(o);
		});
	}
	function _hideMarkers(o){
		$(o).html('Show earthquake');
		var l = currentEquakeSet.length;
		for(var i = 0 ; i < l ; i++){
			currentEquakeSet[i].setMap(null);
		}
		$(o).unbind('click');
		$(o).click(function(){
			_showMarkers(o);
		});
	}
}

/*
 * Get the current selected button in the list of button for earth quakes
 * 1: 2D
 * 2: 2DGMT
 * 3: 3DGMT
 * 4: No button is selected
 */
function getSelectedEquakesButton(mapUsed){
	var tempElement = document.getElementById('EquakePanel' + mapUsed);
	if(tempElement == undefined) return;
	tempElement = $(".equakeButtonsRow",tempElement);
	if(tempElement == undefined) return;
	tempElement = tempElement[0];
	if(tempElement == undefined) return;
	tempElement = $("label",tempElement);
	if(tempElement == undefined) return;
	var tempElements = tempElement;
	var i = 0, length = tempElements.length;
	var className;
	for(i = 0 ; i < length; i++){
		tempElement = tempElements[i];
		className = tempElement.className;
		if(className.match(/equakeDisplayButtonChecked/))
			break;
	}
	return i + 1;
}

/**
vutuan added to display info of earthquake events.
*/
function displayEvent(cavw,mapUsed){
	var nEvent = $('#Evn'+mapUsed).val();
	var radius = $('#wkm'+mapUsed).val();


	var result = computeEquakeEvents(cavw, mapUsed);
	var totalEvent = result[0];
	var filteredEvent = result[1];

	var dataString = '<p>Total available earthquake data: ' + totalEvent + '</p>';

	dataString += '<p>Total number of earthquakes after filter: ' + filteredEvent + '</p>';

	if(parseInt(nEvent) > parseInt(filteredEvent)){
		dataString += '<p>Currently showing: ' + filteredEvent + ' of ' + filteredEvent+ '</p>';
	}else{
		dataString += '<p>Currently showing:: ' + nEvent + ' of ' + filteredEvent + '</p>';
	}
	document.getElementById("eqEvent" + mapUsed).innerHTML = dataString;
}


/**
 * Plot the equake data
 * The volcano to draw the earthquake data is determined using the cavw and
 * mapUsed parameter
 */
function plotEarthquakeData(cavw, mapUsed){
	var isFilter = $("#FormFilter" + mapUsed).css('display') != 'none';
	var numberOfEarthquakes = parseInt(document.getElementById('Evn' + mapUsed).value);
	console.log(numberOfEarthquakes);
	var dHigh = parseFloat($("#DepthHigh"+mapUsed).val());
	var dLow = parseFloat($("#DepthLow"+mapUsed).val());

	var width = parseFloat($('#wkm' + mapUsed).val());

	var errorbars = document.getElementById('errorbars'+mapUsed).checked;

	// skip this function if we can not find the data to draw
	if(!earthquakes[cavw]) 
		return;

	// skip this function if we can not find the side of the map
	if(!mapUsed)
		return;

	// Test send request to get earthquakes
	//getEarthquakes(quantity, cavw, lat, lon, startDate, endDate, startDepth, endDepth, elev, width)
	//var object = getEarthquakes(20, "", "", "", "1980/08/09", "1999/09/08", "-10", "40", "", "60");
	
	filterData(cavw,mapUsed);
	// This is the height and width for the 
	// flot graph. Flot is for 2D javascript drawing

	var CONSTANTS = {
		'labelLeftWidth' : '10px',
		graphMarginLeft: '10px',
		fontSize: '9px',
		labelHeight: '70px',
		labelWidth: '45px',
		labelFontSize: '14px',
		labelPaddingTop: '60px',
		marginTop: '15px'
	};


	function drawMagnitude(ctx, x, y, radius, shadow, realRadius, color){
		ctx.strokeStyle = color;
		ctx.arc(x,y,realRadius,0,shadow ? Math.PI : Math.PI * 2);
	}


	// Arrays that store data for the 3 graphs that we are about to draw.
	var latArray = new Array(), 
		lonArray = new Array(), 
		timeArray = new Array(), 
		eruptionArray = new Array(),
		eruptionLineArray = new Array();
	// The latitude and longitude of the volcano
	var time, latPlot, lonPlot, timePlot;
	
	// get the data for each earthquakes, put them into arrays for 
	// flot library to draw
	var counter = 0;
	var sizeOfEquakeDot, color, depth;

	var max_rms = 0;
	var min_time = (new Date(2100, 0, 1)).getTime();
	var max_time = (new Date(1900, 0, 1)).getTime();

	for (var i in earthquakes[cavw]){
		if(counter > numberOfEarthquakes) break;
		// skip this value when there is no latitude or longitude value 
		// for them
		if(typeof lat == 'undefined' || typeof lon == 'undefined')
			continue;

		// skip this event when it is not supposed to be displayed
		if(earthquakes[cavw][i]['available'] == 'undefined' || earthquakes[cavw][i]['available'] != 2)
			continue;
		
		if(!filter(cavw,mapUsed,i)){
			continue;
		}
		// skip this event when it does not have the earthquake type required
		// if(earthquakes[cavw][i]['eqtype'] != eqtype && eqtype != "")
		//     continue;

		// // skip this event when it does not have the catalog owner type required - vutuan added
		// if(earthquakes[cavw][i]['cc_id'] != cc_id && cc_id != "")
		//     continue;

		// the timestampe of the event
		time = earthquakes[cavw][i]['timestamp'];
		if(time == undefined || isNaN(time)) 
			continue;
		// count the number of events to display
		counter++;
		sizeOfEquakeDot = parseFloat(earthquakes[cavw][i]['mag']);
		if(sizeOfEquakeDot < 2) {
			sizeOfEquakeDot = 2;
		}
		else if(sizeOfEquakeDot > 6) {
			sizeOfEquakeDot = 6;
		}

		sizeOfEquakeDot *= 1.2;

		depth = parseFloat(earthquakes[cavw][i]['depth']);
		distance = parseFloat(earthquakes[cavw][i]['distance']);
		latDistance = parseFloat(earthquakes[cavw][i]['latDistance']);
		lonDistance = parseFloat(earthquakes[cavw][i]['lonDistance']);

		color = generateColorCode(depth);

		sd_evn_herr = earthquakes[cavw][i]['herr'];
		sd_evn_xerr = earthquakes[cavw][i]['xerr'];
		sd_evn_yerr = earthquakes[cavw][i]['yerr'];
		sd_evn_derr = earthquakes[cavw][i]['derr'];
		sd_evn_rms = earthquakes[cavw][i]['rms'];

		var xerr, yerr, derr, rms;
		if (sd_evn_herr != ""){
			xerr = parseFloat(sd_evn_herr);
			yerr = xerr;
		}
		else {
			if (sd_evn_xerr != ""){
				xerr = parseFloat(sd_evn_xerr);
			}
			else {
				xerr = 0;
			}

			if (sd_evn_yerr != ""){
				yerr = parseFloat(sd_evn_yerr);
			}
			else {
				yerr = 0;
			} 
		}

		if (sd_evn_derr != ""){
			derr = parseFloat(sd_evn_derr);
		}
		else {
			derr = 0;
		}

		if (sd_evn_rms != ""){
			rms = parseFloat(sd_evn_rms);
		}
		else {
			rms = 0;
		}

		if (rms > max_rms) {
			max_rms = rms;
		}
		// set time coordination
		//if time is not convertible by javascript native functions
		//then use own-created function
		if(isNaN(time)){
			time = earthquakes[cavw][i]['timestamp'];
			time = new Date(time.substring(0,4),parseInt(time.substring(5,7))-1,time.substring(8,10),time.substring(11,13),time.substring(14,16),time.substring(17,19),0);
			time = time.getTime();
		}


		if (time > max_time) {
			max_time = time;
		}
		if (time < min_time) {
			min_time = time;
		} 

		// if no error bars needed, the 2 error values will be 0
		if (errorbars){
			// set lat, lon coordination with format
			// distance, -depth, x error, y error, time
			latArray.push([latDistance,-depth,xerr,derr,time,,sizeOfEquakeDot,color]);
			lonArray.push([lonDistance,-depth,yerr,derr,time,,sizeOfEquakeDot,color]);

			// set time-series coordination with format
			// time, -depth, x error, y error, distance
			timeArray.push([time,-depth,rms,derr,distance,,sizeOfEquakeDot,color]);
		} else {
			latArray.push([latDistance,-depth,0,0,time,,sizeOfEquakeDot,color]);
			lonArray.push([lonDistance,-depth,0,0,time,,sizeOfEquakeDot,color]);
			timeArray.push([time,-depth,0,0,distance,,sizeOfEquakeDot,color]);
		}


	}
	var time_range = max_time - min_time;
	var rms_normalization_multiplier = 0;
	if (max_rms > 0){
		// scaling the max error to be 1/10 of the max range
		rms_normalization_multiplier = 0.01 * time_range / max_rms
	}

	for (var i in timeArray){
		//scale the rms
		//console.log(timeArray[i]);
		timeArray[i][2] *= rms_normalization_multiplier;
	}
	console.log("max_rms");
	console.log(max_rms);
	console.log(rms_normalization_multiplier);

	console.log(min_time);
	console.log(max_time);
	displayEvent(cavw,mapUsed);

	//testing the data
	for(var i in eruptions[cavw]){
		//skip BC
		if (eruptions[cavw][i]['stime'].substring(0,2) == 'BC'){
			continue;
		}

		//convert time
		var currentEruption = new Date(eruptions[cavw][i]['stime']);
		console.log(currentEruption);

		// compare range to limit the number of eruption drawn on graph
		// if (currentEruption > min_time && currentEruption < max_time){
		// 	console.log("within range");
		// 	eruptionArray.push([currentEruption,10,0,0,0,,,,]);
		// }

		// for testing purpose, draw all eruptions A.D.
		eruptionArray.push([currentEruption,10,0,0,0,,,,]);
	}

	var timeSeriesPoint = {
		symbol: drawMagnitude,
		fill: false,
		errorbars: 'xy', //should be 'x', 'y' or 'xy'
		xerr: { 
			show: true, 
			asymmetric: false, 
			upperCap: "-", 
			lowerCap: "-", 
			color: 'grey', 
			radius: 3
		},
		yerr: { 
			show: true, 
			asymmetric: false, 
			upperCap: "-", 
			lowerCap: "-", 
			color: 'grey', 
			radius: 3
		}
	}

	var timeSeriesEruptionPoint = {
		symbol:"triangle",
		radius:7,
		fill:true, 
		fillColor: 'red'
	}

	var eruptionMarkings = new Array();
	var eruptionPointLabels = new Array();
	// vertical grid line for each of the eruptions, this is used in grid option for flot
	for (var i in eruptionArray){
		var time = eruptionArray[i][0];
		eruptionMarkings.push({ color:"red", lineWidth: 2, xaxis: {from: time, to: time} });
		var year = time.getFullYear();
		var month = time.getMonth() + 1;
		var date = time.getDate();
		if (month < 10) month = '0' + month;
		if (date < 10) date = '0' + date;
		eruptionPointLabels.push(year + "-" + month + "-" + date);
	}

	// prepare the data object for the plot functions
	latPlot = [{
		data:latArray
	}];
	lonPlot = [{
		data:lonArray
	}];
	timePlot = [
		{ data:timeArray, points:timeSeriesPoint },
		{ color:'red', data:eruptionArray, points:timeSeriesEruptionPoint, 
			showLabels: true, labels: eruptionPointLabels, labelPlacement: "right", 
			canvasRender: true, cColor: "red"}
	];

	console.log('time-series plot');

	console.log(timePlot);


	var minY = minYAxis(latArray);
	// Options for drawing time view. 
	var timeOptions = {
		axisLabels: {
            show: true
        },
		series:{
			points:{
				show:true,
				lineWidth: 0
	        },
		},
		colors:["#3a4cb2"],
		grid:{
			// draw additional grid lines for eruptions
			markings: eruptionMarkings,
			// this option is for changing the color of the border
			borderColor: "#9C9C9C",
			clickable:true,
			hoverable:true,
			autoHighlight:true
		},
		yaxis:{
			axisLabel: 'depth(km)',
            axisLabelUseCanvas: true,
			axisLabelFontSizePixels : 11,
			tickFormatter: kmFormatter,
			tickSize: (dHigh - dLow)/5.0,
			min: -dHigh,
			max: -dLow
			//labelWidth:40
		},
		xaxis:{
			axisLabel: 'time',
			axisLabelPadding: 10,
            axisLabelUseCanvas: true,
			axisLabelFontSizePixels : 11,
			labelWidth:40,
			mode: "time",
			min: (isFilter ? parseDateVal($("#SDate"+mapUsed).val()) : min_time),
			max: max_time		
		},
		zoom:{ 
			interactive: true
		},
		pan: {
			interactive: true
		},
		shadowSize: 0
	}


	// Options for drawing lat-lon plot. Please refer to the documentation
	// of Flot to see the meaning of the each value
	var plotOptions = {
		series:{
			points:{
				show: true,
				lineWidth: 1,
				symbol: drawMagnitude,
				fill: false,
	            errorbars: 'xy', //should be 'x', 'y' or 'xy'
	            xerr: { 
	            	show: true, 
	            	asymmetric: false, 
	            	upperCap: "-", 
	            	lowerCap: "-", 
	            	color: 'grey', 
	            	radius: 3
	            },
	            yerr: { 
	            	show: true, 
	            	asymmetric: false, 
	            	upperCap: "-", 
	            	lowerCap: "-", 
	            	color: 'grey', 
	            	radius: 3
	            },
			}
		},
		grid:{
			// this option is for changing the color of the border
			borderColor: "#9C9C9C",
			clickable:true,
			hoverable:true,
			autoHighlight:true
		},
		axisLabels: {
            show: true
        },
		yaxis:{
			axisLabel: 'depth(km)',
            axisLabelUseCanvas: true,
			axisLabelFontSizePixels : 11,
			tickFormatter : kmFormatter,
			tickSize: (dHigh - dLow)/5.0,
			min: -dHigh,
			max: -dLow,
			labelWidth: 30
		},
		xaxis:{
			position:"top",
			tickSize: width/5.0,
			max: width,
			min: -width,
			tickFormatter : kmFormatter,
			labelHeight: 30
		},
		zoom:{ interactive: true},
		pan: {interactive: true},
		shadowSize: 0
	};
	


	if(getSelectedEquakesButton(mapUsed) == 1)
		$('#twoDEquakeFlotGraph' + mapUsed).show();


	// draw the latitude map
	var latitudePlotArea = $("#FlotDisplayLat"+mapUsed);
	latitudePlotArea.css("height", latitudePlotArea.width() * (dHigh - dLow) / (2*width));
	equakeGraphs[mapUsed].latGraph = $.plot(latitudePlotArea,latPlot,plotOptions);
	Wovodat.enableTooltip({type:'single',
		id:"FlotDisplayLat"+mapUsed,
		firstValueFront:'Time',
		firstValueBack:'UTC',
		secondValueFront:'Distance from volcano',
		secondValueBack:'km',
		thirdValueFront:'Depth',
		thirdValueBack:'km'
	});

	// draw the longitude map
	var longitudePlotArea =$("#FlotDisplayLon"+mapUsed);
	longitudePlotArea.css("height", longitudePlotArea.width() * (dHigh - dLow) / (2*width));
	equakeGraphs[mapUsed].lonGraph = $.plot(longitudePlotArea,lonPlot,plotOptions);
	Wovodat.enableTooltip({type:'single',
		id:"FlotDisplayLon"+mapUsed,
		firstValueFront:'Time',
		firstValueBack:'UTC',
		secondValueFront:'Distance from volcano',
		secondValueBack:'km',
		thirdValueFront:'Depth',
		thirdValueBack:'km'
	});

	// draw the time series map        
	var timePlotArea =$("#FlotDisplayTime"+mapUsed);
	equakeGraphs[mapUsed].timeGraph = $.plot(timePlotArea,timePlot,timeOptions);
	//Keep the label of markings always middle of y axis
	$("#FlotDisplayTime" + mapUsed).bind("plotpan plotzoom", function(event){
		var options = equakeGraphs[mapUsed].timeGraph.getOptions();
		var max = options.yaxes[0].max;
		var min = options.yaxes[0].min;
		var yCoor = (max + min)/2;
		var data = equakeGraphs[mapUsed].timeGraph.getData();
		data.pop();
		for(var i = 0; i < eruptionArray.length; i++){
			eruptionArray[i][1] = yCoor;
		}
		data.push({ color:'red', data:eruptionArray, points:timeSeriesEruptionPoint, 
			showLabels: true, labels: eruptionPointLabels, labelPlacement: "right", 
			canvasRender: true, cColor: "red"})
		equakeGraphs[mapUsed].timeGraph.setData(data);
		equakeGraphs[mapUsed].timeGraph.setupGrid();  // if axis have changed
 		equakeGraphs[mapUsed].timeGraph.draw();
	})

	Wovodat.enableTooltip({type:'single',
		timeSeries:'true',
		id:"FlotDisplayTime"+mapUsed,
		firstValueFront:'Time',
		firstValueBack:'UTC',
		secondValueFront:'Distance from volcano',
		secondValueBack:'km',
		thirdValueFront:'Depth',
		thirdValueBack:'km'
	});
	
	// adjust the flot label for all the graph ('E-W','N-S','Time')
	$('.equakeGraphPlaceholder').css({
		'margin-left' : CONSTANTS.graphMarginLeft
	});
	$('.plot-label').css({
		'float': 'right',
		'display': 'block-inline',
		'height': CONSTANTS.labelHeight,
		'width': CONSTANTS.labelWidth,
		'font-size': CONSTANTS.labelFontSize,
		'vertical-align': 'middle',
		'padding-top': CONSTANTS.labelPaddingTop,
	});
	$('.plot-label-left').css({
		'float': 'left',
		'display': 'block-inline',
		'height': CONSTANTS.labelHeight,
		'width': CONSTANTS.labelLeftWidth,
		'font-size': CONSTANTS.labelFontSize,
		'vertical-align': 'middle',
		'padding-top': CONSTANTS.labelPaddingTop
	});
	showHideEquakeButton(mapUsed);       
}


// function to handle the color generation for earthquakes dot
function generateColorCode(depth){
	if(depth > 20) depth = 20;
	var r,g,b;

	if(depth <= 10){
		r = 255;
		b = 0;
	}else{
		r = 0;
		depth = 20 - depth;
		b = 255;
	}
	
	g = depth / 10.0 * 255;
	g = parseInt(g);
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}



/*
READY FUNCTION
*/
$(document).ready(function(){
	//$("#image_v5").css('width','459px');
	setupSwitchButton();
	/* get the list of all volcano in our database and insert it into
	* the dropdown list
	*insertVolcanoList is used as a callback function with 2 parameter: the first
	*parameter is the list of Volcano, and the second parameter is the ID of the dropdown menu
	*to which data is populated
	*/
	Wovodat.getVolcanoListHasData(insertVolcanoList,["VolcanoList","CompVolcanoList"]);
	// Wovodat.getVolcanoList(insertVolcanoList,["VolcanoList"]);
   	Wovodat.getEquakeType(setupEquakeType);
	Wovodat.getCatalogOwner(setupCatalogOwner);
	// store the eruption data for later use
	eruptionsData = {
		marks: {
			show: true,
			color: 'rgb(212,59,62)',
			labelVAlign: 'top' ,
			rows: 1
		},
		data: [],
		markdata: []
	};
	// store the eruption data for the second volcano
	eruptionsData.compEruptions = {
		marks: {
			show: true,
			color: 'rgb(212,59,62)',
			labelVAlign: 'top' ,
			rows: 1
		},
		data: [],
		markdata: []
	};

	lat = 1.29;
	lon = 103.85;
	var myOptions = {
		center: new google.maps.LatLng(lat, lon),
		zoom: 7,
		mapTypeControl:false,
		mapTypeId: google.maps.MapTypeId.TERRAIN,
		streetViewControl:false
	};
	map[1] = new google.maps.Map(document.getElementById("Map"),myOptions);
	map[2] = new google.maps.Map(document.getElementById("Map2"),myOptions);

	$("#gvp1").click(function() {
		var locat= $("#VolcanoList :selected").text();
		var locati=locat.split("_");
		open("http://www.volcano.si.edu/world/volcano.cfm?vnum="+locati[1]);
		return false;
	});
	$("#gvp2").click(function() {
		var locat= $("#CompVolcanoList :selected").text();
		var locati=locat.split("_");
		open("http://www.volcano.si.edu/world/volcano.cfm?vnum="+locati[1]);
		return false;
	});

	$("#HideStationButton1").click(function(){
		hideStation(1);
		$(this).hide();
	});
	$("#HideStationButton2").click(function(){
		hideStation(2);
		$(this).hide();
	});

	Wovodat.showProcessingIcon($("#loading"));
	// when the volcano option is changed
	//$("#VolcanoList").change(function(){
	//	totalGraph[1]=0;
	//	graphCount[1]=[];
    //
	//	hideEarthquakeMarkerButton(1);
	//	uncheckAllEquakeButton(1);
	//	//setPrintButtonVisibility(1,false);
	//	var volcano = $("#VolcanoList").val();
	//	//alert("VNUM = " + volcano);
    //
	//	volcano = volcano.split("&");
	//	var cavw = volcano[1];
	//	var cavw_new = volcano[2];//vnum
	//	var inner = "\<iframe src=\"/eruption2/#vnum=" + cavw_new +  "\" frameborder=\" 0 \" style=\"overflow:hidden;height:100%;width:100%\" height=\"100%\" width=\"100%\",width=\"100%\" height=\"100%\"\> </iframe>";
	//	//console.log(inner);
	//	$("#TimeSeriesView1").html(inner);
	//	if(cavw_new == $("#vnum").val() || $("#vnum").val() == " "){
	//		Wovodat.getLatLon({handler:drawMap,cavw:cavw,mapUsed:1},"VolcanoList", "Map");
	//		//initialise value for Number of Events textbox
	//		resetFilter(1);
	//		$("#FormFilter1").hide();
	//		$("#FilterSwitch1").html("Show Filter");
	//		$("#FlotDisplayLat1").html("");
	//		$("#FlotDisplayLon1").html("");
	//		//get the list of neightbors
	//		//and position them in the map
	//		Wovodat.getNeighbors(cavw,1,insertMarkersForNeighbors);
	//		// get the eruption list for that specific volcano
	//		Wovodat.getEruptionList({
	//			volcano: $("#VolcanoList").val(),
	//			handler: insertEruptionList,
	//			selectId:"EruptionList"
	//		});
	//		//get data owner of the volcano
	//		Wovodat.getCcUrl("1",cavw,insertDataOwnerandStatus);
	//		// get the location of that volcano and position to it in the
	//		// google map
	//		// update the list of available station
	//		// time-series view
	//		//compare volcano view
	//		Wovodat.getAllStationsList({
	//			cavw:cavw,
	//			handler:updateAllStationsList,
	//			tableId:"StationList",
	//			mapId:"Map",
	//			stationsDatabaseUsed: stationsDatabase,
	//			mapUsed:1
	//		});
	//		// Insert the list of available data in available time series
	//		// to the list in the comparison view
	//		// Wovodat.getListOfTimeSeriesForVolcano({
	//		// 	cavw:cavw,
	//		// 	handler:updateTimeSeriesList,
	//		// 	tableId:1
	//		// });
	//		// delete all the drawn graphs and the time series list
	//		if ($("#CompVolc").css("display")=="none"){
	//			for(var i in graphs){
	//				delete(graphs[i]);
	//				var div = document.getElementById(i + 'Row');
	//				div.parentNode.removeChild(div);
	//			}
	//			// document.getElementById('overviewPanel').style.display = 'none';
    //
	//			// document.getElementById('TimeSeriesList').innerHTML = '';
	//		}else{
	//			for(var i in graphs){
	//				var j = side(i);
	//				if(j == 1){
	//					delete graphs[i];
	//					var div = document.getElementById(i.substring(0,i.length-1) + 'Row' + j);
	//					div.parentNode.removeChild(div);
	//				}
	//			}
	//			// document.getElementById('overviewPanel1').style.display = 'none';
	//			// document.getElementById('TimeSeriesList1').innerHTML = '';
	//		}
	//		// reset the local list of available stations for each data type
	//		delete(stationsDatabase);
	//		stationsDatabase = {};
    //
	//		hideEquakePanel({mapUsed:1});
	//		hideMarkers({mapUsed:1});
	//		clearEquakedrawingData({mapUsed:1});
	//		if ($("#vnum").val() == " ") {
	//			var selectedVd = $("#VolcanoList").val();
	//			selectedVd = selectedVd.split("&");
	//			document.getElementById("vname").value = selectedVd[0];
	//			document.getElementById("vcavw").value = selectedVd[1];
	//			document.getElementById("vnum").value = selectedVd[2];
	//			//console.log($("#VolcanoList").val());
	//		}
	//	}else{
	//		var selectedVd = $("#VolcanoList").val();
	//		selectedVd = selectedVd.split("&");
	//		document.getElementById("vname").value = selectedVd[0];
	//		document.getElementById("vcavw").value = selectedVd[1];
	//		document.getElementById("vnum").value = selectedVd[2];
	//		var currentUrl = window.location.href;
	//		currentUrl = currentUrl.split("?");
	//		$("#volcanoForm").attr("action", currentUrl[0] + "?vnum=" + cavw_new);
	//		//$("#volcanoForm").submit();
	//	}
	//	removeElement(1,'cc_id');
	//	removeElement(1,'EqType');
	//	if(earthquakes[cavw]){
	//		var catalogOwner = new Set();
	//		var eqTypeSet = new Set();
	//		cachingElement(catalogOwner,cavw,1,'cc_id');
	//		cachingElement(eqTypeSet,cavw,1,'EqType');
	//	}
	//});

	$("#HideVolcanoInformation1").click(function(){
		$("#VolcanoPanel1").hide();
		return false;
	});

	$("#VolcanoInformation1").click(function(){
		$("#VolcanoPanel1").show();
		return false;
	});
	$("#HideVolcanoInformation2").click(function(){
		$("#VolcanoPanel2").hide();
		return false;
	});
	$("#VolcanoInformation2").click(function(){
		$("#VolcanoPanel2").show();
		return false;
	});
	$("#CompVolcanoList").change(function(){
		totalGraph[2]=0;
		graphCount[2]=[];

		hideEarthquakeMarkerButton(2);
		uncheckAllEquakeButton(2);
		//setPrintButtonVisibility(2,false);
		var volcano = $("#CompVolcanoList").val();
		//console.log("DEBUG " + volcano);
		volcano = volcano.split("&");
		var cavw = volcano[1];
		/*
		 iframe erupton
		 */
		var vnum = volcano[2];
		//console.log(vnum);
		var inner = "\<iframe src=\"/eruption2/#vnum=" + vnum +  "\" frameborder=\" 0 \", width=\"100%\" height=\"100%\"\> </iframe>";
		//console.log(inner);
		$("#TimeSeriesView2").html(inner);

		Wovodat.getLatLon({cavw:cavw,handler:drawMap,mapUsed:2},"CompVolcanoList", "Map2");
		resetFilter(2);
		$("#FormFilter2").hide();
		$("#FilterSwitch2").html("Show Filter");
		$("#FlotDisplayLat2").html("");
		$("#FlotDisplayLon2").html("");

		Wovodat.getEruptionList({
			volcano: $("#CompVolcanoList").val(),
			handler: insertEruptionList,
			selectId:"CompEruptionList"
		});
		//get list of neighbors
		Wovodat.getNeighbors(cavw,2,insertMarkersForNeighbors);
		//get data owner of the volcano
		Wovodat.getCcUrl("2",cavw,insertDataOwnerandStatus);
		Wovodat.getAllStationsList({
			cavw: cavw,
			handler: updateAllStationsList,
			tableId:"CompStationList",
			mapId:"Map2",
			stationsDatabaseUsed:compStationsDatabase,
			mapUsed:2
		});
		// Wovodat.getListOfTimeSeriesForVolcano({
		// 	cavw:cavw,
		// 	handler:updateTimeSeriesList,
		// 	tableId:2
		// });
		for(var i in graphs){
			var j = side(i);
			if(j == 2){
				delete graphs[i];
				var div = document.getElementById(i.substring(0,i.length-1) + 'Row' + j);
				div.parentNode.removeChild(div);
			}
		}
		// document.getElementById('overviewPanel2').style.display = 'none';
		// document.getElementById('TimeSeriesList2').innerHTML = '';
		// reset the local list of available stations for each data type
		delete(compStationsDatabase);
		compStationsDatabase = {};


		hideEquakePanel({mapUsed:2});
		hideMarkers({mapUsed:2});
		clearEquakedrawingData({mapUsed:2});

		removeElement(2,'cc_id');
		removeElement(2,'EqType');
		if(earthquakes[cavw]){
			var catalogOwner = new Set();
			var eqTypeSet = new Set();
			cachingElement(catalogOwner,cavw,2,'cc_id');
			cachingElement(eqTypeSet,cavw,2,'EqType');
		}

	});

	$("#VolcanoList").change(function(){
		totalGraph[2]=0;
		graphCount[2]=[];

		hideEarthquakeMarkerButton(2);
		uncheckAllEquakeButton(2);
		//setPrintButtonVisibility(2,false);
		var volcano = $("#VolcanoList").val();
		//console.log("DEBUG " + volcano);
		volcano = volcano.split("&");
		var cavw = volcano[1];
		/*
		 iframe erupton
		 */
		var vnum = volcano[2];
		//console.log(vnum);
		var inner = "\<iframe src=\"/eruption2/#vnum=" + vnum +  "\" frameborder=\" 0 \", width=\"100%\" height=\"100%\"\> </iframe>";
		//console.log(inner);
		$("#TimeSeriesView1").html(inner);

		Wovodat.getLatLon({cavw:cavw,handler:drawMap,mapUsed:1},"VolcanoList", "Map");
		resetFilter(1);
		$("#FormFilter1").hide();
		$("#FilterSwitch1").html("Show Filter");
		$("#FlotDisplayLat1").html("");
		$("#FlotDisplayLon1").html("");

		Wovodat.getEruptionList({
			volcano: $("#VolcanoList").val(),
			handler: insertEruptionList,
			selectId:"EruptionList"
		});
		//get list of neighbors
		Wovodat.getNeighbors(cavw,1,insertMarkersForNeighbors);
		//get data owner of the volcano
		Wovodat.getCcUrl("1",cavw,insertDataOwnerandStatus);
		Wovodat.getAllStationsList({
			cavw: cavw,
			handler: updateAllStationsList,
			tableId:"StationList",
			mapId:"Map",
			stationsDatabaseUsed:stationsDatabase,
			mapUsed:1
		});
		// Wovodat.getListOfTimeSeriesForVolcano({
		// 	cavw:cavw,
		// 	handler:updateTimeSeriesList,
		// 	tableId:2
		// });
		for(var i in graphs){
			var j = side(i);
			if(j == 2){
				delete graphs[i];
				var div = document.getElementById(i.substring(0,i.length-1) + 'Row' + j);
				div.parentNode.removeChild(div);
			}
		}
		// document.getElementById('overviewPanel2').style.display = 'none';
		// document.getElementById('TimeSeriesList2').innerHTML = '';
		// reset the local list of available stations for each data type
		delete(stationsDatabase);
		stationsDatabase = {};


		hideEquakePanel({mapUsed:1});
		hideMarkers({mapUsed:1});
		clearEquakedrawingData({mapUsed:1});

		removeElement(1,'cc_id');
		removeElement(1,'EqType');
		if(earthquakes[cavw]){
			var catalogOwner = new Set();
			var eqTypeSet = new Set();
			cachingElement(catalogOwner,cavw,1,'cc_id');
			cachingElement(eqTypeSet,cavw,1,'EqType');
		}
	});


	// get all the available graph move to the eruption
	$("#EruptionList").change(function(){
		moveGraphsToEruptionTime.apply(this);
	});
	$("#CompEruptionList").change(function(){
		moveGraphsToEruptionTime.apply(this,[2]);
	});
	var buttons = document.getElementsByTagName('button');
	for(var i = 0 ; i < buttons.length ; i++){
		var button = buttons[i];
		button.style.fontSize = '10px';
	}
	$("#ShowMap1").click(function(){
		$("#Map").show();
		$("#map_legend1").show();
	});
	$("#ShowMap2").click(function(){
		$("#Map2").show();
		$("#map_legend2").show();
	});
	$("#HideMap1").click(function(){
		$("#Map").hide();
		$("#map_legend1").hide();
	});
	$("#HideMap2").click(function(){
		$("#Map2").hide();
		$("#map_legend2").hide();
	});

});

function setupSwitchButton(){
	var button = document.getElementById('switchView');
	var panel = document.getElementById('volcanoPanel2');
	$(button).click(switchView);
	$(panel).css('display','block');
}

function hideEarthquakeMarkerButton(mapUsed){
	// parameter checking
	if(mapUsed == undefined || (mapUsed != 1 && mapUsed != 2))
		return;
	var button = $("#showHideMarkers" + mapUsed);
	// if the button does not exist, return
	if(button == undefined)
		return;
	button.css('display','none');

}


/*
 * Hide the entire earthquake panel when the x button is click
 */
$("#HideEquake1").click(function(){
	hideEquakePanel({mapUsed:1});
	var a = document.getElementById('showHideMarkers1');
	if($(a).html() == "Hide earthquake"){
		$(a).click();
	}
	$('#showHideMarkers1').hide();
	uncheckAllEquakeButton(1);
	return false;
});
$("#HideEquake2").click(function(){
	hideEquakePanel({mapUsed:2});
	var a = document.getElementById('showHideMarkers2');
	if($(a).html() == "Hide earthquake"){
		$(a).click();
	}
	$('#showHideMarkers2').hide();
	uncheckAllEquakeButton(2);
	return false;
});

function uncheckAllEquakeButton(mapUsed){
	function removeClassName(element){
		if(element == null)
			return;
		var parent = element.parentNode;
		if(parent == null)
			return;
		parent.className = parent.className.replace('equakeDisplayButtonChecked','');
	}
	var element;
	var ids = ["2D","2DGMT","3D"];
	var length = ids.length;
	var i = 0;
	for(i = 0 ; i < length; i++){
		ids[i] = "equakeDisplayType" + mapUsed + ids[i];
	}
	for(i = 0 ; i < length; i++){
		element = document.getElementById(ids[i]);
		if(element == null) continue;
		removeClassName(element);
	}

}
function hideStation(tableId){
	var stationListName ;
	// get the 'id of table contains the list of station type'
	if(tableId == 1){
		stationListName = '';
	}else{
		stationListName = 'Comp';
	}
	stationListName += 'StationList';
	var stationList = document.getElementById(stationListName).getElementsByTagName('tbody')[0].childNodes;
	for(var i= 0; i <  stationList.length ;i++){
		var input = stationList[i].getElementsByTagName('input')[0];
		if(input.checked) input.click();
	}
	//map[tableId].setZoom(7);
}
function resetFilter(mapUsed){
                
	var dateString = "";
	$("#Evn" + mapUsed).val(1000);
	var startDate = new Date(1940, 0, 2, 0, 0, 0, 0);
	dateString = (startDate.getUTCMonth() + 1) + "/" + startDate.getUTCDate() + "/" + startDate.getUTCFullYear();
	$("#SDate" + mapUsed).val(dateString);
	var endDate = new Date();
	dateString = (endDate.getUTCMonth() + 1) + "/" + endDate.getUTCDate() + "/" + endDate.getUTCFullYear();
	$("#EDate" + mapUsed).val(dateString);
	
	$("#SDate" + mapUsed).datepicker({changeMonth:true,changeYear:true,yearRange:"1940:2100"});
	$("#EDate" + mapUsed).datepicker({changeMonth:true,changeYear:true,yearRange:"1940:2100"});
	
	$("#cc_id" + mapUsed).val("");
	$("#EqType" + mapUsed).val("");
	$("#wkm" + mapUsed).val(30);
	$("#azim" + mapUsed).val(175);
	$("#degree" + mapUsed).val(30);
	
	$("#DateRange" + mapUsed).slider({
		range: true,
		max: Math.floor(endDate.getTime()-startDate.getTime())/86400000,
		values : [0, Math.floor(endDate.getTime()-startDate.getTime())/86400000],
		slide: function(event,ui){
			var startDate = new Date(1940, 0, 2, 0, 0, 0, 0);
			var date = new Date(startDate.getTime());
			date.setDate(date.getDate() + ui.values[0]);
			$("#SDate" + mapUsed).val($.datepicker.formatDate('mm/dd/yy',date));
			date = new Date(startDate.getTime());
			date.setDate(date.getDate() + ui.values[1]);
			$("#EDate" + mapUsed).val($.datepicker.formatDate('mm/dd/yy',date));
		}
	});	
	// range of max and min depth
	$("#DepthLow" + mapUsed).val(-10);
	$("#DepthHigh" + mapUsed).val(40);
	$("#MagnitudeLow" + mapUsed).val(0); // vutuan added
	$("#MagnitudeHigh" + mapUsed).val(9); //vutuan added
	$("#SDate" + mapUsed).change(function(){adjustSlider(mapUsed);});
	$("#EDate" + mapUsed).change(function(){adjustSlider(mapUsed);});
	
}

function adjustSlider(mapUsed){
	var startDate = new Date(1940, 0, 2, 0, 0, 0, 0);
	var startDateValue = $("#SDate" + mapUsed).datepicker( "getDate" );
	var endDateValue = $("#EDate" + mapUsed).datepicker( "getDate" );
	$("#DateRange" + mapUsed).slider({values: [Math.floor(startDateValue.getTime() - startDate.getTime())/86400000, Math.floor(endDateValue.getTime()-startDate.getTime())/86400000]});
	$("#DateRange" + mapUsed).slider('refresh');
}
/*
READY FUNCTION
*/
$(document).ready(function(){
	/*
	 * Drop down the display equake panel
	 * Draw the Flot equake graph of current volcano if no display type is selected 
 
	 */
	$("#DisplayEquake1").click(function(){
		$('#EquakePanel1').show();
		$("#twoDEquakeFlotGraph1").hide();
		$("#2DGMTEquakeGraph1").hide();
		showHideEquakeButton(1);
	});
	$("#DisplayEquake2").click(function(){
		$("#EquakePanel2").show();
		$("#twoDEquakeFlotGraph2").hide();
		$("#2DGMTEquakeGraph2").hide();
		showHideEquakeButton(2);
	}); 

	
	
	// hide the earth quake map during initialization
	hideEquakePanel({mapUsed:1});
	hideEquakePanel({mapUsed:2});
	/*
	*
	 * Javascript to handle button click of 2D, 2D using GMT and 3D using GMT
	 *
	 */
	$(".equakeDisplayBox1").click(function() {
		$(".equakeDisplayBox1").closest("label").removeClass("equakeDisplayButtonChecked");
		$(this).closest("label").addClass("equakeDisplayButtonChecked");
	});
	$(".equakeDisplayBox2").click(function() {
		$(".equakeDisplayBox2").closest("label").removeClass("equakeDisplayButtonChecked");
		$(this).closest("label").addClass("equakeDisplayButtonChecked");
		
	});
	$("#3DGMTEquakeGraph1, #3DGMTEquakeGraph2").hide();

	//handle the Filter buttons
	$("#FilterBtn1").click(function(){
		registerFilter({mapUsed:1});
	});
	$("#FilterBtn2").click(function(){
		registerFilter({mapUsed:2});
	});
	
	// this function is trigger when the filter button is clicked.
	function registerFilter(o){
		var mapUsed = o.mapUsed;
		if (volcanoInfo[mapUsed]){
			var cavw = volcanoInfo[mapUsed].cavw;
			// depend on the graph that is shown when filter button
			// is clicked, that graph will be redraw according to the the
			// parameter set by filter value
			if( document.getElementById('twoDEquakeFlotGraph' + mapUsed).style.display == 'block'){
				// if the earthquakes list for for this volcano haven't been
				// retrieved from the server, don't do anything
				if(!earthquakes[cavw]){
					return;
				}

				// // Filter data based on what filled in the filter
				filterData(cavw,mapUsed);

				// Draw Earthquake graph
				drawEquake({mapUsed:mapUsed,source:document.getElementById('equakeDisplayType' + mapUsed + '2D')});
			
			}else if(document.getElementById('3DGMTEquakeGraph' + mapUsed).style.display == 'block'){
				gmt3DData[cavw] = undefined;
				drawEquake({mapUsed:mapUsed,
					source:document.getElementById('equakeDisplayType' + mapUsed + '3D')
				});
			}else if(document.getElementById('2DGMTEquakeGraph' + mapUsed).style.display == 'block'){
				gmt2DData[cavw] = undefined;
				drawEquake({mapUsed:mapUsed,
					source:document.getElementById('equakeDisplayType' + mapUsed + '2DGMT')
				});
			}else{
				Wovodat.showNotification({message:'Please click to one of the buttons to retrieve the data.'});
			}
			//document.getElementById('FilterSwitch' + mapUsed).click();
			document.getElementById('DepthLow' + o.mapUsed).scrollIntoView(true);
		}
	}

	(function(list){
		var l = list.length;
		var i = 0;
		for(i = 0 ; i < l ; i++){
			$("#FilterSwitch" + list[i]).click([list[i]],function(e){
				var j = e.data[0];
				if ($("#FormFilter" + j).css("display")!="none"){
					$("#FormFilter" + j).hide();
					$("#FilterSwitch" + j).html("Show Filter");
				}
				else{
					$("#FormFilter" + j).show();
					$("#FilterSwitch" + j).html("Hide Filter");
					if ($("#SDate" + j).val() =="" || $("#SDate" + j).val() =="undefined"){
						$("#SDate" + j).val("01/01/1900");
					}
					if ($("#EDate" + j).val() =="" || $("#EDate" + j).val() =="undefined"){
						var today = new Date();
						$("#EDate" + j).val($.datepicker.formatDate("m/d/yy",today));
					}
				}
			});
		}
	})([1,2]);

	(function(list){
		var l = list.length;
		var i = 0;
		for(i = 0; i < l;  i++){
			$("#showHideMarkers" + list[i]).click([list[i]],function(e){
				var j = e.data[0];
				hideMarkers({mapUsed:j,button:this});
			});
		}
	})([1,2]);         
});

function hideEquakePanel(o){
	$("#EquakePanel" + o.mapUsed).hide();
}


function removeElement(mapUsed,element){
	var table = document.getElementById(element+mapUsed);
	var tableRows = table.getElementsByTagName('tr');
	var numberOfRows = tableRows.length;
	while(numberOfRows > 1){
		table.deleteRow(numberOfRows - 1);
		numberOfRows--;
	}
}


function cachingElement(set,cavw,mapUsed,element){
	var table = document.getElementById(element+mapUsed);
	var tableRows = table.getElementsByTagName('tr');
	var numberOfRows = tableRows.length;
	var id;
	if(numberOfRows < 2){
		for (var i in earthquakes[cavw]){
			if(earthquakes[cavw][i]['available'] != 'undefined'){
				if(element === 'EqType') id = earthquakes[cavw][i]['eqtype'];
				else id = earthquakes[cavw][i]['cc_id'];
				if(id != undefined && id != "")
					set.add(id);
			}
		}
		displayElement(set,mapUsed,element);
	}
}      




/**
 show the button to hide/show earthquake markers in the graph
 the function only show the button when we have any marker
*/
function showHideEquakeButton(mapUsed){
	var cavw = getCavw(mapUsed);
	if(cavw == undefined)
		return;
	// parameter checking
	if(mapUsed == undefined || (mapUsed != 1 && mapUsed != 2))
		return;
	var button = $("#showHideMarkers" + mapUsed);
	// if the button does not exist, return
	if(button == undefined)
		return;
	// if the button is already shown, return
	if(button.css('display') == 'block')
		return;
	// go through all the earthquakes available for the current vocano
	for (var i in earthquakes[cavw])
		if (typeof earthquakes[cavw][i]['marker' + mapUsed] != "undefined"){
			// if there is earthquakes that are shown for on the map, show the 
			// button and return
			if(earthquakes[cavw][i]['marker' + mapUsed].getMap() != null){
				button.css('display','block');
				return;
			}
	}

	button.css('display','none');
}

function insertMarkersForNeighbors(cavw, list, panelUsed){
	//remove all neighMarkers
	vocalnoHasData = [];
	var tlist;
		tlist = document.getElementById("VolcanoList");
	//console.log(tlist);
	for (var i = 0 ; i <tlist.length; i++){

		var tName = ((tlist[i].text).split("_"))[0];
		//var tName = (($('#VolcanoList')[i]).split("_"))[0];
		vocalnoHasData.push(tName);
	}
	for (var i in neighMarkers[panelUsed])
		neighMarkers[panelUsed][i].setMap(null);
	neighMarkers[panelUsed]=[];
	if (list[list.length]=="")
		list.length--;
	for (var index in list){
		var info_split = list[index].split(";");
		var neighCavw = info_split[0];
		var name = info_split[1];
		var lat = info_split[2];
		var lon = info_split[3];
		var marker = new google.maps.Marker({
			position:new google.maps.LatLng(lat,lon)
		});
		if (vocalnoHasData.indexOf(name) < 0 ){
			marker.setIcon("/img/pin_grey.png");
		}else{
			marker.setIcon("/img/pin.png");
		}

		marker.setMap(map[panelUsed]);
		marker.setTitle(name+"_"+neighCavw);
		neighMarkers[panelUsed].push(marker);
		google.maps.event.addListener(marker,"click",function(){
			var selectDom;
			var selectj;
			if (panelUsed==1){
				selectDom = document.getElementById("VolcanoList");
				selectj = $("#VolcanoList");
			}
			else{
				selectDom = document.getElementById("CompVolcanoList");
				selectj = $("#CompVolcanoList");
			}
			var title = this.getTitle();
			title = title.split('_');
			title = Wovodat.trim(title[1]);
			var l = selectDom.options.length;
			for (var i = 0 ; i < l ; i++){
				if(selectDom.options[i].text == undefined)
					continue;
				if ((selectDom.options[i].text).indexOf(title) > -1){
					selectDom.selectedIndex = i;
					selectj.change();
					break;
				}
			}

		});
	}
}

/**
 * Clear all data of Earth Quake
 */
function clearEquakedrawingData(o){
	var mapUsed = o.mapUsed;
	var placeholder = $("#equakeGraphs" + mapUsed);
	var tmp = $("#twoDEquakeFlotGraph" + mapUsed,placeholder)
	tmp.hide();
	$("#FlotDisplayLat" + mapUsed).html('');
	$("#FlotDisplayLon" + mapUsed).html('');
	$("#FlotDisplayTime" + mapUsed).html('');
	tmp = $("#2DGMTEquakeGraph" + mapUsed,placeholder);
	tmp.hide()
	$("#imageLink",tmp).attr('href','');
	$("#image",tmp).attr('src','');
	$("#gifImage",tmp).attr('href','');
	$("#gmtScriptFile",tmp).attr('href','');
	tmp = $("#3DGMTEquakeGraph" + mapUsed,placeholder);
	tmp.hide()
	$("#imageLink",tmp).attr('href','');
	$("#image",tmp).attr('src','');
	$("#gifImage",tmp).attr('href','');
	$("#gmtScriptFile",tmp).attr('href','');
}

/**
 Change the map given id
 Ngo Le Bao Loc added 15/3
 */
function updateGoogleMap(location_id){
	totalGraph[1]=0;
	graphCount[1]=[];

	hideEarthquakeMarkerButton(1);
	uncheckAllEquakeButton(1);
	//setPrintButtonVisibility(1,false);
	var volcano = $("#VolcanoList").val();
	volcano = volcano.split("&");
	var cavw = volcano[1];
	var cavw_new = volcano[2];//vnum

	if(cavw_new == $("#vnum").val() || $("#vnum").val() == " "){
		Wovodat.getLatLon({handler:drawMap,cavw:cavw,mapUsed:1},"VolcanoList", "Map");
		//initialise value for Number of Events textbox
		resetFilter(1);
		$("#FormFilter1").hide();
		$("#FilterSwitch1").html("Show Filter");
		$("#FlotDisplayLat1").html("");
		$("#FlotDisplayLon1").html("");
		//get the list of neightbors
		//and position them in the map
		Wovodat.getNeighbors(cavw,1,insertMarkersForNeighbors);
		// get the eruption list for that specific volcano
		Wovodat.getEruptionList({
			volcano: $("#VolcanoList").val(),
			handler: insertEruptionList,
			selectId:"EruptionList"
		});
		//get data owner of the volcano
		Wovodat.getCcUrl("1",cavw,insertDataOwnerandStatus);
		// get the location of that volcano and position to it in the
		// google map
		// update the list of available station
		// time-series view
		//compare volcano view
		Wovodat.getAllStationsList({
			cavw:cavw,
			handler:updateAllStationsList,
			tableId:"StationList",
			mapId:"Map",
			stationsDatabaseUsed: stationsDatabase,
			mapUsed:1
		});
		// Insert the list of available data in available time series
		// to the list in the comparison view
		// Wovodat.getListOfTimeSeriesForVolcano({
		// 	cavw:cavw,
		// 	handler:updateTimeSeriesList,
		// 	tableId:1
		// });
		// delete all the drawn graphs and the time series list
		if ($("#CompVolc").css("display")=="none"){
			for(var i in graphs){
				delete(graphs[i]);
				var div = document.getElementById(i + 'Row');
				div.parentNode.removeChild(div);
			}
			// document.getElementById('overviewPanel').style.display = 'none';

			// document.getElementById('TimeSeriesList').innerHTML = '';
		}else{
			for(var i in graphs){
				var j = side(i);
				if(j == 1){
					delete graphs[i];
					var div = document.getElementById(i.substring(0,i.length-1) + 'Row' + j);
					div.parentNode.removeChild(div);
				}
			}
			// document.getElementById('overviewPanel1').style.display = 'none';
			// document.getElementById('TimeSeriesList1').innerHTML = '';
		}
		// reset the local list of available stations for each data type
		delete(stationsDatabase);
		stationsDatabase = {};

		hideEquakePanel({mapUsed:1});
		hideMarkers({mapUsed:1});
		clearEquakedrawingData({mapUsed:1});
		if ($("#vnum").val() == " ") {
			var selectedVd = $("#VolcanoList").val();
			selectedVd = selectedVd.split("&");
			document.getElementById("vname").value = selectedVd[0];
			document.getElementById("vcavw").value = selectedVd[1];
			document.getElementById("vnum").value = selectedVd[2];
			//console.log($("#VolcanoList").val());
		}
	}else{
		var selectedVd = $("#VolcanoList").val();
		selectedVd = selectedVd.split("&");
		document.getElementById("vname").value = selectedVd[0];
		document.getElementById("vcavw").value = selectedVd[1];
		document.getElementById("vnum").value = selectedVd[2];
		var currentUrl = window.location.href;
		currentUrl = currentUrl.split("?");
		//console.log(currentUrl);
		$("#volcanoForm").attr("action", currentUrl[0] + "?vnum=" + cavw_new);
		$("#volcanoForm").submit();
	}
	removeElement(1,'cc_id');
	removeElement(1,'EqType');
	if(earthquakes[cavw]){
		var catalogOwner = new Set();
		var eqTypeSet = new Set();
		cachingElement(catalogOwner,cavw,1,'cc_id');
		cachingElement(eqTypeSet,cavw,1,'EqType');
	}
}