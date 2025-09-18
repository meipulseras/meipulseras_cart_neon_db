var modal = document.getElementById("modalfotos");

const images = document.getElementsByClassName("foto");

const clicked = e => {
    console.log(e.target.src);
    modal.style.display = "block";
    modalImg.src = e.target.src;
}

for(let img of images){
    img.addEventListener("click", clicked);
} 

var modalImg = document.getElementById("img01")

var span = document.getElementsByClassName("close")[0] = document.getElementsByClassName("modal")[0];

span.onclick = function(){
    modal.style.display = "none";
}