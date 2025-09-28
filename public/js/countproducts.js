function decrement(e) {
    const btn = e.target.parentNode.parentElement.querySelector('button[data-action="decrement"]');
    const target = btn.nextElementSibling;

    let value = Number(target.value);
    value--;
    if(value <= 0){
        target.value = 0;
    } else {
        target.value = value;
    }
    
}

function increment(e) {
    const btn = e.target.parentNode.parentElement.querySelector('button[data-action="decrement"]');
    const target = btn.nextElementSibling;

    let value = Number(target.value);
    value++;

    var stock = document.getElementById("stock").innerText.split(": ");

    if(value <= stock[1]){
        target.value = value;
    } else {
        target.value = stock[1];
    }
}

const decrementButtons = document.querySelectorAll('button[data-action="decrement"]');
const incrementButtons = document.querySelectorAll('button[data-action="increment"]');

decrementButtons.forEach(btn => {
    btn.addEventListener("click", decrement);
    
});

incrementButtons.forEach(btn => {
    btn.addEventListener("click", increment);
});