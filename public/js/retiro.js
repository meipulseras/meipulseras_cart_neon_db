document.querySelectorAll('input[name="envio"]').forEach(radio => {
    radio.addEventListener('change', function(){
        const selectedValue = this.value;
        sendDataToNodeJS(selectedValue);
        const pagar = document.getElementById("botonpagar");
        pagar.disabled = true;
        setTimeout(function() {
            history.go(0);
        }, 1200); 
        
        pagar.disabled = false;
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