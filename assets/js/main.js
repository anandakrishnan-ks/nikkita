

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
function labelHeroPagination(slider) {
    Promise.resolve().then(function () {
        // Looping slides are cloned by Swiper; keep a single document H1.
        slider.el.querySelectorAll('.swiper-slide-duplicate h1').forEach(function (heading) {
            var replacement = document.createElement('h2');
            Array.prototype.forEach.call(heading.attributes, function (attribute) {
                replacement.setAttribute(attribute.name, attribute.value);
            });
            while (heading.firstChild) replacement.appendChild(heading.firstChild);
            heading.replaceWith(replacement);
        });
        if (!slider.pagination || !slider.pagination.bullets) return;
        Array.prototype.forEach.call(slider.pagination.bullets, function (bullet, index) {
            bullet.setAttribute('aria-label', 'Show ' + items[index].title + ' slide');
            if (index === slider.realIndex) bullet.setAttribute('aria-current', 'true');
            else bullet.removeAttribute('aria-current');
        });
    });
}
var swiperOptions = {
    on: {
        init: function () { labelHeroPagination(this); },
        loopFix: function () { labelHeroPagination(this); },
        paginationUpdate: function () { labelHeroPagination(this); }
    },
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
            return '<button type="button" class="thumb-content ' + className + '"><span>' + items[index].title + '</span></button>';
        },
    },

};

var swiper = nikkiSwiper(".hero-slide-container", swiperOptions);

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
