var request = require('request');
var INSTAGRAM_ACCESS_TOKEN = "2203667027.0b2763d.0855e602c01c4de49ab037f52f771ad1";
var blah = 0;


//Main function to be called by frontend
function getOptimalTrip(userParams){
	var locations = getLocationsByBudget(userParams);
	var locationsWithScores = locations.map(calculateLocationScore);
	return locationsWithScores.sort(function(a,b) { return a.score - b.score});
}

//Grab Locations from Amadeus API
function getLocationsByBudget(userParams){
    /*console.log("http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?" +
     "origin=" + userParams.origin +
     "&departure_date=" + userParams.departure_date +
     "&duration=" + userParams.duration +
     "&max_price=" + userParams.max_price +
     "&apikey=" + AMADEUS_KEY);
     */
    request("http://api.sandbox.amadeus.com/v1.2/flights/inspiration-search?" +
            "origin=" + userParams.origin +
            "&departure_date=" + userParams.departure_date +
            "&duration=" + userParams.duration +
            "&max_price=" + userParams.max_price +
            "&apikey=" + AMADEUS_KEY,
            function(err, response, body){
            getCitiesFromAirports(body, 0);
            console.log(body);
            });
    
    
}
​
function getCitiesFromAirports(amadeus_params, index){
    
    //console.log("===========\n" + amadeus_params + "\n=============");
    //console.log("///////////\n" + JSON.stringify(JSON.parse(amadeus_params).results[0]) + "\n////////////\n");
    
    var iata_code = JSON.parse(amadeus_params).results[index].destination;
    
    request("https://api.sandbox.amadeus.com/v1.2/" +
            "location/" + iata_code +
            "?apikey=" + AMADEUS_KEY,
            function(error, resp, body){
                //amadeus_params.results[index].city = body.city;
                
                index++;
                if(index == JSON.parse(amadeus_params).results.length){
                //END
                //console.log(amadeus_params);
                }
                else{
                //continue
                //console.log(body);
                    getCitiesFromAirports(amadeus_params, index);
                }
            });
    
}


//Calculate instagram scores for each location
function calculateLocationScore(location){

}

//Given Instagram API data, calculate bonus
function postsToScore(location, posts){
	var sortedPosts = posts.sort(function(a,b) { return a.likes.count - b.likes.count; });
	var postsWithoutOutliers = sortedPosts.splice(Math.floor(sortedPosts.length/10), 
												  Math.ceil(sortedPosts.length*9/10));
	var totalLikes = 0;
	for(var i = 0; i < postsWithoutOutliers.length; i++){
		totalLikes += postsWithoutOutliers[i].likes.count;
	}
	var normalizedLikes = totalLikes/postsWithoutOutliers.length;
	location.score = normalizedLikes;
	return location;

function getRecentPostsByTag(tagName, cb) {
	var accessToken = ACCESS_TOKEN;
	var url = "https://api.instagram.com/v1/tags/"
	+ tagName + "/media/recent?access_token=" + accessToken;
	request(url, function(error, response, body) {
	  	console.log("Status code: " + response.statusCode);
	  	cb(JSON.parse(body));
	});
}