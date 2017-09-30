// Knockout ViewModel that stores all the info used by the main menu
var ViewModel = function() {
    var self = this;

    this.apartmentList = ko.observableArray([]);
    this.gamesList = ko.observableArray([]);
    this.moviesList = ko.observableArray([]);
    this.parksList = ko.observableArray([]);
    this.groceriesList = ko.observableArray([]);

    // Allows external resources to add items to the Lists
    this.load = function(type, arr) {
        arr.forEach(function(elem) {
            self[type + 'List'].push(elem);
        });
    };

    // Booleans for whether or not the list should show in menu
    this.showApartments = ko.observable(true);
    this.showGames = ko.observable(true);
    this.showGroceryStores = ko.observable(true);
    this.showMovies = ko.observable(true);
    this.showParks = ko.observable(true);

    // All the markers that get created on the Google Map
    this.markers = {};
};

var viewModel = new ViewModel();

ko.applyBindings(viewModel)
