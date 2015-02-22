(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Map = require("./map").Map;

var Register = require("./register").Register;

var SignIn = require("./signin").SignIn;

var CheckIn = require("./checkin").CheckIn;

var mainApp = function (lat, lon, zoom) {
  new Map(lat, lon, zoom);
  new Register();
  new SignIn();
  new CheckIn();
};

var selectLocation = function () {
  return { latitude: 45.329115, longitude: -63.088226 };
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    mainApp(position.coords.latitude, position.coords.longitude, 12);
  }, function () {
    var position = selectLocation();
    mainApp(position.latitude, position.longitude, 7);
  });
} else {
  var position = selectLocation();
  mainApp(position.latitude, position.longitude, 7);
}
},{"./checkin":2,"./map":3,"./register":4,"./signin":5}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var CheckIn = exports.CheckIn = (function () {
  function CheckIn() {
    _classCallCheck(this, CheckIn);

    this.doCheckin = this.checkin.bind(this);
    $(document).on("click", ".btn-checkin:not(.disabled)", this.doCheckin);
  }

  _prototypeProperties(CheckIn, null, {
    checkin: {
      value: function checkin(e) {
        var $target = $(e.currentTarget);
        var user_token = window.token;
        if (user_token) {
          var userCheckin = {
            locId: $target.parents(".location").data("id"),
            locType: $target.parents(".location").data("type"),
            token: user_token
          };
          $.ajax({
            contentType: "application/json",
            type: "POST",
            url: "/api/v1/checkin",
            data: JSON.stringify(userCheckin),
            success: function (data) {
              $target.addClass("disabled");
              $(document).trigger("checkInComplete");
            },
            error: function (err) {
              console.log("Error " + err);
            }
          });
        } else {}
      },
      writable: true,
      configurable: true
    }
  });

  return CheckIn;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});

//show signin/register popup
},{}],3:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Map = exports.Map = (function () {
  function Map(lat, lon, zoom) {
    _classCallCheck(this, Map);

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

  _prototypeProperties(Map, null, {
    displayData: {
      value: function displayData(data, locType) {
        var _this = this;

        var usrImg = "static/user.png";
        var userLoc = new google.maps.LatLng(this.lat, this.lon);
        var user = new TurfMap.Marker().create({
          map: this.map.canvas,
          location: userLoc });
        user.setIcon(usrImg);
        $.each(data, function (index, el) {
          var latLon = new google.maps.LatLng(el.geometry.coordinates[1], el.geometry.coordinates[0]);
          var marker = new TurfMap.Marker().create({
            map: _this.map.canvas,
            location: latLon,
            title: el.title
          });
          var neLatLon = new google.maps.LatLng(el.geometry.coordinates[1] + 0.01, el.geometry.coordinates[0] + 0.01);
          var swLatLong = new google.maps.LatLng(el.geometry.coordinates[1] - 0.01, el.geometry.coordinates[0] - 0.01);
          var bounds = new google.maps.LatLngBounds(swLatLong, neLatLon);
          var inBounds = false;
          if (bounds.contains(userLoc)) {
            inBounds = true;
          }
          var infoWindow = new TurfMap.InfoWindow().data;
          var wrap = "<div data-id=\"" + el.locId + "\" data-type=\"" + locType + "\" class=\"location\">";
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
          $(document).on("checkInComplete", function () {
            infoWindow.close();
          });
        });
      },
      writable: true,
      configurable: true
    },
    getData: {
      value: function getData() {
        var $this = this;
        $.ajax({
          url: "static/new_parks.json",
          success: function success(data) {
            $this.mapDisplayData(data, "park");
          },
          error: function error(err) {
            console.log("Error" + err.toString());
          }
        });

        $.ajax({
          url: "static/new_events.json",
          success: function success(data) {
            $this.mapDisplayData(data, "historic");
          },
          error: function error(err) {
            console.log("Error" + err.toString());
          }
        });

        $.ajax({
          url: "static/new_persons.json",
          success: function success(data) {
            $this.mapDisplayData(data, "historic");
          },
          error: function error(err) {
            console.log("Error" + err.toString());
          }
        });

        $.ajax({
          url: "static/new_sites.json",
          success: function success(data) {
            $this.mapDisplayData(data, "historic");
          },
          error: function error(err) {
            console.log("Error" + err.toString());
          }
        });
      },
      writable: true,
      configurable: true
    }
  });

  return Map;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Register = exports.Register = (function () {
  function Register() {
    _classCallCheck(this, Register);

    this.doRegister = this.register.bind(this);
    this.$el = $("#register");
    this.$el.find(".btn").on("click", this.doRegister);
  }

  _prototypeProperties(Register, null, {
    register: {
      value: function register(e) {
        var $this = $(this);
        var user = {
          username: this.$el.find(".username").val(),
          email: this.$el.find(".email").val(),
          password: this.$el.find(".password").val(),
          confirm: this.$el.find(".confirm").val()
        };
        $.ajax({
          data: JSON.stringify(user),
          type: "POST",
          url: "//marina-griffin.codio.io:5000/api/v1/register",
          contentType: "application/json",
          success: function (data) {
            data = JSON.parse(data);
            if (data.user) {
              $this[0].$el.parent().hide();
              window.token = data.user.token;
              return;
            } else {
              console.log("Error: " + data.error);
            }
          },
          error: function (err) {
            console.log("Error: " + err);
            return;
          }
        });
      },
      writable: true,
      configurable: true
    }
  });

  return Register;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var SignIn = exports.SignIn = (function () {
  function SignIn() {
    _classCallCheck(this, SignIn);

    this.doSignin = this.signin.bind(this);
    this.$el = $("#signin");
    this.$el.find(".btn").on("click", this.doSignin);
  }

  _prototypeProperties(SignIn, null, {
    signin: {
      value: function signin(e) {
        var $this = $(this);
        var user = {
          username: this.$el.find(".username").val(),
          password: this.$el.find(".password").val()
        };
        $.ajax({
          data: JSON.stringify(user),
          type: "POST",
          url: "//marina-griffin.codio.io:5000/api/v1/signin",
          contentType: "application/json",
          success: function (data) {
            data = JSON.parse(data);
            if (data.user) {
              $this[0].$el.parent().hide();
              window.token = data.user.token;
              return;
            } else {
              console.log("Error: " + data.error);
            }
          },
          error: function (err) {
            console.log("Error: " + err);
            return;
          }
        });
      },
      writable: true,
      configurable: true
    }
  });

  return SignIn;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}]},{},[1,2,3,4,5]);
