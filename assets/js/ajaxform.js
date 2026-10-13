$(document).ready(function () {
    $('#ajax-form').submit(function (e) {
        e.preventDefault();

        var formData = $(this).serialize();

        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    $('#result').html(response.message).removeClass('text-gray-400').addClass('text-green-500');
                } else {
                    $('#result').html(response.message).removeClass('text-gray-400').addClass('text-red-500');
                }
            },
            error: function () {
                $('#result').html('An error occurred. Please try again.').removeClass('text-gray-400').addClass('text-red-500');
            }
        });
    });
});