retrieveNeighberhoods().then(function(data){
	drawNeighborhoods(data);
})

retrieveStreets().then(function(data){
	drawStreets(data);
})

retrieveArteries().then(function(data){
	drawArteries(data);
})

retrieveFreeways().then(function(data){
	drawFreeways(data);
})

var height = 550;
var width = 800;


var projection = d3.geo.mercator().scale(1).translate([0, 0]);
	var path = d3.geo.path().projection(projection);

var svg = d3.select("#sf-svg-map")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

var rect = svg.append("rect")
			  .attr("height", height)
			  .attr("width", width)
			  .attr("fill", "#BADDFF");


function retrieveNeighberhoods(){
	 var deferred = Q.defer();
	 d3.json("data/neighborhoods.json", function(error, data) {
	 	 deferred.resolve(data);	
	});
	return deferred.promise;
}

function retrieveStreets(){
	 var deferred = Q.defer();
	 d3.json("data/streets.json", function(error, data) {
	 	 deferred.resolve(data);	
	});
	return deferred.promise;
}

function retrieveArteries(){
	 var deferred = Q.defer();
	 d3.json("data/arteries.json", function(error, data) {
	 	 deferred.resolve(data);	
	});
	return deferred.promise;
}

function retrieveFreeways(){
	 var deferred = Q.defer();
	 d3.json("data/freeways.json", function(error, data) {
	 	 deferred.resolve(data);	
	});
	return deferred.promise;
}


function drawNeighborhoods(data){
	projection.scale(getBoundsAndScale(data)[1]).translate(getBoundsAndScale(data)[2]);

	svg.selectAll("path")
		.data(data.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "neighborhoods")
		.style("fill", '#E9E5DC')
		.style("stroke", "gray");
}

function drawStreets(data){
	svg.selectAll(".street-path")
       .data(data.features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("fill", "none")
       .attr("stroke", "white")
       .attr("stroke-width", 1);
}

function drawArteries(data){
	svg.selectAll(".arter-path")
	   .data(data.features)
	   .enter()
	   .append("svg:path")
	   .attr("d", path)
	   .attr("fill", "none")
	   .attr("stroke", "white")
	   .attr("stroke-width", 2);
}

	
function drawFreeways(data){
	svg.selectAll(".freeway-path")
       .data(data.features)
       .enter()
       .append("svg:path")
       .attr("class", "freeway-path")
       .attr("d", path)
       .attr("fill", "none")
       .attr("stroke", '#F29A1A')
       .attr("stroke-width", 1);
}


function getBoundsAndScale(aFeature) {
  var nB = path.bounds(aFeature),
      nS = .95 / Math.max((nB[1][0] - nB[0][0]) / width, (nB[1][1] - nB[0][1]) / height),
      nT = [(width - nS * (nB[1][0] + nB[0][0])) / 2, (height - nS * (nB[1][1] + nB[0][1])) / 2];
  return [nB, nS, nT];
}
