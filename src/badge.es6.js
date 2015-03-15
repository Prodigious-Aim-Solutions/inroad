export class Badge {
  constructor() {
    this.$el = $('#badgeModal');
    this.createBadge = this.showBadge.bind(this);
    $(document).on('badgeEarned', this.createBadge);
    return this;
  }
  
  setDetails(args){
    this.$el.find('.type').empty().text(args.type);
    this.$el.find('.description').empty().text(`You are now at ${args.description}`);
    return this;
  }
  
  displayModal(){
    this.$el.modal('show');
    return this;
  }
  
  showBadge(e, type, description){
    this.setDetails({type: type, description: description});
    this.displayModal();
  }
}