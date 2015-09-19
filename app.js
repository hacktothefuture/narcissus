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