document.getElementById('responseForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var message = document.getElementById('message').value;

    if (message) {
        // Send the message to the server
        // You can use fetch or XMLHttpRequest to send the message to your server

        // Example using fetch (assuming you have an endpoint to handle the POST request)
        fetch('/submit-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            console.log(data);
            document.getElementById('confirmation').style.display = 'block';
            document.getElementById('message').value = '';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});