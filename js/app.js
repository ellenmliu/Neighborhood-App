'use strict';
var map;
var markers = [];
var locs = [
  {
    title: 'Exploratorium',
    location: {lat: 37.800797, lng: -122.398868},
    visible: ko.observable(true)
  },
  {
    title: 'Union Square',
    location: {lat:  37.788014, lng: -122.407477},
    visible: ko.observable(true)
  },
  {
    title: 'AT&T Park',
    location:{lat: 37.779208, lng: -122.390157},
    visible: ko.observable(true)
  },
  {
    title: 'Golden Gate Park',
    location: {lat: 37.769421, lng: -122.486214},
    visible: ko.observable(true)
  },
  {
    title: 'Walt Disney Museum',
    location: {lat:  37.801339, lng: -122.458599},
    visible: ko.observable(true)
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
var polygon = null;

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
  self.locations = ko.observableArray([]);

  var currentMap = new Map();
  var infoWindow = new google.maps.InfoWindow();

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

  self.selectListing = function(thisListing) {
    markers.forEach(function(data) {
      data.setIcon(defaultColor);
    });
    var selected = markers.find(function(element) {
      return element.title == thisListing.title;
    })
    selected.setIcon(selectedColor);
    showInfoWindow(selected, infoWindow);
  }

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

    for(var data in self.locations()) {
      self.locations()[data].visible(true);
    }
    map.fitBounds(bounds);
  }

  self.hideListings = function() {
    markers.forEach(function(data) {
      data.setMap(null);
    })
    for(var data in self.locations()) {
      self.locations()[data].visible(false);
    }
  }

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
  }

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
  })
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
