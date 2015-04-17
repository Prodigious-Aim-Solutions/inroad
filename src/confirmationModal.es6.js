export class ConfirmationModal {
  constructor(){
    this.$el = $('#confirmationModal');
    this.$el.modal();
    return this;
  }

  setBody(text){
    this.$el.find('p').empty().text(text);
    return this;
  }

  setAction(type, text){
    this.$el.find('.btn-action').addClass(`btn-${type}`).empty().text(text);
    return this;
  }
  
  setError(text){
    this.clearError().text(text);
  }
  
  clearError() {
    this.$el.find('.error').empty();
    return this.$el;
  }
  
  actionCallback(cb){
    cb = cb.bind(this);
    this.$el.on('click', '.btn-action', cb);
    return this;
  }

  show(){
    this.$el.modal('show');
    return this;
  }
  
  hide(){
    this.$el.modal('hide');
    return this;
  }
}