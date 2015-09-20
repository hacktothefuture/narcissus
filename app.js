var request = require('request');
var async = require('async');
var express = require('express');
var util = require('util');
// var narcutil = require('narcutil');
var countryLookup = require('country-data').lookup;
var countries = require('country-data').countries;
var app = express();

var INSTAGRAM_ACCESS_TOKEN = "2203667027.0b2763d.0855e602c01c4de49ab037f52f771ad1";
var AMADEUS_KEY = "Q76ryFVSqb5BE6pmBJw9YJtuWsSufclH";
var MAX_ID;

app.get('/node/findtrip', function(req, resp) {
    var userParams = getUserParams(req);
    function sendTopLocations(locationsWithScores) {
    	var departure_location = {'destination' : userParams.departure_location};
    	getCity(departure_location, function(err, result) {
			var resultJson = {
				'departure_lat' : result.lat,
				'departure_lon' : result.lng,
				'departure_country' : result.country,
				'departure_state' : result.state,
				'locations_with_scores' : locationsWithScores
			}
		    resp.send(resultJson);
            console.log(resultJson);
    	});
    	
    }
    getOptimalTrip(userParams, sendTopLocations);
});

app.get('/', function(req, response) {
    return 'Hello, World!';
});

function testfn() {
    var userParams = {
        'departure_location' : "BOS",
        'depart_date' : "2015-09-20",
        'budget' : "600"
    };
    function cb(locationsWithScores) {
        console.log("HERE WE GO");
        console.log(locationsWithScores);
    }
    getOptimalTrip(userParams, cb);
}

// console.log(narcutil.getCountryName('KY'));
console.log(countries['US'].name);

//testfn();

function getUserParams(req) {
    console.log(req);
    return {
        'departure_location' : req.query.departure_location,
        'depart_date' : req.query.depart_date,
        'return_date' : req.query.return_date,
        'budget' : req.query.budget
    };
}
//Main function to be called by frontend
function getOptimalTrip(userParams, sendTopLocations) {
    getLocationsByBudget(userParams, function(amadeus_params) {
        if(amadeus_params == undefined){
            return;
        }
        console.log(amadeus_params.results);
        amadeus_params.results = amadeus_params.results.filter(function(x) {
            return x.hasOwnProperty('name');
        })
        if(amadeus_params.results == 0){
            sendTopLocations([]);
        }
        var unixTimeStamp = Date.parse(amadeus_params.results[0].departure_date)/1000 - (365*24*3600)+1;

        getTagIdForDate(unixTimeStamp, function(err, maxTagId) {
            MAX_ID = maxTagId.substr(0, maxTagId.indexOf('_'));
            async.map(amadeus_params.results, calculateLocationScore,
                function(err, locationsWithScores) {
                    if (err) {
                        console.log("Error occurred in getOptimalTrip");
                        return sendTopLocations(err);
                    }
                    sendTopLocations(locationsWithScores.sort(function(a,b) { return b.score - a.score}));
                });
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
                "&aggregation_mode=COUNTRY" +
                "&apikey=" + AMADEUS_KEY,
            function(err, res, body){
            	if (err || res.statusCode != 200) {
            	   console.log("Status code: " + res.statusCode);
            	    console.log(body);
            	    return returnLocations(err);
            	}
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
		    console.log("Status code: " + res.statusCode);
		    console.log(body);
		    return callback(err);
		}
        var cityData = JSON.parse(body);
		console.log("NAME IS " + JSON.parse(body).airports[0].city_name);
		result.name = cityData.airports[0].city_name.replace(/\s+/g, '');
		// result.country = narcutil.getCountryName(cityData.airports[0].country);
        // result.country = countryLookup.countries({code: cityData.airports[0].country})[0];
        result.country = countries[cityData.airports[0].country].name;
		if (result.country === 'US') {
			result.state = cityData.airports[0].state;
		}
        result.lat = cityData.airports[0].location.latitude;
        result.lng = cityData.airports[0].location.longitude;
		callback(null, result);
	});
}

//Calculate instagram scores for a location
function calculateLocationScore(location, returnLocationWithScore) {
    console.log("BUTTS");
    var unixTimeStamp = Date.parse(location.departure_date)/1000 - (365*24*3600)+1;
    getRecentPostsByTag(location.name, function(err, posts) {
    	if (err) {
    		console.log("Error occurred in calculateLocationScore");
    	    return returnLocationWithScore(err);
    	}
    	location.images = [];
        var sortedPosts = posts.sort(function(a,b) { return b.likes.count - a.likes.count; });
        var postsWithoutOutliers = sortedPosts.splice(Math.floor(sortedPosts.length/10), 
                                                      Math.ceil(sortedPosts.length*9/10));
        var totalLikes = 0;
        for(var i = 0; i < postsWithoutOutliers.length; i++){
            totalLikes += postsWithoutOutliers[i].likes.count;
            if (location.images.length < 6) {
            	location.images.push(postsWithoutOutliers[i].images.standard_resolution.url);
            }
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
    + encodeURI(tagName) + "/media/recent?access_token=" + accessToken+"&max_tag_id="+ MAX_ID + "&count=33";
    console.log(url);
    request(url, function(err, res, body) {
        if (err || res.statusCode != 200) {
            console.log("Status code: " + res.statusCode);
            console.log(body);
            return returnPosts(err);
        }
        returnPosts(null, JSON.parse(body)['data']);
    });
}

//Given tag name, return JSON list of recent posts with that tag
function getTagIdForDate(unixTimeStamp, returnPosts) {
    console.log("LOGAN");
    var accessToken = INSTAGRAM_ACCESS_TOKEN;


    var url =  util.format("https://api.instagram.com/v1/media/search?lat=%d&lng=%d&count=1&access_token=%s&max_timestamp=%s", 
                            40.7127, -74.0059, INSTAGRAM_ACCESS_TOKEN, unixTimeStamp.toString());
    console.log(url);
    request(url, function(err, res, body) {
        if (err || res.statusCode != 200) {
           console.log("Status code: " + res.statusCode);
            console.log(body);
            return returnPosts(err);
        }
        console.log("Status code: " + res.statusCode);
        console.log(err);
        var data = JSON.parse(body)['data'];
        console.log(data);
        console.log(data.length);
        if(data.length == 0){
            console.log("Unsuccessful search, check hour later")
            return getTagIdForDate(unixTimeStamp+3600, returnPosts);
        }

        returnPosts(null, data[0]['id']);
    });
}

var server = app.listen(2020, function() {
    console.log("Listening on port 2020...");
});
