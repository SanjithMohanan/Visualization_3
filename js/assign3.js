$(document).ready(function () {
var margin = {top: 20, right: 0, bottom: 0, left: 20},
	padding = -90,
    width = 750,
    height = 500;
	
	var color = d3.scale.category10();
	
	//var parseDate = d3.time.format("%Y-%m-%d");//%Y-%m-%d
	var parseDate = d3.time.format('%Y-%m-%dT%H:%M:%SZ');
	//var parseDate = d3.time.format.utc('%Y-%m-%dT%H:%M:%SZ');
	var parseTime = d3.time.format("%e %B");//%H:%M %p
	
	var sizeScale;
	/*var map = new L.Map("map", {center: [37.8, -96.9], zoom: 2})
    .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
	var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("width",700).attr("height",500),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");	*/
	
	 var map = L.map('map').setView([37.8, -96.9], 3);
        mapLink = 
            '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:"EarthQuakeInfo",
            maxZoom: 18,
            }).addTo(map);
				
	/* Initialize the SVG layer */
	map._initPathRoot()    

	/* We simply pick up the SVG from the map object */
	var svg = d3.select("#map").select("svg"),
	g = svg.append("g");

	//-------------------Tool tip-------------------------------------
	var div = d3.select("body").append("div")	
    .attr("class", "tooltip")
	//.style("z-index", 99)	
    .style("opacity", 0);
	//----------------------------------------------------------------
	
	// Load and (later, asynchronously) parse the d
d3.csv("earthquakes-oct-2017.csv", function(error,data) {
	if (error) throw error;
	var datatorender=[];	
	data.forEach(function(d){
		//console.log(d.latitude + "  " + d.longitude);
		d.LatLng = new L.LatLng( d.latitude,
									 d.longitude);
		//console.log(d.time);							 
		var node={
			"latitude" : d.latitude,
			"longitude" : d.longitude,
			"depth" : d.depth,
			"mag" : +d.mag,
			"time" : new Date(d.time),//parsing time
			"date" : d.time,
			"magType" : d.magType,
			"place" : d.place,
			"type" : d.type,
			"LatLng" : d.LatLng
			
		}
		
		datatorender.push(node);
	})

	function defineScale(){
	
	sizeScale = d3.scale.linear()
    .domain([d3.min(datatorender,function(d) { return d.mag}),d3.max(datatorender,function(d) { return d.mag})])
	.range([3,13]);
	}
	
defineScale();//----------------------------------------------------------------
	// set projection
//	var projection = d3.geo.albersUsa();
/*var projection = d3.geo.mercator()
    .center([0, 5 ])
    .scale(900)
    .rotate([-180,0]);*/
// create path variable
//var path = d3.geo.path()
 //   .projection(projection);
	//----------------------------------------------------------------
	
	//----------------------------------------------------------------
	//Defining popup
	var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("Latitude : " + e.latlng.lat + ", Longitude : " +e.latlng.lng)
        .openOn(map);
	}
	function onDatapointMapClick(d) {
    popup
        .setLatLng(d.LatLng)
        .setContent("Latitude : " + d["latitude"] + ", Longitude : " +d["longitude"] + ",<br/>Place : " + d["place"] + ",<br/> Date and Time : " + d["date"] )
        .openOn(map);
	}
	
	
	
	map.on('click', onMapClick);
	
	//----------------------------------------------------------------
		var feature = g.selectAll("circle")
			.data(datatorender,function(d){return d.LatLng;})
			.enter().append("circle")
			.style("stroke", "black")  
			.style("opacity", .5) 
			.style("fill", "red")
			.attr("r", function(d){//console.log("size : " + d.mag);
				return sizeScale(d.mag);})
			.attr("pointer-events","visible");
			
			
	map.on("viewreset", update);
		update();

		function update() {
			feature.attr("transform", 
			function(d) { 
			var coor = map.latLngToLayerPoint(d.LatLng);
				return "translate("+ 
					coor.x +","+ 
					coor.y +")";
				}
			)	
		}
/*var feature = svg.selectAll("cirlce")
			.data(datatorender)
			.enter().append("circle")
		.attr("cx", function (d) {console.log(projection([d.longitude,d.latitude])[0] + "  " + projection([d.longitude,d.latitude])[1]); return projection([d.longitude,d.latitude])[0]; })
		.attr("cy", function (d) { return projection([d.longitude,d.latitude])[1]; })
			.attr("r", 20)
           .style("fill", "red")
		   .style("opacity", 0.75);*/
		   
	//-----------------------------Click on data point---------------------------------------- 
//Function that defines the click action in data points
function clickOnMapDataPoints(){
	svg.selectAll("circle") //Providing mouseover event on all the data points.
	.on("mouseover",function(d){
		//console.log("mouseover")
		d3.select(this).style("fill","yellow");//highlighting only the selected data point.
		//console.log(d["latitude"]);
       /*     div.transition()		
                .duration(200)
				.style("opacity", .9);				
            div.html("Latitude:"+d["latitude"] + "<br/>"  
			+"Longitude :"+d["longitude"] + "<br/>"
			+"Depth :"+d["depth"] + "<br/>");*/
			onDatapointMapClick(d);
			
			//Highlighting crresponding data point in the scatterplot 
			svgscatter.selectAll("circle")
			.filter(function(e) {
            return e["longitude"] == d["longitude"] && e["latitude"] == d["latitude"];
        }).style("fill","yellow").style("stroke","black").attr("r",6)
		
		
		})
		
	.on("mouseout",function(){ //On mouseout everything will be set back to normal
	map.closePopup(popup);
	
	svg.selectAll("circle")
			.style("opacity", .5)
			.style("stroke","black").style("fill","red");
	if(coordinates !=null){
		maintainHighlightMappointsOnMouseout();
	}
		 
		//Resetting the property of the highlighted datapoint in the scatterplot 	
		var catColor ;
		/*svgscatter.selectAll("circle")
		/*.filter(function(d){
			catColor = color(d["type"]);
			return true;
			
		})
		.style("stroke","darkyellow").style("fill","red").attr("r",4)*/
		//console.log(coordinates);
		if(coordinates != null){
			maintainHighlightScatterPlotpointsOnMouseout();
		}else{
			svgscatter.selectAll("circle")
				.style("stroke","darkyellow").style("fill","red").attr("r",4)
		}
		}) 
	
	}
	
	clickOnMapDataPoints();
//------------------------------------------------------------------------------
	
	
	//-------------------------------------------------------------------------
	var svgscatter = d3.select("#scatterplot").append("svg")
    .attr("width", width  )
    .attr("height", height )
  .append("g")
    .attr("transform", "translate(" +( margin.left + 30	) + ",0)");
	 
	 //Declaring the type of x axis value and its dimensions
 //   var x = d3.time.scale.utc()
 //   .range([0, width - 50]);
 var x = d3.scale.linear()
   .range([0, width - 50]);
	
	//Declaring the type of y axis value and its dimesions
	var y = d3.scale.linear()
    .range([height, 0]);
	
	//Defining x axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

//Defining y axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

//Defining x axis
 x.domain([d3.min(datatorender, function(d) { return d["depth"]; }),d3.max(datatorender, function(d) { return  d["depth"]; })]);
//Defining y axis 
 y.domain([d3.min(datatorender, function(d) { return d["mag"]; })-0.5,d3.max(datatorender, function(d) { return  d["mag"]; })]).nice();
 
 svgscatter.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height-35) + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
	  .attr("transform", "translate(0,40)")
      .attr("x", width/2)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Depth in KM");
	 

	  
