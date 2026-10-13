

// HERO SLIDER

function nikkiSwiper(selector, options) {
    try {
        if (typeof Swiper !== "function") return null;
        if (!document.querySelector(selector)) return null;
        return new Swiper(selector, options);
    } catch (err) {
        return null;
    }
}

var menu = [];
jQuery('.hero-slide-container .swiper-slide').each(function (index) {
    menu.push(jQuery(this).find('.slide-inner').attr("data-text"));
});

let items = [
    {
        title: 'DUBAI',
        desc: ''
    },
    {
        title: 'SAUDI ARABIA',
        desc: ''
    },
    {
        title: 'BAHRAIN',
        desc: ''
    }
];
var interleaveOffset = 0.5;
var swiperOptions = {
    loop: true,
    speed: 1000,
    parallax: true,
    autoplay: {
        delay: 5500,
        disableOnInteraction: false,
    },
    fadeEffect: {crossFade: true},
    effect: 'fade',
    watchSlidesProgress: true,

    pagination: {
        el: '.hero-slider-thumbnail',
        clickable: true,
        renderBullet: function (index, className) {
            return '<div class="thumb-content ' + className + '"><span>' + items[index].title + '</span><h1>' + items[index].desc + '</h1></div>';
        },
    },
    on: {
        progress: function () {
            // var swiper = this;
            // for (var i = 0; i < swiper.slides.length; i++) {
            //     var slideProgress = swiper.slides[i].progress;
            //     var innerOffset = swiper.width * interleaveOffset;
            //     var innerTranslate = slideProgress * innerOffset;
            //     swiper.slides[i].querySelector(".slide-inner").style.transform =
            //         "translate3d(0, 0, " + innerTranslate + "px)";
            // }
        },

        touchStart: function () {
            // var swiper = this;
            // for (var i = 0; i < swiper.slides.length; i++) {
            //     swiper.slides[i].style.transition = "";
            // }
        },

        setTransition: function (speed) {
            // var swiper = this;
            // for (var i = 0; i < swiper.slides.length; i++) {
            //     swiper.slides[i].style.transition = speed + "ms";
            //     swiper.slides[i].querySelector(".slide-inner").style.transition =
            //         speed + "ms";
            // }
        }
    }
};

var swiper = nikkiSwiper(".hero-slide-container", swiperOptions);

// DATA BACKGROUND IMAGE
// var sliderBgSetting = $(".slide-bg-image");
// sliderBgSetting.each(function (indx) {
//     if ($(this).attr("data-background")) {
//         $(this).css("background-image", "url(" + $(this).data("background") + ")");
//     }
// });

// Testimonial
var swiper3 = nikkiSwiper(".testimonial-slider", {
    spaceBetween: 20,
    slidesPerView: 1,
    speed: 1500,
    loop: false,
    navigation: {
        nextEl: ".testimonial-button-next",
        prevEl: ".testimonial-button-prev",
    },
});

// Gallery
var swiper2 = nikkiSwiper(".gallery-slider", {
    spaceBetween: 20,
    slidesPerView: 3,
    breakpoints: {
        525: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        },
        1200: {
            slidesPerView: 3
        }
    }
});

// Team
var swiper4 = nikkiSwiper(".team-slider", {
    spaceBetween: 20,
    slidesPerView: 2,
    breakpoints: {
        525: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        },
        1200: {
            slidesPerView: 2
        }
    }
});

// Hero Slider 2
var swiper4 = nikkiSwiper(".hero-slide-container2", {
    spaceBetween: 20,
    slidesPerView: 1,
    autoplay: {
        delay: 5500,
        disableOnInteraction: false,
    },
    fadeEffect: {crossFade: true},
    effect: 'fade',
    navigation: {
        nextEl: ".hero-slider-2-next",
        prevEl: ".hero-slider-2-prev",
    },
    pagination: {
        el: '.hero-slider-2-pagination',
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"></span>';
        },
    },
});


// Portfolio
var swiper4 = nikkiSwiper(".portfolio-slider", {
    spaceBetween: 20,
    slidesPerView: 3,
    loop: true,
    speed: 10000,
    grabCursor: false,
    mousewheelControl: false,
    pauseOnMouseEnter: true,
    autoplay: {
        delay: 1,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    breakpoints: {
        525: {
            slidesPerView: 2
        },
        768: {
            slidesPerView: 2
        },
        1200: {
            slidesPerView: 3
        }
    }
});


// Gallery
var swiper4 = nikkiSwiper(".gallery2-slider", {
    slidesPerView: 3,
    loop: true,
    speed: 5000,
    autoplay: {
        delay: 50,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    breakpoints: {
        525: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        },
        1200: {
            slidesPerView: 3
        }
    }
});



// Inner Pages
var swiper5 = nikkiSwiper(".innerpages-slider", {
    slidesPerView: 3,
    spaceBetween: 52,
    speed: 1500,
    // autoplay: {
    //     delay: 6500,
    //     disableOnInteraction: false,
    // },
    breakpoints: {
        525: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 30
        },
        1200: {
            slidesPerView: 3
        }
    }
});



