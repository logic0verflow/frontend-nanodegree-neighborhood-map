
var map;

var viewModel = {};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.335216, lng: -121.887814},
        zoom: 12    ,
        fullscreenControl: false,
        mapTypeControl: false
    });


    infoWindow = new google.maps.InfoWindow();

    var callBack = function(itemName) {
        return function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                viewModel[itemName] = results;

                viewModel[itemName].forEach(function(item) {

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

                    marker.addListener('click', function() {
                        infoWindow.close();
                        var content = '<div id="info-window"><h3>'+item.name+'</h3></div>';
                        infoWindow.setContent(content);
                        infoWindow.open(map,this);
                    });

                });
            } else {
                console.log("FAIL");
            }
        }
    }

    var service = new google.maps.places.PlacesService(map);

    var requestApartments = {
        location: {lat: 37.335216, lng: -121.887814},
        radius: 10000,
        keyword: 'apartment'
    };
    service.nearbySearch(requestApartments, callBack('apartment'));

    var requestGroceries = {
        location: {lat: 37.335216, lng: -121.887814},
        radius: 10000,
        keyword: 'groceries'
    };
    service.nearbySearch(requestGroceries, callBack('groceries'));

    var requestGames = {
        location: {lat: 37.335216, lng: -121.887814},
        radius: 10000,
        keyword: 'games'
    };
    service.nearbySearch(requestGames, callBack('games'));

    var requestTheater = {
        location: {lat: 37.335216, lng: -121.887814},
        radius: 10000,
        keyword: 'movies'
    };
    service.nearbySearch(requestTheater, callBack('movies'));

    var requestParks = {
        location: {lat: 37.335216, lng: -121.887814},
        radius: 10000,
        keyword: 'parks'
    };
    service.nearbySearch(requestParks, callBack('parks'));

}

var infoWindow;






var menuOpen = false;

function toggleMenu() {

    // Keep the menu at a max width
    var maxWidth = 600;
    var width = $(window).width();
    // console.log(width);
    width = (width > maxWidth) ? maxWidth : width;
    menuWidth = width * 0.9;
    menuWidth += "px";
    $("#main-menu").css("width", menuWidth);

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
