
var map;

var viewModel;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.335216, lng: -121.887814},
        zoom: 12    ,
        fullscreenControl: false,
        mapTypeControl: false
    });


    var service = new google.maps.places.PlacesService(map);
    var request = {
        location: {lat: 37.335216, lng: -121.887814},
        radius: 10000,
        keyword: "apartment"
    };

    infoWindow = new google.maps.InfoWindow();

    service.nearbySearch(request, function(result) {

        viewModel = { apartment: result };
        ko.applyBindings(viewModel);

        viewModel.apartment.forEach(function(apt) {
            var marker = new google.maps.Marker({
                position: apt.geometry.location,
                map: map,
                title: apt.name
            });
            marker.addListener('click', function() {
                infoWindow.close();
                var content = '<div id="info-window"><h3>'+apt.name+'</h3></div>';
                infoWindow.setContent(content);
                infoWindow.open(map,this);
            });

        });

    });

}

var infoWindow;






var menuOpen = false;

function toggleMenu() {

    // Keep the menu at a max width
    var maxWidth = 600;
    var width = $(window).width();
    console.log(width);
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
