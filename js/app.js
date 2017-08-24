'use strict';
var map;

var Map = function() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });
}

var ViewModel = function() {
  var currentMap = new Map();
}

function init() {
  ko.applyBindings(new ViewModel());
}
