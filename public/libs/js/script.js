/*!
    * Start Bootstrap - SB Admin v6.0.2 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
(function($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
    $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
        if (this.href === path) {
            $(this).addClass("active");
        }
    });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });


})(jQuery);

//$("#success-add-alert").fadeTo(2000, 500).toggle("slide", { direction: "right" }, 1000);
//$("#success-delete-alert").fadeOut(2000);
// hieu ung alert

$("#success-add-alert").fadeTo(2000, 500).slideUp(500, function(){
    $("#success-alert").slideUp(500);
});

$("#success-update-alert").fadeTo(2000, 500).slideUp(500, function(){
    $("#success-alert").slideUp(500);
});

$("#success-delete-alert").fadeTo(2000, 500).slideUp(500, function(){
    $("#success-alert").slideUp(500);
});

//$( "#datepicker" ).datepicker();
//$( "#datepicker" ).datepicker( "option", "showAnim", "slideDown" );
//$( "#datepicker1" ).datepicker();
//$( "#datepicker1" ).datepicker( "option", "showAnim", "slideDown" );

function alert_is_activate() {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Khuyến mại chưa được kích hoạt!',
      })
}
function alert_phantram() {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Phần trăm khuyến mại là số 0-100!',
      })
}
function alert_time(){
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ngày kết thúc phải lớn hơn ngày bắt đầu!',
      })
}
function alert_gia(){
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Giá là số > 0!',
      })
}
function alert_delete() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            /*
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            )
            */
            $('#form_xoa').submit();
        } else {
            return false;
        }
      })
}
function alert_boapdung(ev) {
    ev.preventDefault();
    var urlToRedirect = ev.currentTarget.getAttribute('href'); //use currentTarget because the click may be on the nested i tag and not a tag causing the href to be empty
    //console.log(urlToRedirect); // verify if this is the right URL 
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
        if (result.isConfirmed) {
            window.location.href=urlToRedirect;
        }
    }) 
}
function alert_success(){
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Cảm ơn quý khách! Chúng tôi sẽ liên hệ với quý khách sớm nhất có thể!',
        showConfirmButton: false,
        timer: 1800
      })
}
function alert_gia() {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Giá là số > 0!',
      })
}
function showSearchForm(){
    var x = document.getElementById("search-form");
    if (x.style.opacity==0) {
        x.style.opacity = 1;
        x.style.transition = "0.4s";
    } else {
    x.style.opacity = 0;
    x.style.transition = "0.4s";
    }
}