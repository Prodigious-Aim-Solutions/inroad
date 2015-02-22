import {Map} from './map';
import {Register} from './register';
import {SignIn} from './signin';
import {CheckIn} from './checkin';

var mainApp = (lat, lon, zoom) => {
  new Map(lat, lon, zoom);
  new Register();
  new SignIn();
  new CheckIn();
};

var selectLocation = () => {
  return { latitude: 45.329115, longitude: -63.088226 };
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    mainApp(position.coords.latitude, position.coords.longitude, 12);
  }, () => {
    var position = selectLocation();
    mainApp(position.latitude, position.longitude, 7);
  });
} else {
  var position = selectLocation();
  mainApp(position.latitude, position.longitude, 7);
}