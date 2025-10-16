document.querySelectorAll('input[name="envio"]').forEach(radio => {
    radio.addEventListener('change', function(){
        const selectedValue = this.value;
        sendDataToNodeJS(selectedValue);
        setTimeout(function() {
        window.location.reload(true);
    }, 500); 
    });
});

function sendDataToNodeJS(value) {
    fetch('/envio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedOption: value}),
    })
    .then(response => response.json())
    .then(data => console.log('Exito:', data))
    .catch((error) => console.log('Error:', error))
}