//Drawing y axis on the canvas	  
  svgscatter.append("g")
      .attr("class", "y axis")
	  .attr("transform", "translate(0,10)")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "translate(-45,"+(height/2)+")rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Magnitude");
	  
//Ploting the data points in the graph
function plotDataPoints(){
  svgscatter.selectAll(".dot")
      .data(datatorender)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 4) //specifying the radius of the circle/data point
      .attr("cx", function(d) {
		   if(d["depth"]>=0)
			return x(d["depth"]);
	   })
	   
      .attr("cy", function(d) {
       return y(d["mag"]); })
	  .style("opacity", .5)
	  .style("stroke", "darkyellow")
      .style("fill", "red")
	
}
plotDataPoints()

function clickOnScatterPlotDataPoints(){
	var colorBackup; 
	svgscatter.selectAll("circle") //Providing mouse over event on all the data points.
	.on("mouseover",function(d){
		colorBackup = d3.select(this).style("fill");
		console.log("colorBackup : " + colorBackup );
		d3.select(this)
		.style("stroke","black")
		.style("fill","yellow")//highlighting only the selected data point.
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html("Magnitude : "+d["mag"]+d["magType"]+ "<br/>"  + "Depth : "+d["depth"])	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
      	
		
		svg.selectAll("circle")
			.filter(function(e) {
            return e["longitude"] == d["longitude"];
        }).style("fill","yellow").style("stroke","black")
		onDatapointMapClick(d);
		
		})
	
	.on("mouseout",function(){ //On mouseout everything will be set back to normal
		d3.select(this).style("stroke","darkyellow").style("fill",colorBackup)
		 div.transition()		
                .duration(500)		
                .style("opacity", 0);

		svg.selectAll("circle")
			.style("opacity", 0.5) .style("fill","red").style("stroke","black")
		map.closePopup(popup);
	}) }
clickOnScatterPlotDataPoints()
showRequiredDataPoints()

function showRequiredDataPoints(){

bounds = map.getBounds();
		console.log("bounds._northEast.lat :"+bounds._northEast.lat);
		svgscatter.selectAll("circle")
			.style("opacity",0);	
			//Highlighting corresponding data point in the scatterplot 
			svgscatter.selectAll("circle")
			.filter(function(d) {
            return bounds._southWest.lng < d["longitude"] && bounds._northEast.lng > d["longitude"] && bounds._northEast.lat > d["latitude"] && bounds._southWest.lat < d["latitude"];
        }).style("opacity",0.5)
}
 	//------------------------------------------------------------------------
	
	//---------------------------------------------------------------
	

var coordinates ;
var topLeftLat;
var topLeftLng;

