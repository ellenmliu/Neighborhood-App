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
var styles = [
  {
    featureType: 'water',
    stylers: [
      { color: '#3cc1d8' }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [
      { color: '#ffd930' },
      { weight: 1 }
    ]
  },{
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#000000' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      { color: '#f2c00c' },
      { lightness: -40 }
    ]
  },{
    featureType: 'transit.station',
    stylers: [
      { weight: 9 },
      { hue: '#e85113' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'labels.icon',
    stylers: [
      { visibility: 'on' }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      { lightness: 100 }
    ]
  },{
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      { lightness: -100 }
    ]
  },{
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#f0e4d3' }
    ]
  },{
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#efe9e4' },
      { lightness: -25 }
    ]
  }
];
var defaultColor;
var selectedColor;

var Map = function() {
  // Initialize background with a map of San Francisco as default
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.77493, lng: -122.419416},
    zoom: 13,
    styles: styles
  });
}

var ViewModel = function() {
  var self = this;
  // Observable that controls the hamburger icon and options bar visibility
  self.hamburger = ko.observable(false);
  var currentMap = new Map();
  var infoWindow = new google.maps.InfoWindow();

  defaultColor = makeMarkerIcon('f44242');
  selectedColor = makeMarkerIcon('ffff24');

  // Creates a marker for each of the location
  locs.forEach(function(loc, index) {
    var position = loc.location;
    var title = loc.title;

    var marker = new google.maps.Marker({
      map: map,
      icon: defaultColor,
      title: title,
      position: position,
      animation: google.maps.Animation.DROP,
      id: index
    })

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
  });

  // Sets the boolean to the opposite of itself
  self.toggleHamburger = function() {
    self.hamburger(!self.hamburger());
  }

  self.showListings = function() {
    var bounds = new google.maps.LatLngBounds();
    markers.forEach(function(data) {
      data.setMap(map);
      bounds.extend(data.position);
    })
    map.fitBounds(bounds);
  }

  self.hideListings = function() {
    markers.forEach(function(data) {
      data.setMap(null);
    })
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

    // If the street view panorama is found, then calculate the position and heading
    // to get the panorama of the area and the info window will display the image.
    // Otherwise, it will indicate to the user that the street view is not found
    function getStreetView(data, status) {
      if(status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');

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
    streetview.getPanoramaByLocation(marker.position, radius, getStreetView);

    infoWindow.open(map, marker);
  }
}


function init() {
  ko.applyBindings(new ViewModel());
}
