export class DestinationList {
  constructor() {
    this.$el = $('#currentList');
    this.add = this.add.bind(this);
    this.save = this.save.bind(this);
    $(document).on('click', '.btn-add-dest', this.add);
    $('#btnSaveDestList').on('click', this.save)
  }
  
  add(e) {
    var $current = $(e.currentTarget);
    var data = $current.data('id');
    if(!this.$el.find(`[data-id]=${data}`).length) {
      var name = $current.parents('.location').find('h4').text();
      var destinationTmpl = `<li data-loc-id="${data}"><h3>${name}</h3><div class="form-group"><input type="button" class="btn btn-remove-dest" value="Remove" /></div></li>`;
      this.$el.find('ul').append(destinationTmpl);
    }
  }
  
  save(e) {
    var $current = $(e.currentTarget);
    var id = this.$el.data('id');
    var destIds = [];
    var items = this.$el.find('ul li');
    item.each((index, el) =>{
      destIds.push($(el).data(id));
    });
    var list = {
      id: id,
      destIds: destIds
    }
    $.ajax({
      type: 'POST',
      url: '/api/v1/destinationlist',
      data: JSON.stringify(list),
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