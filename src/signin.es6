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
      url: '//marina-griffin.codio.io:5000/api/v1/signin',
      contentType : 'application/json',
      success: (data) => {
        data = JSON.parse(data);
        if(data.user){
          $this[0].$el.parent().hide();
          window.token = data.user.token;
          return
        } else {
          console.log(`Error: ${data.error}`);
        }
      },
      error: (err) => {
        console.log(`Error: ${err}`);
        return
      }
    });
  }
}