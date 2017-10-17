var locs = [
{
  title: 'Exploratorium',
  location: {lat: 37.800797, lng: -122.398868},
  visible: ko.observable(true),
  category: 'Science Museum'
},
{
  title: 'Union Square',
  location: {lat:  37.788014, lng: -122.407477},
  visible: ko.observable(true),
  category: 'Museum'
},
{
  title: 'AT&T Park',
  location:{lat: 37.779208, lng: -122.390157},
  visible: ko.observable(true),
  category: 'Baseball Stadium'
},
{
  title: 'Golden Gate Park',
  location: {lat: 37.769421, lng: -122.486214},
  visible: ko.observable(true),
  category: 'Museum'
},
{
  title: 'Walt Disney Museum',
  location: {lat:  37.801339, lng: -122.458599},
  visible: ko.observable(true),
  category: 'History Museum'
}];

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
