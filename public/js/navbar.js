function navbar(){
    var navbar = document.getElementById("navbar");

    var nav = document.getElementById("nav");

    if(navbar.style.display === "block"){
        navbar.style.display = "none";
        nav.style.height = "40px";
    } else {
        navbar.style.display = "block";
        navbar.style.top = "25px";
        navbar.style.left = "20px";
        navbar.style.position = "relative";
        nav.style.height = "190px";
    }
}

addEventListener("resize", (event) => {
    if(Math.min(window.screen.width) > 480) {
        document.getElementById("navbar").style.display = "block";
        document.getElementById("navbar").style.top = "0";
        document.getElementById("navbar").style.left = "0";
        document.getElementById("nav").height = "40px"
    } else {
        document.getElementById("navbar").style.display = "none";
    }
});

