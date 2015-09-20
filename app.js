var request = require('request');
var async = require('async');
var express = require('express');
var util = require('util');
var app = express();

var INSTAGRAM_ACCESS_TOKEN = "2203667027.0b2763d.0855e602c01c4de49ab037f52f771ad1";
var AMADEUS_KEY = "Q76ryFVSqb5BE6pmBJw9YJtuWsSufclH";
var blah = 0;
app.get('/node/findtrip', function(request, response) {
    var userParams = getUserParams(request);
    function sendTopLocations(locationsWithScores) {
        response.send(locationsWithScores);
    }
    getOptimalTrip(userParams, sendTopLocations);
});
function testfn() {
    var userParams = {
        'departure_location' : "BOS",
        'depart_date' : "2015-09-20",
        'budget' : "200"
    };
    function cb(locationsWithScores) {
        console.log("HERE WE GO");
        console.log(locationsWithScores);
    }
    getOptimalTrip(userParams, cb);
}

testfn();

function getUserParams(request) {
    return {
        'departure_location' : request.params('departure_location'),
        'depart_date' : request.params('depart_date'),
        'return_date' : request.params('return_date'),
        'budget' : request.params('budget')
    };
}
//Main function to be called by frontend
function getOptimalTrip(userParams, sendTopLocations) {
    getLocationsByBudget(userParams, function(amadeus_params) {
        console.log(amadeus_params.results);
        async.map(amadeus_params.results, calculateLocationScore,
            function(err, locationsWithScores) {
                console.log(err);
                sendTopLocations(locationsWithScores.sort(function(a,b) { return b.score - a.score}));
            });
    });
}
//Grab Locations from Amadeus API
function getLocationsByBudget(userParams, returnLocations){
    console.log("http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?" +
                "origin=" + userParams.departure_location +
                "&departure_date=" + userParams.depart_date +
                "&max_price=" + userParams.budget +
                "&apikey=" + AMADEUS_KEY);
     
    request("http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?" +
                "origin=" + userParams.departure_location +
                "&departure_date=" + userParams.depart_date +
                // "&duration=" + userParams.duration +
                "&max_price=" + userParams.budget +
                "&apikey=" + AMADEUS_KEY,
            function(err, response, body){
                console.log("EEPEPP");
                var amadeus_params = JSON.parse(body);
                getCitiesFromAirports(amadeus_params, 0, function() {
                    console.log(JSON.stringify(amadeus_params));
                    returnLocations(amadeus_params);
                });
            });
}

function getCitiesFromAirports(amadeus_params, index, finishCityRetrieval){
    console.log("GUNS");
    //console.log("===========\n" + amadeus_params + "\n=============");
    //console.log("///////////\n" + JSON.stringify(JSON.parse(amadeus_params).results[0]) + "\n////////////\n");
    //console.log(JSON.stringify(amadeus_params));

    async.map(amadeus_params.results, function(result, next) {
    	getCity(result, next);
    }, finishCityRetrieval);    
}

function getCity(result, callback) {
	console.log("YELP");
	var iata_code = result.destination;
	request({
		url: util.format('https://api.sandbox.amadeus.com/v1.2/location/%s?apikey=%s',
			iata_code, AMADEUS_KEY)
	}, function (err, res, body) {
		if (err || res.statusCode != 200) {
			console.log("OH GEE");
			console.log(err);
			console.log("" + res.statusCode);
			return callback(err);
		}
		console.log("NAME IS " + JSON.parse(body).airports[0].city_name);
		result.name = JSON.parse(body).airports[0].city_name;
		callback(null, result);
	});
}

//Calculate instagram scores for a location
function calculateLocationScore(location, returnLocationWithScore) {
    console.log("BUTTS");
    getRecentPostsByTag(location.name, function(posts) {
        var sortedPosts = posts.sort(function(a,b) { return b.likes.count - a.likes.count; });
        var postsWithoutOutliers = sortedPosts.splice(Math.floor(sortedPosts.length/10), 
                                                      Math.ceil(sortedPosts.length*9/10));
        var totalLikes = 0;
        for(var i = 0; i < postsWithoutOutliers.length; i++){
            totalLikes += postsWithoutOutliers[i].likes.count;
        }
        var normalizedLikes = totalLikes/postsWithoutOutliers.length;
        location.score = normalizedLikes;
        console.log(location);
        returnLocationWithScore(null, location)
    });
}

//Given tag name, return JSON list of recent posts with that tag
function getRecentPostsByTag(tagName, returnPosts) {
    console.log("CONNOR");
    var accessToken = INSTAGRAM_ACCESS_TOKEN;
    var url = "https://api.instagram.com/v1/tags/"
    + encodeURI(tagName) + "/media/recent?access_token=" + accessToken;
    console.log(url);
    request(url, function(error, response, body) {
        console.log("Status code: " + response.statusCode);
        console.log(error);
        returnPosts(JSON.parse(body)['data']);
    });
}

//Given tag name, return JSON list of recent posts with that tag
function getTagIdForDate(unixTimestamp, returnPosts) {
    console.log("CONNOR");
    var accessToken = INSTAGRAM_ACCESS_TOKEN;
    var url = "https://api.instagram.com/v1/tags/"
    + encodeURI(tagName) + "/media/recent?access_token=" + accessToken;
    console.log(url);
    request(url, function(error, response, body) {
        console.log("Status code: " + response.statusCode);
        console.log(error);
        returnPosts(JSON.parse(body)['data']);
    });
}

var server = app.listen(80, function() {
    console.log("Listening on port 80...");
});
