export class DestinationList {
  constructor() {
    this.$el = $('#currentList');
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.save = this.save.bind(this);
    this.getDirections = this.getDirections.bind(this);
    this.listData = [];
    this.name = "";
    this.id = -1;
    $(document).on('click', '.btn-add-dest:not(.disabled)', this.add);
    $(document).on('click', '.btn-remove-dest', this.remove);
    $(document).on('click', '.btn-get-directions', this.getDirections);
    $('#btnSaveDestList').on('click', this.save);
  }
  
  add(e) {
    var $current = $(e.currentTarget);
    var $location = $current.parents('.location');
    var data = $location.data('id');
    var type = $location.data('type');
    var location = $location.data('location')
    if(!this.$el.find(`[data-id="${data}"]`).length && this.listData.indexOf(data) === -1) {
      this.listData.push(data);
      var name = $current.parents('.location').find('h4').text();
      var destinationTmpl = `<li data-loc-id="${data}" data-loc-type="${type}" data-loc-location="${location}"><h4>${name}</h4><div class="form-group">
                             <input type="button" class="btn btn-remove-dest form-control btn-danger" value="Remove" />
                             <input type="button" class="btn btn-get-directions form-control btn-info" value="Get Directions"
                             </div></li>`;
      this.$el.find('ul').append(destinationTmpl);
      //$current.addClass('disabled');
    }
  }
  
  remove(e) {
    var $current = $(e.currentTarget);
    var $parent = $current.parents('li');
    var data = $parent.data('locId');
    var index = this.listData.indexOf(data);
    this.listData = this.listData.splice(index, 1);
    $parent.remove();
    
  }
  
  save(e) {
    var $current = $(e.currentTarget);
    this.id = this.$el.data('id');
    this.name = $('#listName').val()
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
  
  getDirections(e) {
    var $location = $(e.currentTarget).parents('li');
    var location = $location.data('locLocation');
    var [lat, lon] = location.split(',');
    $(document).trigger('getDirections', [lat, lon]);
  }
}