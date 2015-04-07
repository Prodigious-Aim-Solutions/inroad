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

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DestinationList = exports.DestinationList = (function () {
  function DestinationList() {
    _classCallCheck(this, DestinationList);

    this.$el = $("#currentList");
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.save = this.save.bind(this);
    this.getDirections = this.getDirections.bind(this);
    this.displayDirections = this.displayDirections.bind(this);
    this.display = this.display.bind(this);
    this.displayAll = this.displayAll.bind(this);
    this.listData = [];
    this.name = "";
    this.id = -1;
    $(document).on("click", ".btn-add-dest:not(.disabled)", this.add);
    $(document).on("click", ".btn-remove-dest", this.remove);
    $(document).on("click", ".btn-get-directions", this.getDirections);
    $(document).on("displayResults", this.displayDirections);
    $(document).on("listDataLoaded", this.displayAll);
    $("#btnSaveDestList").on("click", this.save);
  }

  _prototypeProperties(DestinationList, null, {
    add: {
      value: function add(e) {
        var $current = $(e.currentTarget);
        var $location = $current.parents(".location");
        var data = $location.data("id");
        var type = $location.data("type");
        var location = $location.data("location");
        var name = $current.parents(".location").find("h4").text();
        if (!this.$el.find("[data-id=\"" + data + "\"]").length && this.listData.indexOf(data) === -1) {
          this.display({
            data: data,
            type: type,
            location: location,
            name: name
          });
        }
      },
      writable: true,
      configurable: true
    },
    display: {
      value: function display(data) {
        this.listData.push(data.data);
        var destinationTmpl = "<li data-loc-id=\"" + data.data + "\" data-loc-type=\"" + data.type + "\" data-loc-location=\"" + data.location + "\"><h4>" + data.name + "</h4><div class=\"form-group\">\n<input type=\"button\" class=\"btn btn-remove-dest form-control btn-danger\" value=\"Remove\" />\n<input type=\"button\" class=\"btn btn-get-directions form-control btn-info\" value=\"Get Directions\"\n</div></li>";
        this.$el.find("ul").append(destinationTmpl);
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
        this.id = this.$el.data("id");
        this.name = $("#listName").val();
        var destIds = [];
        var user_token = window.token || "";
        var items = this.$el.find("ul li");
        items.each(function (index, el) {
          destIds.push($(el).data("locId"));
        });
        var list = {
          id: this.id,
          destIds: destIds,
          name: this.name,
          token: user_token
        };
        var type = "POST";
        if (this.id) {
          type = "PUT";
        }
        $.ajax({
          type: type,
          url: "/api/v1/destinationlist",
          data: JSON.stringify(list),
          contentType: "application/json",
          success: function (data) {
            data = JSON.parse(data);
            // sets id if not set
            _this.$el.data("id", data.id);
            _this.id = data.id;
            $(document).trigger("listSaved", list);
          },
          error: function (err, strErr) {
            $("#listErr").append("Error: " + strErr);
          }
        });
      },
      writable: true,
      configurable: true
    },
    displayAll: {
      value: function displayAll(e, data) {
        data = JSON.parse(data);
        for (var i in data.location) {
          data.location[i].data = data.location[i].locId;
          data.location[i].name = data.location[i].title;
          data.location[i].geometry.flipped = [];
          data.location[i].geometry.flipped[0] = data.location[i].geometry.coordinates[1];
          data.location[i].geometry.flipped[1] = data.location[i].geometry.coordinates[0];
          data.location[i].location = data.location[i].geometry.flipped.join(",");
          this.display(data.location[i]);
        }
      },
      writable: true,
      configurable: true
    },
    getDirections: {
      value: function getDirections(e) {
        var $location = $(e.currentTarget).parents("li");
        var location = $location.data("locLocation");

        var _location$split = location.split(",");

        var _location$split2 = _slicedToArray(_location$split, 2);

        var lat = _location$split2[0];
        var lon = _location$split2[1];

        $location.siblings().removeClass("get-directions");
        $location.addClass("get-directions");
        $(document).trigger("getDirections", [lat, lon]);
      },
      writable: true,
      configurable: true
    },
    displayDirections: {
      value: function displayDirections(e, results) {
        //var $this = $('.get-directions')[0];
        var $li = $(".get-directions");
        var output = "<ol>";
        var steps = results.routes[0].legs[0].steps;
        for (var i in steps) {
          var step = steps[i];
          output += "<li>  " + step.instructions + " </li>";
        }
        output += "</ol>";
        $li.append(output);
      },
      writable: true,
      configurable: true
    },
    getItinerary: {
      value: function getItinerary(e) {
        var $li = this.$el.find("ul li");
        $li.each(function (index, el) {
          var location = $(this).data("locLocation");

          var _location$split = location.split(",");

          var _location$split2 = _slicedToArray(_location$split, 2);

          var lat = _location$split2[0];
          var lon = _location$split2[1];
        });
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
//$current.addClass('disabled');
},{}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DestinationLists = exports.DestinationLists = (function () {
  function DestinationLists() {
    _classCallCheck(this, DestinationLists);

    this.listSaved = this.listSaved.bind(this);
    this.loadList = this.loadList.bind(this);
    this.$el = $("#lists");
    $(document).on("listSaved", this.listSaved);
    this.$el.on("click", "li", this.loadList);
    this.loadLists();
  }

  _prototypeProperties(DestinationLists, null, {
    loadLists: {
      value: function loadLists() {
        var _this = this;

        var token = window.token;
        if (token) {
          $.ajax({
            url: "/api/v1/destinationlist?token=" + token,
            type: "GET",
            success: function (data) {
              data = JSON.parse(data);
              for (var i in data) {
                var list = data[i];
                if (data[i]._id.$oid) {
                  data[i].id = data[i]._id.$oid;
                }
                _this.addList(list);
              }
            },
            error: function (err, errStr) {}
          });
        }
      },
      writable: true,
      configurable: true
    },
    addList: {
      value: function addList(list) {
        var date = new Date(list.updated.$date);
        var tmp = "<li data-id=\"" + list.id + "\" data-locs=\"" + list.data + "\"><h4>" + list.name + "</h4><div class=\"updated\">" + date + "</div></li>";
        this.$el.find("ul").append(tmp);
      },
      writable: true,
      configurable: true
    },
    listSaved: {
      value: function listSaved(e, list) {
        // update list or add new item
        var tmp = "<li data-id=\"" + list.id + "\" data-locs=\"" + list.data + "\"><h4>" + list.name + "</h4><div class=\"updated\">" + list.updated + "</div></li>";
        var list = this.$el.find("li[data-id=\"" + list.id + "\"]");
        if (list.length) {
          //update
          list.remove();
        }
        this.$el.find("ul").append(tmp);
      },
      writable: true,
      configurable: true
    },
    loadList: {
      value: function loadList(e) {
        var $this = $(e.currentTarget);
        var data = $this.data("id");
        var token = window.token;
        $.ajax({
          type: "GET",
          url: "/api/v1/destinationlist/" + token + "/" + data,
          success: function (list) {
            $(document).trigger("listDataLoaded", list);
          },
          error: function (err, errStr) {}
        });
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
},{}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Map = exports.Map = (function () {
  function Map(lat, lon, zoom, type) {
    _classCallCheck(this, Map);

    this.directionsLayer = new TurfMap.DirectionsLayer();
    this.placesLayer = new TurfMap.PlacesLayer();
    this.getDirections = this.getDirections.bind(this);
    $(document).on("getDirections", this.getDirections);
    this.mapDisplayData = this.displayData.bind(this);
    this.lat = lat;
    this.lon = lon;
    this.map = new TurfMap.Map({
      el: document.getElementById("theMap"),
      lat: lat,
      lon: lon,
      zoom: zoom,
      minZoom: 7,
      layers: [this.directionsLayer, this.placesLayer]
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
          var wrap = "<div data-id=\"" + el.locId + "\" data-type=\"" + locType + "\" data-location=\"" + el.geometry.coordinates[1] + "," + el.geometry.coordinates[0] + "\" class=\"location\">";
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
            url: "/api/v1/parks",
            dataType: "json",
            success: function success(data) {
              $this.mapDisplayData(data, "park");
            },
            error: function error(err) {
              console.log("Error" + err.toString());
            }
          });
        } else {
          $.ajax({
            url: "/api/v1/historic",
            dataType: "json",
            success: function success(data) {
              $this.mapDisplayData(data, "historic");
            },
            error: function error(err) {
              console.log("Error" + err.toString());
            }
          });

          $.ajax({
            url: "/api/v1/historic",
            dataType: "json",
            success: function success(data) {
              $this.mapDisplayData(data, "historic");
            },
            error: function error(err) {
              console.log("Error" + err.toString());
            }
          });

          $.ajax({
            url: "/api/v1/historic",
            dataType: "json",
            success: function success(data) {
              $this.mapDisplayData(data, "historic");
            },
            error: function error(err) {
              console.log("Error" + err.toString());
            }
          });
        }

        this.placesLayer.nearbySearch({
          location: this.map.details.location,
          radius: "10000",
          type: ["establishment"]
        });
      },
      writable: true,
      configurable: true
    },
    getDirections: {
      value: function getDirections(e, locLat, latLon) {
        var destination = new google.maps.LatLng(parseFloat(locLat), parseFloat(latLon));
        var request = {
          origin: this.userLoc,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING
        };
        this.directionsLayer.setRoute(request, this.displayResults);
      },
      writable: true,
      configurable: true
    },
    displayResults: {
      value: function displayResults(results) {
        $(document).trigger("displayResults", results);
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
