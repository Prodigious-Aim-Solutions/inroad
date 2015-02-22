export class Register {
  constructor(){
    this.doRegister = this.register.bind(this);
    this.$el = $('#register');
    this.$el.find('.btn').on('click', this.doRegister);
  }
  
  register (e){
    var $this = $(this);
    var user = {
      username: this.$el.find('.username').val(),
      email: this.$el.find('.email').val(),
      password: this.$el.find('.password').val(),
      confirm: this.$el.find('.confirm').val()
    };
    $.ajax({
      data: JSON.stringify(user),
      type: 'POST',
      url: '//marina-griffin.codio.io:5000/api/v1/register',
      contentType : 'application/json',
      success: (data) => {
        data = JSON.parse(data);
        if(data.user){
          data.user.username = user.username;
          $this[0].$el.parent().hide();
          window.token = data.user.token;
          window.localStorage.setItem('token', window.token);
          $('#signInRegModal').modal('hide');
          $(document).trigger('signInComplete', data.user);
          $('#regError').hide();
          return
        } else {
          $('#regError').text(`Error: ${data.error}`);
          $('#regError').show();
        }
      },
      error: (err) => {
        console.log(`Error: ${err}`);
        return
      }
    });
    
  }

}