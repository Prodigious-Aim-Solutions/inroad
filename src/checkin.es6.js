export class CheckIn {
  constructor(){
    this.doCheckin = this.checkin.bind(this);
    $(document).on('click', '.btn-checkin:not(.disabled)', this.doCheckin);
  }
  
  checkin(e) {
    var $target = $(e.currentTarget);
    var user_token = window.token
      if(user_token) {
      var userCheckin = {
        locId: $target.parents('.location').data('id'),
        locType: $target.parents('.location').data('type'),
        token: user_token
      }
      $.ajax({
        contentType: 'application/json',
        type: 'POST',
        url: '/api/v1/checkin',
        data: JSON.stringify(userCheckin),
        success: (data) => {
          data = JSON.parse(data);
          $target.addClass('disabled')
          $(document).trigger('checkInComplete')
          if(data.badge){
            $(document).trigger('badgeEarned', [data.badge.locType, data.badge.level])
          }
        },
        error: (err) =>{
          console.log(`Error ${err}`);
        }
      });
    } else {
      $('#signInRegModal').modal('show')
    }
  }
}