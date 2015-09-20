var AMADEUS_KEY = "Q76ryFVSqb5BE6pmBJw9YJtuWsSufclH";

function findAirports(search, response) {
    $.ajax({
        url: "http://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=" + AMADEUS_KEY +"&term=" + search,
    }).done(function(data) {
        response(data);
    });
}

$( document ).ready(function() {
    // Bind event handlers
    $("#location").autocomplete({
        source: function(request, response) {
            findAirports(request.term, response);
        }
    });
});
