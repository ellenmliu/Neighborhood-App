'use strict';
var map;
var markers = [];
var locs = [
  {
    title: 'Exploratorium',
    location: {lat: 37.800797, lng: -122.398868}
  },
  {
    title: 'Union Square',
    location: {lat:  37.788014, lng: -122.407477}
  },
  {
    title: 'AT&T Park',
    location:{lat: 37.779208, lng: -122.390157}
  },
  {
    title: 'Golden Gate Park',
    location: {lat: 37.769421, lng: -122.486214}
  },
  {
    title: 'Walt Disney Museum',
    location: {lat:  37.801339, lng: -122.458599}
  }]

var Map = function() {
  // Initialize background with a map of San Francisco as default
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.77493, lng: -122.419416},
    zoom: 13
  });
}

var ViewModel = function() {
  var self = this;
  // Observable that controls the hamburger icon and options bar visibility
  self.hamburger = ko.observable(false);
  var currentMap = new Map();
  var infoWindow = new google.maps.InfoWindow();

  // Creates a marker for each of the location
  locs.forEach(function(loc, index) {
    var position = loc.location;
    var title = loc.title;

    var marker = new google.maps.Marker({
      map: map,
      title: title,
      position: position,
      animation: google.maps.Animation.Drop,
      id: index
    })

    markers.push(marker);

    // The selected marker will show up with an info window that provides
    // information about the location
    marker.addListener('click', function() {
      showInfoWindow(this, infoWindow);
    });
  });

  // Sets the boolean to the opposite of itself
  self.toggleHamburger = function() {
    self.hamburger(!self.hamburger());
  }
}

// Toggles between the animation between the hamburger icon and a close icon
ko.bindingHandlers.transition = {
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    var valueUnwrapped = ko.unwrap(value);

    valueUnwrapped? element.classList.add("change") : element.classList.remove("change");
  }
};

// Toggles when the option box slides over and back
ko.bindingHandlers.slide = {
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    var valueUnwrapped = ko.unwrap(value);

    valueUnwrapped? element.style.width = "250px" : element.style.width = "0px";
  }
};

// Shows the information of the location in the info window when the marker is
// selected.
function showInfoWindow(marker, infoWindow) {
  // Checks if the info window isn't already opened
  if(infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);

    // Clears the marker property when the info window closes
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
  }
}

function init() {
  ko.applyBindings(new ViewModel());
}
