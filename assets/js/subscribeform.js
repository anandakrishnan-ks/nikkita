$(document).ready(function() {
    // Function to handle form submission
    $("#subscribe-form").submit(function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the form data
        var formData = $(this).serialize();

        // Send an AJAX request
        $.ajax({
            type: "POST",
            url: "assets/mail/subscribe.php",
            data: formData,
            success: function(response) {
                console.log(response);  // Log the response to the console
                var resultElement = $("#result1");
            
                if (response.success === true) {
                    resultElement.text("Thank you for subscribing!").removeClass("text-error").addClass("text-success");
                    $("#subscribe-form")[0].reset();
                } else {
                    resultElement.text("Failed to subscribe. Please try again later.").removeClass("text-success").addClass("text-error");
                }
            },

            error: function() {
                // Display error message if AJAX request fails
                $("#result1").text("Failed to subscribe. Please try again later.").removeClass("text-success").addClass("text-error");
            }
        });
    });
});

