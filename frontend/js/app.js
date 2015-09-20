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
        alert(data);
    });
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
