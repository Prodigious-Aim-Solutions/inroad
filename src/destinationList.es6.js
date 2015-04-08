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
    this.listData = [];
    this.name = "";
    this.id = undefined;
    $(document).on('click', '.btn-add-dest:not(.disabled)', this.add);
    $(document).on('click', '.btn-remove-dest', this.remove);
    $(document).on('click', '.btn-get-directions', this.getDirections);
    $(document).on('displayResults', this.displayDirections);
    $(document).on('listDataLoaded', this.displayAll);
    $('#btnSaveDestList').on('click', this.save);
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
  }
  
  display(data){
    this.listData.push(data.data);
    var destinationTmpl = `<li data-loc-id="${data.data}" data-loc-type="${data.type}" data-loc-location="${data.location}"><h4>${data.name}</h4><div class="form-group">
<input type="button" class="btn btn-remove-dest form-control btn-danger" value="Remove" />
<input type="button" class="btn btn-get-directions form-control btn-info" value="Get Directions"
</div></li>`;
    this.$el.find('ul').append(destinationTmpl);
  }
  
  remove(e) {
    var $current = $(e.currentTarget);
    var $parent = $current.parents('li');
    var data = $parent.data('locId');
    var index = this.listData.indexOf(data);
    this.listData = this.listData.splice(index, 1);
    $parent.remove();
    if(this.listData.length < 1){
      this.$el.addClass('hide');
      this.name = "";
      this.id = undefined;
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
    var $location = $(e.currentTarget).parents('li');
    var location = $location.data('locLocation');
    var [lat, lon] = location.split(',');
    $location.siblings().removeClass('get-directions')
    $location.addClass('get-directions');    
    $(document).trigger('getDirections', [lat, lon]);
  }
  
  displayDirections(e, results){
    var $li = $('.get-directions');
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