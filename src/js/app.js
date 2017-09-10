var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8,
        fullscreenControl: false,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    });
}

var menuOpen = false;
function toggleMenu() {
    if (menuOpen) {
        menuOpen = false;
        document.getElementById("main-menu").style.left = "-500px";
        document.getElementById("map").style.marginLeft = "0";
    } else {
        menuOpen = true;
        document.getElementById("main-menu").style.left = "0";
        document.getElementById("map").style.marginLeft = "500px";
    }
}
