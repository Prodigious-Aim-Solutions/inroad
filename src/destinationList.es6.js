export class DestinationList {
  constructor() {
    this.$el = $('#currentList');
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.save = this.save.bind(this);
    this.listData = [];
    $(document).on('click', '.btn-add-dest:not(.disabled)', this.add);
    $(document).on('click', '.btn-remove-dest', this.remove);
    $('#btnSaveDestList').on('click', this.save);
  }
  
  add(e) {
    var $current = $(e.currentTarget);
    var data = $current.parents('.location').data('id');
    if(!this.$el.find(`[data-id="${data}"]`).length && this.listData.indexOf(data) === -1) {
      this.listData.push(data);
      var name = $current.parents('.location').find('h4').text();
      var destinationTmpl = `<li data-loc-id="${data}"><h4>${name}</h4><div class="form-group"><input type="button" class="btn btn-remove-dest" value="Remove" /></div></li>`;
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
    var id = this.$el.data('id');
    var destIds = [];
    var user_token = window.token;
    var items = this.$el.find('ul li');
    items.each((index, el) =>{
      destIds.push($(el).data('locId'));
    });
    var list = {
      id: id,
      destIds: destIds,
      token: user_token
    };
    $.ajax({
      type: 'POST',
      url: '/api/v1/destinationlist',
      data: JSON.stringify(list),
      contentType: 'application/json',
      success: (data) => {
        data = JSON.parse(data);
        // sets id if not set
        this.$el.data('id', data.id);
      },
      error: (err) => {
        
      }
    })
    $(document).trigger('saveDestList', id);
  }
}