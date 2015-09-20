var AMADEUS_KEY = "Q76ryFVSqb5BE6pmBJw9YJtuWsSufclH";

var sortingAlgorithms = {
    "likes": function(a,b) { return b.score - a.score},
    "likes per dollar": function(a,b) { return a.ratio - b.ratio},
    "highest price": function(a,b) { return b.price - a.price},
    "lowest price": function(a,b) { return a.price - b.price}
};



function findAirports(search, response) {
    $.ajax({
        url: "http://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=" + AMADEUS_KEY +"&term=" + search,
    }).done(function(data) {
        response(data);
    });
}

function findTrips() {
    var location = $("#location").val();
    var departureDate = $("#departure-date").val();
    var budget = $("#budget").val();
    
    $("#loading-small").show();
    
    $("#list-results").empty();

    var response = $.get("http://localhost:2020/node/findtrip?departure_location=" + location + "&depart_date=" + departureDate + "&budget=" + budget, 
        function(data) {
            /*data.locations_with_scores = */data.locations_with_scores.forEach(function(location) {
                location.ratio = location.price / location.score;
            });
            //alert("data: " + JSON.stringify(data));

            $("#loading-small").hide();

            $('#sorting').change( function() {
                var sortingLabel = $('#sorting option:selected').val();
                data.locations_with_scores = data.locations_with_scores.sort(sortingAlgorithms[sortingLabel]);
                makeTable(data);
            });

            makeTable(data);
            drawMapStuff(data);
            $('html, body').animate({
                scrollTop: $("#map").offset().top
            }, 2000);

        });
    //alert("response: " + JSON.stringify(response));
}

function makeTable(data){
    $("#list-results").empty();
    
    var locations = data.locations_with_scores;
    for( var i = 0; i < locations.length; i++ ) {
        //alert(JSON.stringify(locations[i]));
        var item = locations[i];
        $("#list-results").append("<li class='list-group-item'><div class='row'><div class='col-md-4'><h2>" + item.name.replace(/([A-Z])/g, ' $1') + "</h2><h3>" + item.country + "</h3></div><div class='col-md-4'><h4>$" + item.price + "</h4><h4><span class='glyphicon glyphicon-thumbs-up'></span>" + parseInt(item.score, 10) + "</h4></div></div></li>");
    }
}

//var flights = [];
function drawMapStuff(data){
    /*for(var i=0; i < flights.length; i--){
        flights.pop().setMap(null);
    }
    */
    var dep_lon = data.departure_lon;
    var dep_lat = data.departure_lat;

    map.setCenter({lat: dep_lat, lng: dep_lon});
    
    data = data.locations_with_scores;
    
    var bounds = new google.maps.LatLngBounds();

    bounds.extend(new google.maps.LatLng(dep_lat, dep_lon));

    for(var i=0; i < data.length;i++){
        //alert(JSON.stringify(data[i]));
        var path_coords = [{lat: dep_lat, lng: dep_lon}, {lat: data[i].lat, lng: data[i].lng}];

        bounds.extend(new google.maps.LatLng(data[i].lat, data[i].lng));

        var flightPath = new google.maps.Polyline({
                                                  path: path_coords,
                                                  geodesic: true,
                                                  strokeColor: '#FF0000',
                                                  strokeOpacity: 1.0,
                                                  strokeWeight: 2
                                                  });

            flightPath.setMap(map);

    }

    map.fitBounds(bounds);


    //flights.push(flightPath);
}

$( document ).ready(function() {
    // Bind event handlers
    $("#location").autocomplete({
        source: function(request, response) {
            findAirports(request.term, response);
        }
    });
    
    $("#btn-find-trips").click(findTrips);
});
