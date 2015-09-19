//Main function to be called by frontend
function getOptimalTrip(userParams){
	var locations = getLocationsByBudget(userParams);
	var locationsWithScores = locations.map(calculateLocationScore);
	return locationsWithScores.sorted();
}

//Grab Locations from Amadeus API
function getLocationsByBudget(userParams){

}


//Calculate instagram scores for each location
function calculateLocationScore(location){
	
}