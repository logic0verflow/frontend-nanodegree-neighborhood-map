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

    // All the markers that get created on the Google Map
    // this.markers = {};
    this.markers = [];

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
        if (place.place_id != undefined) {
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

                // only setup weekday hours if opening hours is provided
                if (place.opening_hours) {
                    self.selectedListing.hours(place.opening_hours.weekday_text);
                }
            }
            else {
                self.selectedListing.name("Oops! We couldn't retrieve the place details.")
            }
        });
    }

    self.updateInfoPaneArticles = function(place) {
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
            if (result.status == 'OK') {
                var nytDocs = result.response.docs;
                if (nytDocs.length > 0) {
                    self.selectedListing.nytArticles([]);
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
                            self.selectedListing.nytArticles.push(article);
                        }
                    });
                }
            }
        }).fail(function(err) {
            throw err;
        });
    }

    self.showPlaceInfo = function(place) {

        self.updateInfoPane(place)

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

    self.showListings = function(place) {
        // switch panes from listings to location info pane
        self.showingCredits(false);
        self.showingPlaceInfo(false);
        self.showingListings(true);

        unselectMarker();
    };

    self.showCredits = function() {
        self.showingCredits(!self.showingCredits());
        self.showingPlaceInfo(false);
        self.showingListings(false);

        unselectMarker();
    }
};


function getNYTArticles(tokens) {
    var url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
    url += '?' + $.param({
        'api-key': '029a4b3e81e2422d8c8f96d2efb4008b',
        'q': tokens
    });

    $.ajax({
        url: url,
        method: 'GET'
    }).done(function(result) {
        var articles = [];
        result.response.docs.forEach(function(doc) {
            articles.push({
                headline: doc.headline,
                snippet: doc.snippet,
                web_url: doc.web_url
            });
        });
        return articles
    }).fail(function(err) {
        throw err;
    });
}


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
