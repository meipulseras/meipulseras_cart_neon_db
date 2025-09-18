function deleteProduct(e){
    const btn = e.target.parentNode.parentElement.querySelector('button[data-action="decrement"]');
    const target = btn.nextElementSibling;

    let value = Number(target.value);

    const json = JSON.parse([{ "name": btn.value, "productquantity": value }])

    console.log(json)

    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener("submit", e => {
            e.preventDefault();

            const formData = new FormData(json);

            console.log(formData)

            console.log()

            validateForm(formData)
            .then(validationResults => {
                console.log(validationResults)
                if(value == 0){
                    Swal.fire({
                    title: '¿Desea eliminar el producto?',
                    icon: 'warning',
                    confirmButtonText: 'Aceptar',
                    cancelButtonText: 'Cancelar',
                    showConfirmButton: true,
                    showCancelButton: true,
                    }).then(function() {
                        if(value == 0) {
                            form.submit();
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error)
            })
        });
    });     

}

const dButtons = document.querySelectorAll('button[data-action="decrement"]');

dButtons.forEach(btn => {
    btn.addEventListener("click", deleteProduct);
});

async function validateForm(formData) {
    return fetch('/cart', {
        method: 'POST',
        body: formData
    }).catch( error =>{
        console.log(error)
    })
    ;
}