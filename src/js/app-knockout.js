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

    this.selectedListing = {
        name: ko.observable("DEFAULT NAME"),
        // description: ko.observable("DEFAULT DESCRIPTION"),
        address: ko.observable("DEFAULT ADDRESS"),
        hours: ko.observable("DEFAULT HOURS"),
        phone: ko.observable("DEFAULT PHONE"),
        website: ko.observable("DEFAULT WEBSITE")
    };

    // All the markers that get created on the Google Map
    this.markers = {};

    // Used to keep state of which pane is showing
    this.showingPlaceInfo = ko.observable(false);
    this.showingListings = ko.observable(true);
    this.showingCredits = ko.observable(false);

    self.showPlaceInfo = function(place) {
        // hide all panes except place info
        self.showingPlaceInfo(true);
        self.showingListings(false);
        self.showingCredits(false);

        var request = { placeId: place.place_id };

        var service = new google.maps.places.PlacesService(map);
        service.getDetails(request, function(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                self.selectedListing.name(place.name);
                self.selectedListing.address(place.formatted_address);
                self.selectedListing.phone(place.formatted_phone_number);
                self.selectedListing.website(place.website);
            }
        });

    };

    self.showListings = function(place) {
        // switch panes from listings to location info pane
        self.showingCredits(false);
        self.showingPlaceInfo(false);
        self.showingListings(true);

        // self.selectedListing.name(place.name);
    };

    self.showCredits = function() {
        self.showingCredits(!self.showingCredits());
        self.showingPlaceInfo(false);
        self.showingListings(false);
    }
};

// Custom knockout binding to fade elements in or out
ko.bindingHandlers.fadeVisible = {
    // Start visible/invisible according to initial value
    init: function(element, valueAccessor) {
        var visible = valueAccessor();
        // visible is a knockout observable, need to get value using ()
        visible = visible();
        $(element).toggle(visible);
    },
    // On update, fade in/out
    update: function(element, valueAccessor) {
        var visible = valueAccessor();
        // visible is a knockout observable, need to get value using ()
        visible = visible();
        visible ? $(element).fadeIn() : $(element).fadeOut();
    }
};

var viewModel = new ViewModel();

ko.applyBindings(viewModel)
