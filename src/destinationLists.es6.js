export class DestinationLists {
  constructor() {
    this.listSaved = this.listSaved.bind(this);
    this.loadList = this.loadList.bind(this);
    this.listDeleted = this.listDeleted.bind(this);
    this.loadLists = this.loadLists.bind(this);
    this.$el = $('#lists');
    $(document).on('listSaved', this.listSaved);
    $(document).on('listDeleted', this.listDeleted);
    $(document).on('signInComplete', this.loadLists);
    this.$el.on('click', 'li', this.loadList);
    //this.loadLists();
  }
  
  loadLists(){
    var token = window.token;
    if(token){
      $.ajax({
        url: `/api/v1/destinationlist?token=${token}`,
        type: 'GET',
        success: (data) =>{
          data = JSON.parse(data);
          for(var i in data){
            var list = data[i];
            if (data[i]._id.$oid){ data[i]["id"] = data[i]._id.$oid; }
            this.addList(list);
          }
        },
        error: (err, errStr) =>{
          
        }
      });
    }
  }
  
  addList(list) {
    var date = new Date(list.updated.$date)
    var tmp = `<li data-id="${list.id}" data-locs="${list.data}"><h4>${list.name}</h4><div class="updated">${date}</div></li>`;
    this.$el.find('ul').append(tmp);
  }
  
  listSaved(e, list) {
    // update list or add new item
    var tmp = `<li data-id="${list.id}" data-locs="${list.data}"><h4>${list.name}</h4><div class="updated">${list.updated}</div></li>`;
    var list = this.$el.find(`li[data-id="${list.id}"]`);
    if (list.length){
      //update
      list.remove();
    } 
    this.$el.find('ul').append(tmp);
  }
  
  listDeleted(e, listId){
    this.$el.find(`[data-id="${listId}"]`).remove();
  }
  
  loadList(e) {
    var $this = $(e.currentTarget);
    var data = $this.data('id');
    var token = window.token;
    $.ajax({
      type: 'GET',
      url: `/api/v1/destinationlist/${token}/${data}`,
      success: (list) => {
        $(document).trigger('listDataLoaded', list);
        
      },
      error: (err, errStr) =>{
      
      }
    });
  }
  
}