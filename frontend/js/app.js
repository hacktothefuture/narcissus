var AMADEUS_KEY = "Q76ryFVSqb5BE6pmBJw9YJtuWsSufclH";

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

    var response = $.get("http://localhost:2020/node/findtrip?departure_location=" + location + "&depart_date=" + departureDate + "&budget=" + budget, function(data) {
        makeTable(data);
    });
}

function makeTable(data){
    $("#list-results").empty();
    
    var locations = data.locations_with_scores;
    
    for( var i = 0; i < locations.length; i++ ) {
        var item = locations[i];
        $("#list-results").append("<li class='list-group-item'><h2>" + item.name.replace(/([A-Z])/g, ' $1') + "</h2><h3>$" + item.price + "</h3><h3>" + parseInt(item.score, 10) + "</h3></li>");
    }
}

function drawMapStuff(data){

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
