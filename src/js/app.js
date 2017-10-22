
var map,
    markerSelected,
    menuOpen = false;


/**
 * Use this callback function when requesting information from the
 * nearbySearch within the PlacesServices library.
 * @param {string} itemName - The name/type of the item requested, used as
 *                            a key when accessing the ViewModel
 * @return {function} - Anonymous function that saves the results from the
 *                      request, creates markers with listeners, and saves
 *                      the markers.
 */
var nearbySearchCallback = function(itemName) {
    return function(results, status) {
        // if the request made returned back OK and results intact
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            // Save the results in the associated list
            viewModel.load(itemName, results);
            // for each result, create a marker with a listener
            results.forEach(function(item) {

                var marker = new google.maps.Marker({
                    position: item.geometry.location,
                    map: map,
                    title: item.name,
                    icon: {
                        url: 'img/' + itemName + '.png',
                        scaledSize: new google.maps.Size(20, 20),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 10)
                    }
                });

                marker.place_id = item.place_id;
                marker.addListener('click', markerCallback);

                marker.listingType = itemName;
                viewModel.markers.push(marker);
            });

            initFilters(itemName);
        }
        // If the request failed, output that it failed to the console
        else {
            console.log("nearbySearch request failed!");
        }
    }
}


/**
 * Updates the map position, the markers on the map, and the listings available
 * in the menu.
 * @param {object} position - object with latitude and longitude properties as
 *                            lat and lng respectfully.
 */
function updateMapPosition(position) {
    closeMenu();

    map.setCenter(position);
    // Ensure the viewModel is empty before adding data based on the position
    viewModel.clearAll();

    var service = new google.maps.places.PlacesService(map);
    // all request rely on the same radius
    var rad = 10000,
        loc = position;

    // Setup and search for nearby places for serveral different types

    var requestApts = { location: loc, radius: rad, keyword: 'apartment' };
    service.nearbySearch(requestApts, nearbySearchCallback('apartment'));

    var requestGroceries = { location: loc, radius: rad, keyword: 'groceries' };
    service.nearbySearch(requestGroceries, nearbySearchCallback('groceries'));

    var requestGames = { location: loc, radius: rad, keyword: 'games' };
    service.nearbySearch(requestGames, nearbySearchCallback('games'));

    var requestTheater = { location: loc, radius: rad, keyword: 'movies' };
    service.nearbySearch(requestTheater, nearbySearchCallback('movies'));

    var requestParks = { location: loc, radius: rad, keyword: 'parks' };
    service.nearbySearch(requestParks, nearbySearchCallback('parks'));
}


/**
 * Sets up the Google Map and requests all the data needed for the markers
 */
function initMap() {

    // The default position is San Jose, California
    var pos = {lat: 37.335216, lng: -121.887814};


    // Setup the pages Google Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 12    ,
        fullscreenControl: false,
        mapTypeControl: false
    });

    updateMapPosition(pos);

}


function markerCallback(self) {
    // if a marker is passed, use the callback based on the passed marker.
    // Otherwise, base the callback on the calling marker.
    self = (self.place_id == undefined) ? this : self;

    // No need to do anything, marker selected is the same as active marker
    if (self == markerSelected) return;

    // Show the place information when marker is clicked
    viewModel.showPlaceInfo(self.place_id);
    // Center the map around the selected marker
    map.setCenter(self.position);
    // Make the marker bounce for 1.5 seconds
    self.setAnimation(google.maps.Animation.BOUNCE);

    if (markerSelected) {
        markerSelected.setAnimation(null);
    }
    markerSelected = self;
}


function unselectMarker() {
    if (markerSelected) {
        markerSelected.setAnimation(null);
        markerSelected = undefined;
    }
}


function openMenu() {
    var width = document.getElementById("main-menu").offsetWidth;
    width += "px";

    menuOpen = true;
    // Move the menu in view
    document.getElementById("main-menu").style.left = "0";
    document.getElementById("menu-toggle").style.left = width;
    // document.getElementById("map").style.marginLeft = width
}


function closeMenu() {
    var width = document.getElementById("main-menu").offsetWidth;
    width = "-" + width + "px";

    menuOpen = false;
    // Move the menu out of view and shrink the map element
    document.getElementById("main-menu").style.left = width;
    document.getElementById("menu-toggle").style.left = "0";
    // document.getElementById("map").style.marginLeft = "0";
}


// Toggles the menu to show or hide
function toggleMenu() {

    if (menuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}


/**
 * Initializes the filters so all markers for a certain type can be removed
 * from the map.
 * @param {string} itemName - the type of place the marker can be
 */
function initFilters(itemName) {

    // id - the element id for the filter
    // markers - the map markers associated with the filter
    // show - whether or not the markers should be displayed
    var id, show;

    if (itemName == 'apartment') {
        id = 'showApartments';
        show = viewModel.showApartments;
    } else if (itemName == 'games') {
        id = 'showGames';
        show = viewModel.showGames;
    } else if (itemName == 'movies') {
        id = 'showMovies';
        show = viewModel.showMovies;
    } else if (itemName == 'parks') {
        id = 'showParks';
        show = viewModel.showParks;
    } else if (itemName == 'groceries') {
        id = 'showGroceryStores';
        show = viewModel.showGroceryStores;
    }

    // Setup a listener on the filter so all the markers can be toggled based on
    // whether the filter is applied/checked
    document.getElementById(id)
            .addEventListener('click', function() {
                viewModel.markers.forEach(function(marker) {
                    if (marker.listingType == itemName) {
                        marker.setMap( show() ? map : null );
                    }
                });
            });

}



function centerMapOnUser() {
    // Try requesting the users location if HTML5 geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            updateMapPosition(pos);
        });
    }
}
