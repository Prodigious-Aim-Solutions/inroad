import { ConfirmationModal } from './confirmationModal';

export class DestinationList {
  constructor() {
    this.$el = $('#currentList');
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.save = this.save.bind(this);
    this.getDirections = this.getDirections.bind(this);
    this.displayDirections = this.displayDirections.bind(this);
    this.display = this.display.bind(this);
    this.displayAll = this.displayAll.bind(this);
    this.new = this.new.bind(this);
    this.listData = [];
    this.name = "";
    this.id = undefined;
    $(document).on('click', '.btn-add-dest:not(.disabled)', this.add);
    $(document).on('click', '.btn-remove-dest', this.remove);
    //$(document).on('click', '.btn-get-directions', this.getDirections);
    $(document).on('click', '.btn-directions', this.getDirections)
    $(document).on('displayResults', this.displayDirections);
    $(document).on('listDataLoaded', this.displayAll);
    $('#btnSaveDestList').on('click', this.save);
    $('#btnNewDestList').on('click', this.new);
  }
  
  new(e){
    this.listData = [];
    this.name = "";
    this.id = undefined;
    this.$el.data('id', "");
    this.$el.addClass('hide');
    this.$el.find('ul').empty();
    $('#listName').val("");
  }
  
  add(e) {
    this.$el.removeClass('hide');
    var $current = $(e.currentTarget);
    var $location = $current.parents('.location');
    var data = $location.data('id');
    var type = $location.data('type');
    var location = $location.data('location');
    var name = $current.parents('.location').find('h4').text();
    if(!this.$el.find(`[data-id="${data}"]`).length && this.listData.indexOf(data) === -1) {
      this.display({
        data: data,
        type: type,
        location: location,
        name: name
      });
    }
    $(document).trigger('destinationList:add', [data, type]);
  }
  
  display(data){
    this.listData.push(data.data);
    var destinationTmpl = `<li data-loc-id="${data.data}" data-loc-type="${data.type}" data-loc-location="${data.location}"><h4>${data.name}</h4><div class="form-group">
    <input type="button" class="btn btn-remove-dest form-control btn-danger" value="Remove" />
    <label>Get Directions By:</label>
    <div class="btn-group btn-group-justified" role="group" aria-label="...">
      <div class="btn-group" role="group">
        <button type="button" data-type="walking" class="btn btn-info btn-directions">Walking</button>
      </div>
      <div class="btn-group" role="group">
        <button type="button" data-type="driving" class="btn btn-info btn-directions">Driving</button>
      </div>
      <div class="btn-group" role="group">
        <button type="button" data-type="biking" class="btn btn-info btn-directions">Biking</button>
      </div>
    </div>
    </div></li>`;
    this.$el.find('ul').append(destinationTmpl);
  }
  
  remove(e) {
    var $current = $(e.currentTarget);
    var $parent = $current.parents('li');
    var data = $parent.data('locId');
    var index = this.listData.indexOf(data);
    var token = window.token;
    if(token){
      this.listData.splice(index, 1);
      $parent.remove();
      if(this.listData.length < 1){
        var listId = this.$el.data('id');
        this.$el.addClass('hide');
        this.name = "";
        if(this.id){
          var delTxt = 'Are you sure you want to delete this list?';
          new ConfirmationModal().setBody(delTxt).setAction('danger', 'Delete List').actionCallback(function(e) {
            var success = function(data) {
              this.clearError();
              this.hide();
              $(document).trigger('listDeleted', listId);
            }.bind(this);
            
            var error = function(err, errStr){
              this.setError('Error while deleting.')
            }.bind(this);
            $.ajax({
              type: 'DELETE',
              url: `/api/v1/destinationlist/${token}/${listId}`,
              success: success,
              error: error
            });
          }).show();
        }
        this.id = undefined;
      }
    }
  }
  
  save(e) {
    var $current = $(e.currentTarget);
    this.name = $('#listName').val();
    var destIds = [];
    var user_token = window.token || "";
    var items = this.$el.find('ul li');
    items.each((index, el) =>{
      destIds.push($(el).data('locId'));
    });    
    var list = {
      id: this.id,
      destIds: destIds,
      name: this.name,
      token: user_token
    };
    var type = 'POST';
    if(this.id) {
      type = 'PUT';
    }
    $.ajax({
      type: type,
      url: '/api/v1/destinationlist',
      data: JSON.stringify(list),
      contentType: 'application/json',
      success: (data) => {
        data = JSON.parse(data);
        // sets id if not set
        this.$el.data('id', data.id);
        this.id = data.id;
        $(document).trigger('listSaved', list);
        $(document).trigger('destinationList:save');
      },
      error: (err, strErr) => {
        $('#listErr').append(`Error: ${strErr}`);
      }
    });
  }
  
  displayAll(e, data){
    this.$el.removeClass('hide');
    this.$el.find('ul').empty();
    data = JSON.parse(data);
    this.name = data.name;
    $('#listName').val(data.name);
    this.id = data._id.$oid;
    this.$el.data('id', this.id)
    for(var i in data.location){
      data.location[i].data = data.location[i].locId;
      data.location[i].name = data.location[i].title;
      data.location[i].geometry.flipped = [];
      data.location[i].geometry.flipped[0] = data.location[i].geometry.coordinates[1];
      data.location[i].geometry.flipped[1] = data.location[i].geometry.coordinates[0];
      data.location[i].location = data.location[i].geometry.flipped.join(',');
      this.display(data.location[i]);
    }
  }
  
  getDirections(e) {
    var $current = $(e.currentTarget);
    var $location = $current.parents('li');
    var location = $location.data('locLocation');
    var [lat, lon] = location.split(',');
    var directionType = $current.data('type');
    var type = {
      walking: google.maps.TravelMode.WALKING,
      biking: google.maps.TravelMode.BICYCLING,
      driving: google.maps.TravelMode.DRIVING 
    }
    $location.siblings().removeClass('get-directions')
    $location.addClass('get-directions');
    $('.btn-directions').removeClass('active')
    $current.addClass('active');
    $(document).trigger('getDirections', [lat, lon, type[directionType]]);
    $(document).trigger('destinationList:directions', [location]);
  }
  
  displayDirections(e, results){
    var $li = $('.get-directions');
    $li.find('ol').remove();
    var output = "<ol>";
    var steps = results.routes[0].legs[0].steps;
    for(var i in steps){
      var step = steps[i];
      output += `<li>  ${step.instructions} </li>`;
    }
    output += "</ol>"
    $li.append(output);
  }
  
  getItinerary(e){
    var $li = this.$el.find('ul li');
    $li.each(function(index, el){
      let location = $(this).data('locLocation');
      let [lat, lon] = location.split(',');
    });
  }
}