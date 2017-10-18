var map, infoWindow, defaultColor, selectedColor;
var markers = [];
var polygon = null;

var client_id = 'FAXWGJU1T5JKZMQBVUFBBZ0CK1ZXP130JWQ0TMQW33LTIV0C';
var client_secret = '52TF4CEXKTNKN1HSRREGPWPDVSRA0030ST2H5RG3XQ2IGLWD';

var GoogleMap = function() {
  // Initialize background with a map of San Francisco as default
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.77493, lng: -122.419416},
    zoom: 13,
    styles: styles
  });

  infoWindow = new google.maps.InfoWindow();
};

var ViewModel = function() {
  var self = this;
  // Observable that controls the hamburger icon and options bar visibility
  self.hamburger = ko.observable(false);
  self.locations = ko.observableArray([]);
  self.categories = ko.observableArray([]);
  self.filter = ko.observable('');
  self.searchFor = ko.observable('');

  GoogleMap();

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    }
  });

  defaultColor = makeMarkerIcon('f44242');
  selectedColor = makeMarkerIcon('ffff24');

  // Creates a marker for each of the location
  locs.forEach(function(loc, index) {
    self.locations.push(loc);

    createMarker(loc, index);
  });

  self.selectListing = function(thisListing) {
    markers.forEach(function(data) {
      data.setIcon(defaultColor);
    });
    var selected = markers.find(function(element) {
      return element.title == thisListing.title;
    });
    selected.setIcon(selectedColor);
    showInfoWindow(selected, infoWindow);
  };

  // Sets the boolean to the opposite of itself
  self.toggleHamburger = function() {
    self.hamburger(!self.hamburger());
  };

  self.showListings = function() {
    var bounds = new google.maps.LatLngBounds();
    markers.forEach(function(data) {
      data.setMap(map);
      bounds.extend(data.position);
    });

    for(var data in self.locations()) {
      if (self.locations().hasOwnProperty(data)) {
        self.locations()[data].visible(true);
      }
    }
    google.maps.event.addDomListener(window, 'resize', function() {
      map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
    });
  };

  self.hideListings = function() {
    markers.forEach(function(data) {
      data.setMap(null);
    });
    for(var data in self.locations()) {
      if (self.locations().hasOwnProperty(data)) {
        self.locations()[data].visible(false);
      }
    }
  };

  self.toggleDrawing = function() {
    if(drawingManager.map) {
      drawingManager.setMap(null);
      if(polygon !== null) {
        polygon.setMap(null);
      }
    } else {
      drawingManager.setMap(map);
    }
    self.hamburger(!self.hamburger());
  };

  self.zoom = function() {
    searchFoursquare(37.77493, -122.419416, self.searchFor(), self.locations, self.categories);
    zoomToArea(self.searchFor());
  };

  self.filteredItems = ko.computed(function() {
        var filter = self.filter();
        markers.forEach(function(data) {
          data.setMap(null);
        });

        markers = [];
        for(var data in self.locations()) {
          if (!filter || filter == "All") {
            createMarker(self.locations()[data],data);
          } else if(self.locations()[data].category == filter) {
            self.locations()[data].visible(true);
            createMarker(self.locations()[data],data);
          } else {
            self.locations()[data].visible(false);
          }
        }

        if (!filter || filter == "All") {
            return self.locations();
        } else {
            return ko.utils.arrayFilter(self.locations(), function(data) {
              return data.category == filter;
            });
        }
    });

  drawingManager.addListener('overlaycomplete', function(event) {
    if(polygon) {
      polygon.setMap(null);
      self.hideListings(markers);
    }

    drawingManager.setDrawingMode(null);
    polygon = event.overlay;
    polygon.setEditable(true);

    searchWithinPolygon(self.locations());

    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });

  self.categories.push("All");
  locs.forEach(function(data){
    if(self.categories().indexOf(data.category) < 0){
      self.categories.push(data.category);
    }
  });
};

// Toggles between the animation between the hamburger icon and a close icon
ko.bindingHandlers.transition = {
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    var valueUnwrapped = ko.unwrap(value);

    if (valueUnwrapped){
      element.classList.add("change");
    } else {
      element.classList.remove("change");
    }
  }
};

