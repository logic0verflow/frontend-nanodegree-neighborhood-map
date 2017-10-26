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

    // Custom extender to hide all the markers associated with the observable
    // by setting the map of the marker if the filtered is checked
    ko.extenders.hideMarkers = function(target, type) {
        // subscribe to the observable
        // enabled is true/false for checked/unchecked
        target.subscribe(function(enabled) {
            // Whenever target is being changed, find markers that are of type
            // and set/unset their map
            self.markers.forEach(function(marker) {
                if (marker.listingType == type) {
                    marker.setMap(enabled ? map : null );
                }
            });

        });

        return target;
    };

    // Booleans for whether or not the list should show in menu
    // These are also linked as the filters for markers via the extender
    this.showApartments = ko.observable(true).extend({
        hideMarkers: 'apartment'
    });
    this.showGames = ko.observable(true).extend({
        hideMarkers: 'games'
    });
    this.showGroceryStores = ko.observable(true).extend({
        hideMarkers: 'groceries'
    });
    this.showMovies = ko.observable(true).extend({
        hideMarkers: 'movies'
    });
    this.showParks = ko.observable(true).extend({
        hideMarkers: 'parks'
    });


    // The selected listings and its details
    this.selectedListing = {
        name: ko.observable(),
        address: ko.observable(),
        hours: ko.observableArray(),
        phone: ko.observable(),
        website: ko.observable(),
        websiteShort: ko.observable(),
        photo: ko.observable(),
        nytArticles: ko.observableArray(),
        marker: undefined
    };

    // Stores the status of the request for articles
    this.nytRequestStatus = ko.observable();

    // All the markers that get created on the Google Map
    // this.markers = {};
    this.markers = [];

    // Clear all the stored data
    this.clearAll = function() {
        self.apartmentList([]);
        self.gamesList([]);
        self.groceriesList([]);
        self.moviesList([]);
        self.parksList([]);

        // The selected listings and its details
        self.selectedListing.name(undefined);
        self.selectedListing.address(undefined);
        self.selectedListing.phone(undefined);
        self.selectedListing.website(undefined);
        self.selectedListing.websiteShort(undefined);
        self.selectedListing.hours(undefined);
        self.selectedListing.photo(undefined);
        self.selectedListing.nytArticles([]);
        self.selectedListing.marker = undefined;

        // All the markers that get created on the Google Map
        self.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        self.markers.length = 0;
    };


    // Used to keep state of which pane is showing
    this.showingListings = ko.observable(true);
    this.showingPlaceInfo = ko.observable(false);
    this.showingCredits = ko.observable(false);

    self.updateInfoPane = function(place) {
        // reset all fields of the info pane
        self.selectedListing.name(undefined);
        self.selectedListing.address(undefined);
        self.selectedListing.phone(undefined);
        self.selectedListing.website(undefined);
        self.selectedListing.websiteShort(undefined);
        self.selectedListing.hours(undefined);
        self.selectedListing.photo(undefined);
        self.selectedListing.nytArticles(undefined);


        // Setup the request by allowing the function to take either a place or
        // a place_id
        var request;
        if (place.place_id !== undefined) {
            request = { placeId: place.place_id };
        } else {
            request = { placeId: place };
        }

        // Request the details of the place and update the info pane
        var service = new google.maps.places.PlacesService(map);
        service.getDetails(request, function(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {

                self.updateInfoPaneArticles(place);

                self.selectedListing.name(place.name);
                self.selectedListing.address(place.formatted_address);
                self.selectedListing.phone(place.formatted_phone_number);

                // Setup a place photo banner if one exist
                if (place.photos) {
                    var photoOptions = {maxWidth: 350, maxHeight: 150};
                    var photoUrl = place.photos[0].getUrl(photoOptions);
                    self.selectedListing.photo(photoUrl);
                } else {
                    self.selectedListing.photo('img/no-place-preview.jpg');
                }


                // only setup the short hand version if website found
                if (place.website) {
                    self.selectedListing.website(place.website);

                    // Remove front of the URL if it starts with http or https
                    var shortURL = place.website;
                    if (shortURL.startsWith('http://')) {
                        shortURL = shortURL.slice(7);
                    }
                    else if (shortURL.startsWith('https://')) {
                        shortURL = shortURL.slice(8);
                    }

                    // Shorten further to only the domain of website
                    shortURL = shortURL.slice(0,shortURL.indexOf('/'));
                    // Finally shorten if the domain is still too long
                    if (shortURL.length > 25) {
                        shortURL = shortURL.slice(0,25);
                        shortURL += '...';
                    }

                    self.selectedListing.websiteShort(shortURL);
                }

                // only setup open hours if provided
                if (place.opening_hours) {
                    self.selectedListing.hours(place.opening_hours.weekday_text);
                }
            }
            else {
                self.selectedListing.name(
                    "Oops! We couldn't retrieve the place details."
                );
            }
        });
    };



    // Updates the info pane articles section by requesting for NY Times
    // articles and gracefully displaying any error messages
    self.updateInfoPaneArticles = function(place) {
        // Clear the array of articles
        self.selectedListing.nytArticles([]);
        // Clear the status of any previous request
        self.nytRequestStatus(undefined);



        // Setup the request url
        var searchTerm = place.name;
        var url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
        url += '?' + $.param({
            'api-key': '029a4b3e81e2422d8c8f96d2efb4008b',
            'q': searchTerm
        });

        $.ajax({
            url: url,
            method: 'GET'
        }).done(function(result) {
            var articles = [];
            // As long as the request returned OK and there's articles to display
            if (result.status == 'OK') {

                var nytDocs = result.response.docs;
                // Begin pushing the new ones
                nytDocs.forEach(function(doc) {
                    // Only push an article if a headline and URL exist
                    if (doc.web_url && doc.headline.main) {

                        var article = {
                            web_url: doc.web_url,
                            headline: doc.headline.main
                        };

                        if (article.headline.length > 50) {
                            article.headline = article.headline.slice(0,50);
                            article.headline += '...';
                        }
                        articles.push(article);
                    }
                });
                if (articles.length == 0) {
                    self.nytRequestStatus(
                        'No related articles were found for this location');
                }
            } else {
                self.nytRequestStatus(
                    'The NY Times article request failed because a non OK ' +
                    'status was returned');
            }

            self.selectedListing.nytArticles(articles);

        }).fail(function(err) {
            self.nytRequestStatus(
                'The request for articles from NY Times failed');
        });
    };

    // Updates the info pane, hides the other two panes, finds the marker
    // associated with the place and calls its callback, and opens the menu
    self.showPlaceInfo = function(place) {

        self.updateInfoPane(place);

        // hide all panes except place info
        self.showingListings(false);
        self.showingCredits(false);
        self.showingPlaceInfo(true);

        self.markers.forEach(function(marker) {
            if (marker.place_id == place.place_id) {
                markerCallback(marker);
            }
        });

        openMenu();
    };

    // only show the listings pane and ensure no marker is selected
    self.showListings = function(place) {
        // switch panes from listings to location info pane
        self.showingCredits(false);
        self.showingPlaceInfo(false);
        self.showingListings(true);

        unselectMarker();
    };

    // Only show credits pane and ensure no marker is selected
    self.showCredits = function() {
        self.showingCredits(!self.showingCredits());
        self.showingPlaceInfo(false);
        self.showingListings(false);

        unselectMarker();
    };
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

        if (visible) {
            $(element).fadeIn();
        }
        else {
            $(element).fadeOut();
        }
    }
};


var viewModel = new ViewModel();

ko.applyBindings(viewModel);