// Split screen
if ($('#multiscroll').length) {
    if (window.innerWidth > 768) {
        $(document).ready(function () {
            $('#multiscroll').multiscroll({
                scrollingSpeed: 800,
            });
        });
    }
}


// Sidebar
if ($('.sidebar-icon').length) {
    $(document).on('click', '.sidebar-icon a', function (e) {
        e.preventDefault();
        $('#fixed-sidebar').addClass('active');
        $('.responsive-menu').toggleClass('active');
        $(this).toggleClass('hide-on-responsive active-hum');
    })
    $(document).on('click', '#fixed-sidebar #close-sidebar', function (e) {
        e.preventDefault();
        $('#fixed-sidebar').removeClass('active');
    })
}


// Get all the sections
$(window).on('scroll', function () {
    let sections = document.querySelectorAll('.section-highlight');
    sections.forEach(section => {
        highlightSection(section);
    })
});

function highlightSection(sectionId) {
    var elem = sectionId && sectionId.nodeType === 1 ? sectionId : null;
    if (!elem || typeof elem.getClientRects !== "function") return;

    var $section = $(elem);
    var offset = $section.offset();
    if (!offset) return;

    var scrollTop = $(window).scrollTop(),
            elementOffset = offset.top,
            distance = elementOffset - scrollTop,
            sectionHeight = $section.height();

    if (distance <= sectionHeight + 400 && distance >= (200 - sectionHeight)) {
        setTimeout(() => {
            $section.addClass('active');
        }, 1500)
    } else {
        $section.removeClass('active');
    }
}



if ($('.video-play-btn').length) {
    $(document).on('click', '.video-play-btn', function (e) {
        e.preventDefault();
        $('.video-popover').addClass('active');
    });
    $(document).on('click', '#close-video-popover', function () {
        $('.video-popover').removeClass('active');
    });
}



try {
    AOS.init({
        once: true,
        duration: 500,
    });
} catch (err) {}

if ($('.counter').length) {
    try {
        $('.counter').filter(function () {
            return this && typeof this.getClientRects === "function";
        }).counterUp({
            delay: 10,
            time: 2000
        });
    } catch (err) {}
}


$(document).on('mouseover', '.service6-box', function () {
    $('.service6-box').removeClass('active');
    $(this).addClass('active');
})


// Responsive menu
$(document).on('click', '.responsive-menu .dropdown-item', function () {
    $('.responsive-menu .dropdown-item').removeClass('dropdown-active');
    $(this).addClass('dropdown-active')
})
$(document).on('click', '.responsive-menu .dropdown-item.dropdown-active', function () {
    $(this).removeClass('dropdown-active')
})





if ($('.interactive-portfolio').length) {
    // JavaScript to handle hover effect
    document.addEventListener('DOMContentLoaded', function () {
        var containers = document.querySelectorAll('.interactive-portfolio');

        containers.forEach(function (container) {
            var textElement = container.querySelector('.interactive-portfolio .title');
            var imagePath = container.getAttribute('data-image-path');
            var imageElement = container.querySelector('.interactive-portfolio img');

            textElement.addEventListener('mousemove', function (event) {
                var mouseX = event.clientX;
                var mouseY = event.clientY;

                // imageElement.src = imagePath;
                // let leftValue = mouseX + 50;
                // let topValue = mouseY - 50;
                // imageElement.style.left = mouseX + 'px';
                // imageElement.style.top = mouseY + 'px';
            });

            textElement.addEventListener('mouseleave', function () {
                // imageElement.src = ''; // Clear the image when not hovering
            });
        });
    });
}




if (window.innerWidth < 600) {
    if ($('.video-bg').length) {
        // Select the iframe
        let iframe = $('.video-bg iframe');

        // Function to set the responsive dimensions
        function setResponsiveDimensions() {
            // Get the aspect ratio of the video
            let aspectRatio = iframe.attr('height') / iframe.attr('width');


            // Calculate the new width based on the container's width
            let newWidth = iframe.parent().width();

            // Calculate the new height based on the aspect ratio
            let newHeight = newWidth * aspectRatio;

            // Set the new dimensions
            iframe.attr('width', newWidth);
            iframe.attr('height', newHeight);

            let iframeWrap = document.querySelector('.video2-area .video-bg');
            iframeWrap.style.height = newHeight + 'px';
            iframeWrap.style.height = newHeight + 'px';
        }
        setResponsiveDimensions();
    }
}



/* Nikki: theme custom-cursor block disabled (bugs). See assets/js/site.js */
