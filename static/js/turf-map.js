(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.TurfMap = {};

  TurfMap.Base = (function() {
    function Base() {}

    Base.prototype.data = {};

    Base.prototype.create = function() {
      return this.data;
    };

    return Base;

  })();

  TurfMap.Canvas = (function(_super) {
    __extends(Canvas, _super);

    function Canvas(args) {
      if ((args != null) && args.el && args.details) {
        this.data = new google.maps.Map(args.el, args.details);
      } else {
        new Error('TurfMap.Canvas: incorrect arguments passed to constructor');
      }
      return this;
    }

    return Canvas;

  })(TurfMap.Base);

  TurfMap.Details = (function() {
    function Details(args) {
      this.mapOptions = __bind(this.mapOptions, this);
      if (args != null) {
        this.latitude = args.lat;
        this.longitude = args.lon;
        this.locations = args.loc;
        this.location = new TurfMap.LatLong({
          latitude: this.latitude,
          longitude: this.longitude
        }).data;
        this.zoom = args.zoom;
        this.mapTypeId = google.maps.MapTypeId.HYBRID;
        this.minZoom = args.minZoom;
      } else {
        new Error('TurfMapDetails: no args passed to constructor');
      }
      return this;
    }

    Details.prototype.mapOptions = function() {
      return {
        center: new google.maps.LatLng(this.latitude, this.longitude),
        zoom: this.zoom,
        mapTypeId: this.mapTypeId,
        minZoom: this.minZoom
      };
    };

    return Details;

  })();

  TurfMap.Events = (function() {
    function Events() {}

    Events.on = function(el, event, cabllback) {
      google.maps.event.addListener(el, event, cabllback);
      return this;
    };

    return Events;

  })();

  TurfMap.InfoWindow = (function(_super) {
    __extends(InfoWindow, _super);

    function InfoWindow() {
      this.data = new google.maps.InfoWindow();
      return this;
    }

    return InfoWindow;

  })(TurfMap.Base);

  TurfMap.LatLong = (function(_super) {
    __extends(LatLong, _super);

    function LatLong(args) {
      if (args && args.latitude && (args.longitude != null)) {
        this.data = new google.maps.LatLng(args.latitude, args.longitude);
      } else {
        new Error('TurfMapLatLong: incorrect arguments passed to constructor');
      }
      return this;
    }

    return LatLong;

  })(TurfMap.Base);

  TurfMap.Layer = (function(_super) {
    __extends(Layer, _super);

    function Layer() {
      this.setInfoWindow = __bind(this.setInfoWindow, this);
      this.setLocation = __bind(this.setLocation, this);
      this.setDataset = __bind(this.setDataset, this);
      this.toggle = __bind(this.toggle, this);
      this.show = __bind(this.show, this);
      this.hide = __bind(this.hide, this);
      return Layer.__super__.constructor.apply(this, arguments);
    }

    Layer.data = {};

    Layer.id = "";

    Layer.map = {};

    Layer.dataset = {};

    Layer.location = {};

    Layer.infoWindow = {};

    Layer.isDisplayed = false;

    Layer.prototype.setMap = function(map) {
      this.map = map;
      this.show();
      return this;
    };

    Layer.prototype.hide = function() {
      this.data.setMap(null);
      this.isDisplayed = false;
      return this;
    };

    Layer.prototype.show = function() {
      this.data.setMap(this.map);
      this.isDisplayed = true;
      return this;
    };

    Layer.prototype.toggle = function() {
      if (this.isDisplayed) {
        this.hide();
      } else {
        this.show();
      }
      return this;
    };

    Layer.prototype.setDataset = function(dataset) {
      this.dataset = dataset;
      return this;
    };

    Layer.prototype.setLocation = function(location) {
      this.location = location;
      return this;
    };

    Layer.prototype.setInfoWindow = function(infoWindow) {
      this.infoWindow = infoWindow;
      return this;
    };

    return Layer;

  })(TurfMap.Base);

  TurfMap.Marker = (function(_super) {
    __extends(Marker, _super);

    function Marker() {
      this.create = __bind(this.create, this);
      this.data = new google.maps.Marker();
      return this;
    }

    Marker.prototype.create = function(opts) {
      if (opts != null) {
        this.data.setMap(opts.map);
        this.data.setPosition(opts.location);
        return this.data;
      }
      return this.data;
    };

    return Marker;

  })(TurfMap.Base);

  TurfMap.DirectionsLayer = (function(_super) {
    __extends(DirectionsLayer, _super);

    function DirectionsLayer() {
      this._createWaypoints = __bind(this._createWaypoints, this);
      this.setRoute = __bind(this.setRoute, this);
      this.id = 'Directions';
      this.service = new google.maps.DirectionsService();
      this.data = new google.maps.DirectionsRenderer();
      return this;
    }

    DirectionsLayer.prototype.setRoute = function(request, resultCb) {
      var waypoints;
      if ((this.dataset != null) && (this.dataset.origin != null) && (this.dataset.destination != null)) {
        waypoints = this._createWaypoints(this.dataset.waypoints);
        request = {
          origin: this.dataset.origin,
          destination: this.dataset.destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.WALKING
        };
      }
      this.service.route(request, (function(_this) {
        return function(results, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            if (!resultCb) {
              return _this.data.setDirections(results);
            } else {
              _this.data.setDirections(results);
              return resultCb(results, status);
            }
          }
        };
      })(this));
      return this;
    };

    DirectionsLayer.prototype._createWaypoints = function(waypoints) {
      var output, waypoint, waypointAry, _i, _len;
      if (waypoints) {
        output = [];
        waypointAry = waypoints.split('|');
        for (_i = 0, _len = waypointAry.length; _i < _len; _i++) {
          waypoint = waypointAry[_i];
          output.push({
            location: waypoint
          });
        }
        return output;
      }
      return [];
    };

    return DirectionsLayer;

  })(TurfMap.Layer);

  TurfMap.PicturesLayer = (function(_super) {
    __extends(PicturesLayer, _super);

    function PicturesLayer() {
      this.data = new google.maps.panoramio.PanoramioLayer();
      this.id = "Pictures";
      return this;
    }

    return PicturesLayer;

  })(TurfMap.Layer);

  TurfMap.PlaceSearchRequest = (function() {
    function PlaceSearchRequest(args) {
      this.options = __bind(this.options, this);
      this.data = args;
      return this;
    }

    PlaceSearchRequest.prototype._isRadOk = function(rad) {
      return rad > -1 && rad <= 50000;
    };

    PlaceSearchRequest.prototype.options = function() {
      return this.data;
    };

    return PlaceSearchRequest;

  })();

  TurfMap.PlacesLayer = (function(_super) {
    __extends(PlacesLayer, _super);

    function PlacesLayer() {
      this._createMarker = __bind(this._createMarker, this);
      this.show = __bind(this.show, this);
      this.hide = __bind(this.hide, this);
      this.nearbySearch = __bind(this.nearbySearch, this);
      this.setMap = __bind(this.setMap, this);
      this.data = {};
      this.id = "Places";
      this.markers = [];
      this.map = {};
      return this;
    }

    PlacesLayer.prototype.setMap = function(map) {
      this.data = new google.maps.places.PlacesService(map);
      this.map = map;
      this.isDisplayed = true;
      return this;
    };

    PlacesLayer.prototype.nearbySearch = function(request, cb) {
      if ((request != null) || (this.dataset != null)) {
        if (this.dataset && (this.dataset.radius != null)) {
          request = {
            location: this.location,
            radius: this.dataset.radius
          };
        }
        this.data.nearbySearch(request, (function(_this) {
          return function(results, status) {
            var result, _i, _len;
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              for (_i = 0, _len = results.length; _i < _len; _i++) {
                result = results[_i];
                if (cb == null) {
                  _this._createMarker(result);
                } else {
                  cb(result);
                }
              }
            }
          };
        })(this));
      } else {
        new Error('TurfMap.PlacesLayer->nearbySearch: requires both a request and callback parameter');
      }
      return this;
    };

    PlacesLayer.prototype.hide = function() {
      var marker, _i, _len, _ref;
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.setMap(null);
      }
      this.isDisplayed = false;
      return this;
    };

    PlacesLayer.prototype.show = function() {
      var marker, _i, _len, _ref;
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.setMap(this.map);
      }
      this.isDisplayed = true;
      return this;
    };

    PlacesLayer.prototype._createMarker = function(result) {
      var infoWindow, newMarker, place, self;
      self = this;
      newMarker = {};
      place = {
        map: this.map,
        location: result.geometry.location
      };
      newMarker = new TurfMap.Marker().create(place);
      infoWindow = new TurfMap.InfoWindow().create();
      infoWindow.setContent(result.name);
      TurfMap.Events.on(newMarker, 'click', function() {
        infoWindow.open(self.map, this);
      });
      this.markers.push(newMarker);
    };

    return PlacesLayer;

  })(TurfMap.Layer);

  TurfMap.WeatherLayer = (function(_super) {
    __extends(WeatherLayer, _super);

    function WeatherLayer(opts) {
      if (opts != null) {
        this.options = opts;
      }
      this.data = new google.maps.weather.WeatherLayer({
        temperatureUnits: this.options.temperatureUnits
      });
      this.id = "Weather";
      return this;
    }

    return WeatherLayer;

  })(TurfMap.Layer);

  TurfMap.Map = (function() {
    Map.prototype._currentLayers = [];

    function Map(args) {
      this._turnOffLayers = __bind(this._turnOffLayers, this);
      this._createControl = __bind(this._createControl, this);
      this._createLabel = __bind(this._createLabel, this);
      this._addLayer = __bind(this._addLayer, this);
      this._layers = __bind(this._layers, this);
      var el, _i, _len, _ref;
      if ((args != null) && !args.lat || !args.lon) {
        this.els = document.getElementsByClassName(args.el);
        _ref = this.els;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          el = _ref[_i];
          el.innerHTML = "<div class='mapCanvas'></div><div class='mapControls'></div>";
          this.map = document.getElementsByClassName('mapCanvas')[0];
          this.controls = document.getElementsByClassName('mapControls')[0];
          this.details = new TurfMap.Details({
            lat: el.dataset.lat || "",
            lon: el.dataset.lon || "",
            loc: el.dataset.loc || "",
            zoom: parseInt(el.dataset.zoom) || 12,
            minZoom: parseInt(el.dataset.minzoom) || 8
          });
          this.canvas = new TurfMap.Canvas({
            el: this.map,
            details: this.details.mapOptions()
          }).create();
          this.infoWindow = new TurfMap.InfoWindow().create();
          if (args.layers != null) {
            this.layers = this._layers(args.layers, el.dataset);
            if ((el.dataset != null) && el.dataset.layersOff) {
              this._turnOffLayers(el.dataset.layersOff);
            }
          }
        }
      } else if ((args != null) && typeof args === 'object') {
        this.el = args.el;
        this.el.innerHTML = "<div id='mapCanvas'></div><div id='mapControls'></div>";
        this.map = document.getElementById('mapCanvas');
        this.controls = document.getElementById('mapControls');
        this.details = new TurfMap.Details(args);
        this.canvas = new TurfMap.Canvas({
          el: this.map,
          details: this.details.mapOptions()
        }).create();
        this.infoWindow = new TurfMap.InfoWindow().create();
        this.layers = this._layers(args.layers);
      } else {
        new Error('TurfMap: improper argument list passed to constructor');
      }
      return this;
    }

    Map.prototype._layers = function(args, dataset) {
      if (args != null) {
        this._addLayers(args, dataset);
      } else {
        return this._currentLayers;
      }
      return this;
    };

    Map.prototype._addLayers = function(args, dataset) {
      var layer, _i, _len, _results;
      if (args instanceof Array) {
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          layer = args[_i];
          _results.push(this._addLayer(layer, dataset));
        }
        return _results;
      } else {
        return new Error('TurfMap->_addLayers: argument must be an array');
      }
    };

    Map.prototype._addLayer = function(layer, dataset) {
      layer.setMap(this.canvas);
      layer.setLocation(this.details.location);
      layer.setInfoWindow(this.infoWindow);
      if (dataset != null) {
        layer.setDataset(dataset);
      }
      this.controls.appendChild(this._createLabel(layer.id));
      this.controls.appendChild(this._createControl(layer.id));
      $("#" + layer.id).on('click', layer.toggle.bind(layer));
      this._currentLayers.push(layer);
      return this;
    };

    Map.prototype._createLabel = function(layerId) {
      var control;
      control = document.createElement('label');
      control.innerText = layerId;
      return control;
    };

    Map.prototype._createControl = function(layerId) {
      var control;
      control = document.createElement('input');
      control.setAttribute('type', 'checkbox');
      control.setAttribute('checked', 'checked');
      control.setAttribute('id', layerId);
      return control;
    };

    Map.prototype._turnOffLayers = function(layers) {
      var currentLayer, layer, layerAry, _i, _j, _len, _len1, _ref;
      layerAry = layers.split(',');
      for (_i = 0, _len = layerAry.length; _i < _len; _i++) {
        layer = layerAry[_i];
        _ref = this._currentLayers;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          currentLayer = _ref[_j];
          if (currentLayer.id === layer) {
            $("#" + currentLayer.id).trigger('click');
          }
        }
      }
    };

    return Map;

  })();

}).call(this);
