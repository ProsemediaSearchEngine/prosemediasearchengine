$( document ).ready(function() {
    $(".togglerequestandlogin").click(function () {
      $(this).html(function(i, text){
          return text === 'LOGIN <i class="fa fa-angle-right"></i>' ? 'REQUEST ACCESS <i class="fa fa-angle-right"></i>' : 'LOGIN <i class="fa fa-angle-right"></i>';
      })
   });
});