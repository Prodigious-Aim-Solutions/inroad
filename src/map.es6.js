export class Map {
  constructor(lat, lon, zoom, type){
    this.directionsLayer = new TurfMap.DirectionsLayer();
    this.placesLayer = new TurfMap.PlacesLayer();
    this.getDirections = this.getDirections.bind(this);
    $(document).on('getDirections', this.getDirections);
    this.mapDisplayData = this.displayData.bind(this);
    this.lat = lat;
    this.lon = lon;
    this.map = new TurfMap.Map({
      el: document.getElementById("theMap"),
      lat: lat,
      lon: lon,
      zoom: zoom,
      minZoom: 7,
      layers: [
        this.directionsLayer,
        this.placesLayer
      ]
    });
    this.getData(type);    
  }

  displayData(data, locType) {
    this.usrImg = "static/images/user.png";
    this.userLoc = new google.maps.LatLng(this.lat, this.lon);
    this.user = new TurfMap.Marker().create({
      map: this.map.canvas,
      location: this.userLoc 
    });
    this.user.setIcon(this.usrImg);
    $.each(data, (index, el) => {
      var latLon = new google.maps.LatLng(el.geometry.coordinates[1], el.geometry.coordinates[0]);
      var marker = new TurfMap.Marker().create({
        map: this.map.canvas,
        location: latLon,
        title: el.title
      });
      var neLatLon = new google.maps.LatLng(parseFloat(el.geometry.coordinates[1]) + 0.0005, parseFloat(el.geometry.coordinates[0]) + 0.0005);
      var swLatLong = new google.maps.LatLng(parseFloat(el.geometry.coordinates[1]) - 0.0005, parseFloat(el.geometry.coordinates[0]) - 0.0005);
      var bounds = new google.maps.LatLngBounds(swLatLong, neLatLon);
      var inBounds = false;
      if(bounds.contains(this.userLoc)){
        inBounds = true;
      }
      var infoWindow = new TurfMap.InfoWindow().data;
      var wrap = `<div data-id="${el.locId}" data-type="${locType}" data-location="${el.geometry.coordinates[1]},${el.geometry.coordinates[0]}" class="location">`;
      var title = "<h4>" + el.title + "</h4>";
      var checkin = inBounds ? "<div class='form-group'><input type='button' class='btn btn-checkin' value='Check In Here' /></div>" : "";
      var addToDest = "<div class='form-group'><input type='button' class='btn btn-add-dest' value='Add to Destinations' /></div>";
      var description = el.details ? el.details + addToDest + checkin : addToDest + checkin;
      var content = description ? title + description : title;
      content = wrap + content + "</div>";
      infoWindow.setOptions({
        position: latLon,
        content: content
      });
      TurfMap.Events.on(marker, "click", function () {
        infoWindow.open(this.map, marker);
      });
      $(document).on('checkInComplete', function(){
        infoWindow.close()
      });
    });
  }
  
  updateLocation(lat, lon){
    this.lat = lat;
    this.lon = lon;
    this.userLoc = new google.maps.LatLng(this.lat, this.lon);
    this.user.setPosition(this.userLoc);
    //this.user.setIcon(this.usrImg);
  }
    
  getData(type) {
    var $this = this;
    if(type === 'parks'){
      $.ajax({
        url: "/api/v1/parks",
        dataType: 'json',
        success: function(data){
          $this.mapDisplayData(data, 'park')
        },
        error: function error(err) {
          console.log("Error" + err.toString());
        }
      });
    } else {
      $.ajax({
        url: "/api/v1/historic",
        dataType: 'json',
        success: function(data){
          $this.mapDisplayData(data, 'historic')
        },
        error: function error(err) {
          console.log("Error" + err.toString());
        }
      });

      $.ajax({
        url: "/api/v1/historic",
        dataType: 'json',
        success: function(data){
          $this.mapDisplayData(data, 'historic');
        },
        error: function error(err) {
          console.log("Error" + err.toString());
        }
      });

      $.ajax({
        url: "/api/v1/historic",
        dataType: 'json',
        success: function(data){
          $this.mapDisplayData(data, 'historic');
        },
        error: function error(err) {
          console.log("Error" + err.toString());
        }
      });
   }
   
   this.placesLayer.nearbySearch({
     location: this.map.details.location,
     radius: '10000',
     type: ["establishment"]
   });
    
  }
  
  getDirections (e, locLat, latLon, dirType) {
    var destination = new google.maps.LatLng(parseFloat(locLat), parseFloat(latLon));
    var request = {
      origin: this.userLoc,
      destination: destination,
      travelMode: dirType || google.maps.TravelMode.DRIVING
    }
    this.directionsLayer.setRoute(request, this.displayResults)
  }
  
  displayResults(results){
    $(document).trigger('displayResults', results);
  }
}