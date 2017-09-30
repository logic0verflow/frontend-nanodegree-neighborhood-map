
var map,
    infoWindow,
    menuOpen = false;

/**
 * Sets up the Google Map and requests all the data needed for the markers
 */
function initMap() {
    // Setup the page Google Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.335216, lng: -121.887814},
        zoom: 12    ,
        fullscreenControl: false,
        mapTypeControl: false
    });

    // Initialize the single info window used on the map
    infoWindow = new google.maps.InfoWindow();

    /**
     * Use this callback function when requesting information from the
     * nearbySearch within the PlacesServices library.
     * @param {string} itemName - The name/type of the item requested, used as
     *                            a key when accessing the ViewModel
     * @return {function} - Anonymous function that saves the results from the
     *                      request, creates markers with listeners, and saves
     *                      the markers.
     */
    var callBack = function(itemName) {
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

                    // Open infoWindow with point details when marker is clicked
                    marker.addListener('click', function() {
                        // If a marker is clicked, close any infoWindow that is
                        // open
                        infoWindow.close();
                        // Setup content to display in infoWindow
                        var content = '<div id="info-window"><h3>' +
                                      item.name +
                                      '</h3></div>';
                        infoWindow.setContent(content);
                        infoWindow.open(map,this);
                    });

                    // marker.listingType = itemName;
                    // viewModel.markers.push(marker);
                    if (viewModel.markers[itemName] == undefined) {
                        viewModel.markers[itemName] = [marker];
                    } else {
                        viewModel.markers[itemName].push(marker);
                    }
                });

                initFilters(itemName);
            }
            // If the request failed, do something here
            else {
                console.log("nearbySearch request failed!");
            }

        }
    }

    var service = new google.maps.places.PlacesService(map);
    // all request rely on the same location and radius
    var loc = {lat: 37.335216, lng: -121.887814},
        rad = 10000;

    // Setup and search for nearby places for serveral different types

    var requestApts = { location: loc, radius: rad, keyword: 'apartment' };
    service.nearbySearch(requestApts, callBack('apartment'));

    var requestGroceries = { location: loc, radius: rad, keyword: 'groceries' };
    service.nearbySearch(requestGroceries, callBack('groceries'));

    var requestGames = { location: loc, radius: rad, keyword: 'games' };
    service.nearbySearch(requestGames, callBack('games'));

    var requestTheater = { location: loc, radius: rad, keyword: 'movies' };
    service.nearbySearch(requestTheater, callBack('movies'));

    var requestParks = { location: loc, radius: rad, keyword: 'parks' };
    service.nearbySearch(requestParks, callBack('parks'));
}

// Toggles the menu to show or hide
function toggleMenu() {

    // Keep the menu at a max width
    var maxWidth = 600;
    // make the window 90% the width of the viewport unless it would be too wide
    var width = $(window).width();
    width = (width > maxWidth) ? maxWidth : width;
    menuWidth = width * 0.9;
    menuWidth += "px";

    // Apply the final width each time to catch window resizing
    $("#main-menu").css("width", menuWidth);
    // Move the menu in view and shrink the map element
    if (menuOpen) {
        menuOpen = false;
        document.getElementById("main-menu").style.left = "-" + menuWidth;
        document.getElementById("menu-toggle").style.left = "0";
        document.getElementById("map").style.marginLeft = "0";
    } else {
        menuOpen = true;
        document.getElementById("main-menu").style.left = "0";
        document.getElementById("menu-toggle").style.left = menuWidth;
        document.getElementById("map").style.marginLeft = menuWidth;
    }
}

/**
 * Initializes the filers so all markers for a certain type can be removed
 * from the map.
 * @param {string} itemName - the type of place the marker can be
 */
function initFilters(itemName) {

    // id - the element id for the filter
    // markers - the map markers associated with the filter
    // show - whether or not the markers should be displayed
    var id, markers, show;

    markers = viewModel.markers[itemName];
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
                markers.forEach(function(marker) {
                    var markerMap = show() ? map : null;
                    marker.setMap(markerMap);
                });
            });

}