var topRightLat;
var topRightLng;


var bottomLeftLat;
var bottomLeftLng;

var bottomRightLat;
var bottomRightLng;
 
/*var rect = L.rectangle( [[ -22.285031172047496, -36.5625], [-36.85149229076091, -14.414062499999998]], {color: 'blue', weight: 2});*/
var rect = L.rectangle( [[ 36.296237867727136, -70.13671875], [28.128836230428753, -55.1953125]], {color: 'blue', weight: 2});
map.addLayer(rect);
rect.editing.enable();

rect.on('edit', function(e) { 

/*var coordinates = e.target.getLatLngs();
var topLeftLat = coordinates[1].lat;
var topLeftLng = coordinates[1].lng;

var topRightLat = coordinates[2].lat;
var topRightLng = coordinates[2].lng;


var bottomLeftLat = coordinates[0].lat;
var bottomLeftLng = coordinates[0].lng;

var bottomRightLat = coordinates[3].lat;
var bottomRightLng = coordinates[3].lng;*/
 coordinates = e.target.getLatLngs();
 topLeftLat = coordinates[1].lat;
 topLeftLng = coordinates[1].lng;

 topRightLat = coordinates[2].lat;
 topRightLng = coordinates[2].lng;


 bottomLeftLat = coordinates[0].lat;
 bottomLeftLng = coordinates[0].lng;

 bottomRightLat = coordinates[3].lat;
 bottomRightLng = coordinates[3].lng;

//console.log("MOVED : " + coordinates + "afdasf" + coordinates[0].lat); 
	
	svg.selectAll("circle")
		.style("fill", "red").style("stroke","black");
		
	svgscatter.selectAll("circle")
		.attr("r",4).style("fill","red");
	
	svg.selectAll("circle")
			.filter(function(d) {
				//console.log("inside function");
            return (d["latitude"] < topLeftLat && d["latitude"] > bottomRightLat && d["longitude"] < bottomRightLng && d["longitude"] > topLeftLng);
        }).style("fill","green").style("stroke","black")

	var info = "Earthquake details of selected areas \n"
	svg.selectAll("circle").each(function(d){
				if(d["latitude"] < topLeftLat && d["latitude"] > bottomRightLat && d["longitude"] < bottomRightLng && d["longitude"] > topLeftLng){
					
					//console.log(d["latitude"])
					info = info + "\n>" +  d["place"] + "| Magnitude : "+d["mag"]+d["magType"] + "| Depth : " + d["depth"]+ "KM | Time :" + d["date"];
				}			
			});
			
	svgscatter.selectAll("circle").filter(function(d){
				return d["latitude"] < topLeftLat && d["latitude"] > bottomRightLat && d["longitude"] < bottomRightLng && d["longitude"] > topLeftLng;
				})
				.attr("r", 6).style("fill", "cyan");	
				
			//console.log(info);
	/*var info = "";	
	var finalArray = result[0];
	//console.log( "result.size() : "+result.size());
	console.log(result);
	console.log("finalArray : "+finalArray);
	for(var i=0;i<finalArray.length;i++){
		var output = finalArray[i].data("latitude");
		console.log(output);
	//	info = info + data["place"];
	}
	
	console.log(info);*/
		d3.select("#details").style("display","block").text(info);

});


	//---------------------------------------------------------------
	
	//---------------------Zoom activity------------------------------------------
	function highlightZoomedPoints(e){
		console.log("inside new method");
		var map = e.target,
		bounds = map.getBounds();
		console.log("bounds._northEast.lat :"+bounds._northEast.lat);
		svgscatter.selectAll("circle")
			.style("opacity",0);	
			//Highlighting corresponding data point in the scatterplot 
			svgscatter.selectAll("circle")
			.filter(function(d) {
            return bounds._southWest.lng < d["longitude"] && bounds._northEast.lng > d["longitude"] && bounds._northEast.lat > d["latitude"] && bounds._southWest.lat < d["latitude"];
        }).style("opacity",0.5)
		
	}
	
	map.on('zoomend', function(e) {
		highlightZoomedPoints(e);f
	});
	
	map.on('moveend', function(e) {
		highlightZoomedPoints(e);
	});

	//---------------------------------------------------------------
	
	function maintainHighlightScatterPlotpointsOnMouseout(){

//console.log("MOVED : " + coordinates + "afdasf" + coordinates[0].lat); 
		
	svgscatter.selectAll("circle")
		.attr("r",4).style("fill","red");
	
	svgscatter.selectAll("circle").filter(function(d){
				return d["latitude"] < topLeftLat && d["latitude"] > bottomRightLat && d["longitude"] < bottomRightLng && d["longitude"] > topLeftLng;
				})
				.attr("r", 6).style("fill", "cyan");
	}
	
	function maintainHighlightMappointsOnMouseout(){
		svg.selectAll("circle")
			.filter(function(d) {
				//console.log("inside function");
            return (d["latitude"] < topLeftLat && d["latitude"] > bottomRightLat && d["longitude"] < bottomRightLng && d["longitude"] > topLeftLng);
        }).style("fill","green").style("stroke","black")
	} 
	
	
	});
});