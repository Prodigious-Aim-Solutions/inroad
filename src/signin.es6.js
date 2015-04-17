export class SignIn {
  constructor(){
    this.doSignin = this.signin.bind(this);
    this.$el = $('#signin');
    this.$el.find('.btn').on('click', this.doSignin);
  }
  
  signin (e) {
    var $this = $(this);
    var user = {
      username: this.$el.find('.username').val(),
      password: this.$el.find('.password').val()
    };
    $.ajax({
      data: JSON.stringify(user),
      type: 'POST',
      url: '/api/v1/signin',
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
          $(document).trigger('signin:complete');
          $('#signError').hide()
          return
        } else {
          $('#signError').show();
          $('#signError').html(`Error: ${data.error}`);
        }
      },
      error: (err) => {
        console.log(`Error: ${err}`);
        return
      }
    });
  }
  
  session(token) {
    var data = {
      token: token
    }
    $.ajax({
      type: 'POST',
      url: '/api/v1/session',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: (data) => {
        data = JSON.parse(data);
        if(data.user){
          $(document).trigger('signInComplete', data.user);
          $(document).trigger('signin:session');
        } else {
          window.localStorage.setItem('token', '')
        }
      },
      error: (err) => {
        window.localStorage.setItem('token', '')
      }
    })
  }
}