(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Map = require("./map").Map;

var Register = require("./register").Register;

var SignIn = require("./signin").SignIn;

var CheckIn = require("./checkin").CheckIn;

var Badge = require("./badge").Badge;

var DestinationList = require("./destinationList").DestinationList;

var DestinationLists = require("./destinationLists").DestinationLists;

var app = {};

app.watch = true;

var LOCATIONS = {
  southshore: [44.629711, -64.738421],
  easternshore: [45.398586, -62.16762],
  valley: [44.94161, -64.98012],
  centralns: [45.058138, -63.540911],
  capebreton: [45.966559, -60.76137]
};

if (window.localStorage.getItem("token")) {
  window.token = window.localStorage.getItem("token");
  new SignIn().session(window.localStorage.getItem("token"));
} else {
  new SignIn();
}

$(document).on("signInComplete", function (e, user) {
  var user = "<p class=\"navbar-text\"> Hello, " + user.username + "</p>";
  $("#userDet").html(user);
});

var loadMapAndData = function (e) {
  var selLoc = "#selLocation";
  var selType = "#selType";
  if (e.currentTarget.id == "btnRefresh") {
    selLoc = "#refLocation";
    selType = "#refType";
  }
  var newMap = null;
  var newCheck = null;
  var newBadge = null;
  var $selLocation = $(selLoc);
  var $selType = $(selType);
  var locVal = $selLocation.val();
  var typeVal = $selType.val();
  if (locVal && typeVal) {
    $("#splash").hide();
    $("#mainApp").show();
    var zoom = locVal == "user" ? 12 : 8;
    app.newMap = new Map(LOCATIONS[locVal][0], LOCATIONS[locVal][1], zoom, typeVal);
    newCheck = new CheckIn();
    newBadge = new Badge();
  }
};

var mainApp = function () {
  $("#btnGo").on("click", loadMapAndData);
  $("#btnRefresh").on("click", loadMapAndData);
  new Register();
  new DestinationList();
  new DestinationLists();
};

var setLocaton = function (lat, lon) {
  var userOpt = "<option value=\"user\">Your Current Location</option>";
  $("#selLocation").append(userOpt);
  $("#selLocation").val("user");
  $("#refLocation").append(userOpt);
  $("#refLocation").val("user");
  LOCATIONS.user = [lat, lon];
};

var updateLocation = function (lat, lon) {
  LOCATIONS.user = [lat, lon];
  if (app.newMap) {
    app.newMap.updateLocation(lat, lon);
  }
};

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(function (position) {
    setLocaton(position.coords.latitude, position.coords.longitude);
    mainApp();
  }, function () {
    mainApp();
  });

  if (app.watch) {
    var watchID = navigator.geolocation.watchPosition(function (position) {
      updateLocation(position.coords.latitude, position.coords.longitude);
    });
    $("#selUpdate, #refUpdate").on("change", function () {
      if ($(undefined).is(":checked")) {
        app.watch = true;
        watchID = navigator.geolocation.watchPosition(function (position) {
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
},{"./badge":2,"./checkin":3,"./destinationList":4,"./destinationLists":5,"./map":6,"./register":7,"./signin":8}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Badge = exports.Badge = (function () {
  function Badge() {
    _classCallCheck(this, Badge);

    this.$el = $("#badgeModal");
    this.createBadge = this.showBadge.bind(this);
    $(document).on("badgeEarned", this.createBadge);
    return this;
  }

  _prototypeProperties(Badge, null, {
    setDetails: {
      value: function setDetails(args) {
        this.$el.find(".type").empty().text(args.type);
        this.$el.find(".description").empty().text("You are now at " + args.description);
        return this;
      },
      writable: true,
      configurable: true
    },
    displayModal: {
      value: function displayModal() {
        this.$el.modal("show");
        return this;
      },
      writable: true,
      configurable: true
    },
    showBadge: {
      value: function showBadge(e, type, description) {
        this.setDetails({ type: type, description: description });
        this.displayModal();
      },
      writable: true,
      configurable: true
    }
  });

  return Badge;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],3:[function(require,module,exports){
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
              data = JSON.parse(data);
              $target.addClass("disabled");
              $(document).trigger("checkInComplete");
              if (data.badge) {
                $(document).trigger("badgeEarned", [data.badge.locType, data.badge.level]);
              }
            },
            error: function (err) {
              console.log("Error " + err);
            }
          });
        } else {
          $("#signInRegModal").modal("show");
        }
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
},{}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DestinationList = exports.DestinationList = (function () {
  function DestinationList() {
    _classCallCheck(this, DestinationList);

    this.$el = $("#currentList");
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.save = this.save.bind(this);
    this.listData = [];
    $(document).on("click", ".btn-add-dest:not(.disabled)", this.add);
    $(document).on("click", ".btn-remove-dest", this.remove);
    $("#btnSaveDestList").on("click", this.save);
  }

  _prototypeProperties(DestinationList, null, {
    add: {
      value: function add(e) {
        var $current = $(e.currentTarget);
        var data = $current.parents(".location").data("id");
        if (!this.$el.find("[data-id=\"" + data + "\"]").length && this.listData.indexOf(data) === -1) {
          this.listData.push(data);
          var name = $current.parents(".location").find("h4").text();
          var destinationTmpl = "<li data-loc-id=\"" + data + "\"><h4>" + name + "</h4><div class=\"form-group\"><input type=\"button\" class=\"btn btn-remove-dest\" value=\"Remove\" /></div></li>";
          this.$el.find("ul").append(destinationTmpl);
          //$current.addClass('disabled');
        }
      },
      writable: true,
      configurable: true
    },
    remove: {
      value: function remove(e) {
        var $current = $(e.currentTarget);
        var $parent = $current.parents("li");
        var data = $parent.data("locId");
        var index = this.listData.indexOf(data);
        this.listData = this.listData.splice(index, 1);
        $parent.remove();
      },
      writable: true,
      configurable: true
    },
    save: {
      value: function save(e) {
        var _this = this;

        var $current = $(e.currentTarget);
        var id = this.$el.data("id");
        var destIds = [];
        var user_token = window.token;
        var items = this.$el.find("ul li");
        items.each(function (index, el) {
          destIds.push($(el).data("locId"));
        });
        var list = {
          id: id,
          destIds: destIds,
          token: user_token
        };
        $.ajax({
          type: "POST",
          url: "/api/v1/destinationlist",
          data: JSON.stringify(list),
          contentType: "application/json",
          success: function (data) {
            data = JSON.parse(data);
            // sets id if not set
            _this.$el.data("id", data.id);
          },
          error: function (err) {}
        });
        $(document).trigger("saveDestList", id);
      },
      writable: true,
      configurable: true
    }
  });

  return DestinationList;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});
},{}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DestinationLists = exports.DestinationLists = (function () {
  function DestinationLists() {
    _classCallCheck(this, DestinationLists);

    this.listSaved = this.listSaved.bind(this);
    this.$el = $("#lists");
    $(document).on("saveDestList", this.listSaved);
  }

  _prototypeProperties(DestinationLists, null, {
    listSaved: {
      value: function listSaved(e, listId) {
        // update list or add new item
        var list = this.$el.find("li[data-id=\"" + listId + "\"]");
        if (list.length) {} else {}
      },
      writable: true,
      configurable: true
    }
  });

  return DestinationLists;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});

//update

//add list
},{}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Map = exports.Map = (function () {
  function Map(lat, lon, zoom, type) {
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
    this.getData(type);
  }

  _prototypeProperties(Map, null, {
    displayData: {
      value: function displayData(data, locType) {
        var _this = this;

        this.usrImg = "static/images/user.png";
        this.userLoc = new google.maps.LatLng(this.lat, this.lon);
        this.user = new TurfMap.Marker().create({
          map: this.map.canvas,
          location: this.userLoc
        });
        this.user.setIcon(this.usrImg);
        $.each(data, function (index, el) {
          var latLon = new google.maps.LatLng(el.geometry.coordinates[1], el.geometry.coordinates[0]);
          var marker = new TurfMap.Marker().create({
            map: _this.map.canvas,
            location: latLon,
            title: el.title
          });
          var neLatLon = new google.maps.LatLng(parseFloat(el.geometry.coordinates[1]) + 0.01, parseFloat(el.geometry.coordinates[0]) + 0.01);
          var swLatLong = new google.maps.LatLng(parseFloat(el.geometry.coordinates[1]) - 0.01, parseFloat(el.geometry.coordinates[0]) - 0.01);
          var bounds = new google.maps.LatLngBounds(swLatLong, neLatLon);
          var inBounds = false;
          if (bounds.contains(_this.userLoc)) {
            inBounds = true;
          }
          var infoWindow = new TurfMap.InfoWindow().data;
          var wrap = "<div data-id=\"" + el.locId + "\" data-type=\"" + locType + "\" class=\"location\">";
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
          $(document).on("checkInComplete", function () {
            infoWindow.close();
          });
        });
      },
      writable: true,
      configurable: true
    },
    updateLocation: {
      value: function updateLocation(lat, lon) {
        this.lat = lat;
        this.lon = lon;
        this.userLoc = new google.maps.LatLng(this.lat, this.lon);
        this.user.setPosition(this.userLoc);
        //this.user.setIcon(this.usrImg);
      },
      writable: true,
      configurable: true
    },
    getData: {
      value: function getData(type) {
        var $this = this;
        if (type === "parks") {
          $.ajax({
            url: "static/new_parks_conservation.json",
            success: function success(data) {
              $this.mapDisplayData(data, "park");
            },
            error: function error(err) {
              console.log("Error" + err.toString());
            }
          });
        } else {
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
            url: "static/new_sites_clean.json",
            success: function success(data) {
              $this.mapDisplayData(data, "historic");
            },
            error: function error(err) {
              console.log("Error" + err.toString());
            }
          });
        }
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
},{}],7:[function(require,module,exports){
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
          url: "/api/v1/register",
          contentType: "application/json",
          success: function (data) {
            data = JSON.parse(data);
            if (data.user) {
              data.user.username = user.username;
              $this[0].$el.parent().hide();
              window.token = data.user.token;
              window.localStorage.setItem("token", window.token);
              $("#signInRegModal").modal("hide");
              $(document).trigger("signInComplete", data.user);
              $("#regError").hide();
              return;
            } else {
              $("#regError").text("Error: " + data.error);
              $("#regError").show();
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
},{}],8:[function(require,module,exports){
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
          url: "/api/v1/signin",
          contentType: "application/json",
          success: function (data) {
            data = JSON.parse(data);
            if (data.user) {
              data.user.username = user.username;
              $this[0].$el.parent().hide();
              window.token = data.user.token;
              window.localStorage.setItem("token", window.token);
              $("#signInRegModal").modal("hide");
              $(document).trigger("signInComplete", data.user);
              $("#signError").hide();
              return;
            } else {
              $("#signError").show();
              $("#signError").html("Error: " + data.error);
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
    },
    session: {
      value: function session(token) {
        var data = {
          token: token
        };
        $.ajax({
          type: "POST",
          url: "/api/v1/session",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (data) {
            data = JSON.parse(data);
            if (data.user) {
              $(document).trigger("signInComplete", data.user);
            } else {
              window.localStorage.setItem("token", "");
            }
          },
          error: function (err) {
            window.localStorage.setItem("token", "");
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
},{}]},{},[1,2,3,4,5,6,7,8]);
