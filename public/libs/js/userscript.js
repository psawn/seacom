    //js của menu đa cấp 
    $(document).on('click', '.dropdown-menu', function (e) {
        e.stopPropagation();
    });

    // make it as accordion for smaller screens
    if ($(window).width() < 992) {
        $('.dropdown-menu a').click(function(e){
            e.preventDefault();
            if($(this).next('.submenu').length){
                $(this).next('.submenu').toggle();
            }
            $('.dropdown').on('hide.bs.dropdown', function () {
                $(this).find('.submenu').hide();
            })
        });
    }

    // scroll to top button
    function scrollToTop() {
        var position =
            document.body.scrollTop || document.documentElement.scrollTop;
        if (position) {
            window.scrollBy(0, -Math.max(1, Math.floor(position / 10)));
            scrollAnimation = setTimeout("scrollToTop()", 30);
        } else clearTimeout(scrollAnimation);
    }

    // change language
    var header = document.getElementById("language-list");
    var languages = header.getElementsByClassName("language");
    for (var i = 0; i < languages.length; i++) {
        languages[i].addEventListener("click", function() {
            var current = document.getElementsByClassName("language_active");
            current[0].className = current[0].className.replace(" language_active", "");
            this.className += " language_active";
        });
    }

    // map
    function initMap() {
        // The location of Uluru
        var uluru = {lat: 21.028834, lng: 105.781846};
        // The map, centered at Uluru
        var map = new google.maps.Map(
            document.getElementById('map'), {zoom: 15, center: uluru});
        // The marker, positioned at Uluru
        var marker = new google.maps.Marker({
            position: uluru,
            map: map,
            label:{
                text:"OSB Investment And Technology JSC",
                color:"GRAY",
                fontSize:"14px",
            }
        });
    }
   
    var url = window.location.href;
    var match = url.match(/tintuc\/(\d+)/)
    if (match) {
        var IDTinTuc = match[1];
    }
    for(var i=0;i<$('.field-news').length;i++) {
        if(IDTinTuc==($('.field-news')[i].id)) {
            $('.field-news')[i].setAttribute("class","field-news2")
        }
    }
    