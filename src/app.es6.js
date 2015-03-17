import {Map} from './map';
import {Register} from './register';
import {SignIn} from './signin';
import {CheckIn} from './checkin';
import {Badge} from './badge';

var app = {};

app.watch = true;

var LOCATIONS = {
  southshore: [44.629711, -64.738421],
  easternshore: [45.398586, -62.167620],
  valley: [44.941610, -64.980120],
  centralns: [45.058138, -63.540911],
  capebreton: [45.966559, -60.761370]
};

if(window.localStorage.getItem('token')){
  window.token = window.localStorage.getItem('token');
  new SignIn().session(window.localStorage.getItem('token'));
} else {
  new SignIn();
}

$(document).on('signInComplete', (e, user) =>{
  var user = `<p class="navbar-text"> Hello, ${user.username}</p>`
  $('#userDet').html(user);
});

var loadMapAndData = (e) => {
  var selLoc = '#selLocation';
  var selType = '#selType';
  if(e.currentTarget.id == 'btnRefresh'){
    selLoc = '#refLocation';
    selType = '#refType';
  }
  var newMap = null;
  var newCheck = null;
  var newBadge = null;
  var $selLocation = $(selLoc);
  var $selType = $(selType);
  var locVal = $selLocation.val()
  var typeVal = $selType.val();
  if(locVal && typeVal){
    $('#splash').hide();
    $('#mainApp').show();
    var zoom = locVal == 'user' ? 12 : 8;
    app.newMap = new Map(LOCATIONS[locVal][0], LOCATIONS[locVal][1], zoom, typeVal);
    newCheck = new CheckIn();
    newBadge = new Badge();
  }
}

var mainApp = () => {
  $('#btnGo').on('click', loadMapAndData);
  $("#btnRefresh").on('click', loadMapAndData)
  new Register();
};

var setLocaton = (lat, lon) => {
  var userOpt = `<option value="user">Your Current Location</option>`;
  $('#selLocation').append(userOpt);
  $('#selLocation').val('user');
  $('#refLocation').append(userOpt);
  $('#refLocation').val('user');
  LOCATIONS['user'] = [lat, lon];
};

var updateLocation = (lat, lon) => {
  LOCATIONS['user'] = [lat, lon];
  if(app.newMap){
    app.newMap.updateLocation(lat, lon);
  }
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    setLocaton(position.coords.latitude, position.coords.longitude)
    mainApp();
  }, () => {
    mainApp();
  });
  
  if(app.watch){
    var watchID = navigator.geolocation.watchPosition(function(position) {
      updateLocation(position.coords.latitude, position.coords.longitude);
    });
    $('#selUpdate, #refUpdate').on('change', () =>{      
      if($(this).is(':checked')){
        app.watch = true;
        watchID = navigator.geolocation.watchPosition(function(position) {
          updateLocation(position.coords.latitude, position.coords.longitude);
        });
        return;
      }
      app.watch = false;
      navigator.geolocation.clearWatch(watchID);
    });
  }
  
} else {
  mainApp();
}