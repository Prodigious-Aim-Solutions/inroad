export class DestinationLists {
  constructor() {
    this.listSaved = this.listSaved.bind(this);
    this.$el = $('#lists');
    $(document).on('saveDestList', this.listSaved);
  }
  
  listSaved(e, listId) {
    // update list or add new item
    var list = this.$el.find(`li[data-id="${listId}"]`);
    if (list.length){
      //update
    } else {
      //add list
    }
  }
}