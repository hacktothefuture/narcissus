var AMADEUS_KEY = "Q76ryFVSqb5BE6pmBJw9YJtuWsSufclH";

var locationTypingTimer;

function populateAirports( airports ) {
    // Clear all current airports
    $("#airport option").slice(1).remove();

    for( var i = 0; i < airports.length; i++ ) {
        var airport = airports[i];
        $("#airport").append("<option value='" + airport.value + "'>" + airport.label + "</option>");
    }
}

function findAirports() {
    var search = $("#location").val();
    
    $.ajax({
        url: "http://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=" + AMADEUS_KEY +"&term=" + search,
    }).done(function(data) {
        populateAirports(data);
    });
}

function findTrips() {
    $("#results-group").empty();
    
    // Query trips
    var location = $("#location").val();
    var departureDate = $("#departure-date").val();
    var returnDate = $("#return-date").val();
    var budget = $("#budget").val();
}

$( document ).ready(function() {
    // Bind event handlers
    $("#btn-find-trips").click(function() { findTrips(); });
    $("#location").keyup(function(){
        clearTimeout(locationTypingTimer);
        if( $("#location").val) {
            locationTypingTimer = setTimeout(findAirports, 500);
        }
    });
});
