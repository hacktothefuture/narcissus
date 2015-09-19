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
}