// Toggles when the option box slides over and back
ko.bindingHandlers.slide = {
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    var valueUnwrapped = ko.unwrap(value);

    if (valueUnwrapped) {
      element.style.width = "250px";
    } else {
      element.style.width = "0px";
    }
  }
};

function makeMarkerIcon(color) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ color +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function searchWithinPolygon(locArray) {
  markers.forEach(function(data, index){
    if (google.maps.geometry.poly.containsLocation(data.position, polygon)) {
      data.setMap(map);
      locArray[index].visible(true);
    } else {
      data.setMap(null);
      locArray[index].visible(false);
    }
  });
}

// Shows the information of the location in the info window when the marker is
// selected.
function showInfoWindow(marker, infoWindow) {
  // Checks if the info window isn't already opened
  if(infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');

    // Clears the marker property when the info window closes
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker.setIcon(defaultColor);
      infoWindow.setMarker = null;
    });

    var streetview = new google.maps.StreetViewService();
    var radius = 50;

    if(marker.id) {
      var link = 'https://foursquare.com/v/' + marker.id;
      infoWindow.setContent('<a href="'+link+'" target="_blank">' + marker.title + '</a><div id="pano"></div><div>Powered by Foursquare</div>');
    } else {
      infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
    }

    streetview.getPanoramaByLocation(marker.position, radius, getStreetView);

    infoWindow.open(map, marker);
  }
}

// If the street view panorama is found, then calculate the position and heading
// to get the panorama of the area and the info window will display the image.
// Otherwise, it will indicate to the user that the street view is not found
function getStreetView(data, status) {
  if(status == google.maps.StreetViewStatus.OK) {
    var nearStreetViewLocation = data.location.latLng;
    var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, data.location.latLng);

    var panoramaOptions = {
      position: nearStreetViewLocation,
      pov: {
        heading: heading,
        pitch: 30
      }
    };

    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
  } else {
    infoWindow.setContent('<div>' + marker.title + '</div><div>No Street View Found</div>');
  }
}

function zoomToArea(area) {
  var geocoder = new google.maps.Geocoder();
  var address = area;

  if(address === '') {
    window.alert('You must enter a location');
  } else {
    geocoder.geocode({address: address, componentRestrictions: {locality: 'San Francisco'}}, function(results, status) {
      if(status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(13);
      } else {
        window.alert('Location could not be found. Try entering a more specific location.');
      }
    });
  }
}

function searchFoursquare(lat, long, search, locArray, category) {
  var url = 'https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + long + '&query=' + search + '&client_id='+ client_id + '&client_secret=' + client_secret + '&v=20170830&m=foursquare';

  $.ajax({
    url: url
    }).done(function(data) {
      locArray.removeAll();
      markers.forEach(function(data) {
        data.setMap(null);
      });

      markers = [];

      var venues = data.response.venues;

      venues.forEach(function(data, index) {
        if(data.categories.length > 0){

        var newVenue = {
          title: data.name,
          location: {lat: data.location.lat, lng: data.location.lng},
          visible: ko.observable(true),
          category: data.categories[0].name,
          id: data.id
        };
        createMarker(newVenue, index);
        locArray.push(newVenue);
        }
      });

      category.removeAll();
      category.push("All");
      for(var element in locArray()) {
        if(category().indexOf(locArray()[element].category) < 0){
          if(locArray()[element].category.length > 25) {
            locArray()[element].category = locArray()[element].category.substring(0,24)+"...";
          }
          category.push(locArray()[element].category);
        }
      }
    }).fail(function(jqXHR, textStatus) {
      alert("Request failed: " + textStatus);
    });
}

function createMarker(loc, index) {
  var position = loc.location;
  var title = loc.title;
  var id = loc.id;

  var marker = new google.maps.Marker({
    map: map,
    icon: defaultColor,
    title: title,
    position: position,
    animation: google.maps.Animation.DROP,
    index: index,
    id: id
  });

  markers.push(marker);

  // The selected marker will show up with an info window that provides
  // information about the location
  marker.addListener('click', function() {
    markers.forEach(function(data) {
      data.setIcon(defaultColor);
    });
    this.setIcon(selectedColor);
    showInfoWindow(this, infoWindow);
  });
}

function init() {
  ko.applyBindings(new ViewModel());
}

function mapError() {
  alert("Error loading map");
}
