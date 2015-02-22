export class Map {
  constructor(lat, lon, zoom){
    this.mapDisplayData = this.displayData.bind(this);
    this.lat = lat;
    this.lon = lon;
    this.map = new TurfMap.Map({
      el: document.getElementById("theMap"),
      lat: lat,
      lon: lon,
      zoom: zoom,
      minZoom: 7,
      layers: []
    });
    this.getData();
  }

  displayData(data, locType) {
    var usrImg = "static/user.png";
    var userLoc = new google.maps.LatLng(this.lat, this.lon);
    var user = new TurfMap.Marker().create({
      map: this.map.canvas,
      location: userLoc });
    user.setIcon(usrImg);
    $.each(data, (index, el) => {
      var latLon = new google.maps.LatLng(el.geometry.coordinates[1], el.geometry.coordinates[0]);
      var marker = new TurfMap.Marker().create({
        map: this.map.canvas,
        location: latLon,
        title: el.title
      });
      var neLatLon = new google.maps.LatLng(el.geometry.coordinates[1] + 0.01, el.geometry.coordinates[0] + 0.01);
      var swLatLong = new google.maps.LatLng(el.geometry.coordinates[1] - 0.01, el.geometry.coordinates[0] - 0.01);
      var bounds = new google.maps.LatLngBounds(swLatLong, neLatLon);
      var inBounds = false;
      if(bounds.contains(userLoc)){
        inBounds = true;
      }
      var infoWindow = new TurfMap.InfoWindow().data;
      var wrap = `<div data-id="${el.locId}" data-type="${locType}" class="location">`;
      var title = "<h4>" + el.title + "</h4>";
      var checkin = inBounds ? "<div class='form-group'><input type='button' class='btn btn-checkin' value='Check In Here' /></div>" : "";
      var addToDest = "<div class='form-group'><input type='button' class='btn btn-add-dest' value='Add to Destinations' /></div>";
      var description = el.details ? el.details + checkin : checkin;
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
    
  getData() {
    var $this = this;
    $.ajax({
      url: "static/new_parks.json",
      success: function(data){
        $this.mapDisplayData(data, 'park')
      },
      error: function error(err) {
        console.log("Error" + err.toString());
      }
    });

    $.ajax({
      url: "static/new_events.json",
      success: function(data){
        $this.mapDisplayData(data, 'historic')
      },
      error: function error(err) {
        console.log("Error" + err.toString());
      }
    });

    $.ajax({
      url: "static/new_persons.json",
      success: function(data){
        $this.mapDisplayData(data, 'historic');
      },
      error: function error(err) {
        console.log("Error" + err.toString());
      }
    });

    $.ajax({
      url: "static/new_sites.json",
      success: function(data){
        $this.mapDisplayData(data, 'historic');
      },
      error: function error(err) {
        console.log("Error" + err.toString());
      }
    });
    
  }
}