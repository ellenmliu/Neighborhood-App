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
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.77493, lng: -122.419416},
    zoom: 13
  });
}

var ViewModel = function() {
  var currentMap = new Map();
  var infoWindow = new google.maps.InfoWindow();

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

    marker.addListener('click', function() {
      showInfoWindow(this, infoWindow);
    });
  });
}

function showInfoWindow(marker, infoWindow) {
  if(infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);

    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
  }
}

function init() {
  ko.applyBindings(new ViewModel());
}
