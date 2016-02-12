var routes = {};
var busUpdate = {};
var errorMessages = {};
var routesObject = {};


getRoutes();

function getRoutes(){
  var url = 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni'
  $.get(url).done(function(xmld){
    routes = $.xml2json(xmld);
    if (routes.Error){
      throw routes.Error;
    } else {
      var infoPromises = []
      $.each(routes.route, function(i, route){
        infoPromises.push(getRouteInfo(route))
      })
      Q.allSettled(infoPromises)
          .then(function (results) {
            populateRoutePicker();
          });
    }
  });
}


function getRouteInfo(route){
  var deferred = Q.defer();
  var info;
  var routeInfoUrl = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r="+route.tag;
  $.get(routeInfoUrl).done(function(xmld){
    info =  $.xml2json(xmld);
    routesObject[info.route.tag] = {
            tag:info.route.tag,
            color:'#'+info.route.color
          }
    deferred.resolve(routesObject);
  });
  return deferred.promise;
}

function drawBuses(route){
  
  var url = 'http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r='+route+'&t=0';
  var color = routesObject[route].color
  $.get(url).done(function(xmld){
    var buses = $.xml2json(xmld);
    if(buses.Error) {
      throw buses.Error;
    } else {
      if(buses.vehicle) {
        // Remove buses from plot for which location has changed
        svg.selectAll("." + 'bus-'+route).data(buses.vehicle, function(d){ return d.id; }).remove();

        svg.selectAll("." + 'bus-'+route).data(buses.vehicle, function(d){ return d.id; })
           .enter()
           .append("ellipse")
           .attr("class", 'bus-'+route)
           .attr("cx", function(d){ return projection([d.lon,])[0]; })
           .attr("cy", function(d){ return projection([,d.lat])[1]; })
           .attr("rx", 5)
           .attr("ry", 5)
           .attr("fill", color );
      } else {
        displayErrorMessage(route);
      }
    }
  });
}



function displayErrorMessage(route){
  if ( !errorMessages[route] ){
    errorMessages[route] = true;
    $('#errorBox').append("<div class='alert alert-danger alert-dismissible' role='alert'>"
                          +"<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
                          +"Route "+ route +" is not active at the moment</div>");
  }
}




function populateRoutePicker(){
    $.each(routesObject, function(i, d){
      $('#sf-route-picker').append("<div>"
                                 + "<input type='checkbox' id="+d.tag+"><span class='route-label' style='background-color:" + d.color + "'>" + d.tag + "</span></input>"
                                 + "</div>");
    });

    $("#sf-route-picker").on('change', 'input[type="checkbox"]', function(b){
      if (document.getElementById(b.target.id).checked){
        drawBuses(b.target.id);
        busUpdate[b.target.id] = window.setInterval(function(){
          drawBuses(b.target.id);
        },15000)
      }else{
        //remove bus when you uncheck the box
        svg.selectAll(".bus-" + b.target.id).remove();
        errorMessages[b.target.id] = false;
        window.clearInterval(busUpdate[b.target.id]);
      }
      
    });
}


