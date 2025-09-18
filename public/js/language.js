var arrayLang = {
    "español": {
        "HOME": "Home",
        "COTIZ": "Cotización",
        "BIEN": "BIENVENIDOS!",
        "INTRO": "¡Hola! Mi nombre es Marcela, Diseñadora Gráfica y fanática de las manualidades. Me gustaría presentarte Mei Pulseras, mi emprendimiento, que nace el año 2022 con el fin de crear pulseras coloridas y atemporales, para combinar con tu outfit del día a día. Todas nuestras pulseras son hechas a mano con materiales cuidadosamente seleccionados como: piedras naturales, cristales, vidrio, acero y plata. Cada pieza es única y está hecha con mucho cariño. Si te gusta mi trabajo, no dudes en contactarme.",
        "SIGUE": "SÍGUENOS",
        "F1": "NOMBRE COMPLETO:",
        "F2": "RUT:",
        "F3": "DIRECCIÓN:",
        "F4": "COMUNA:",
        "F5": "TELÉFONO:",
        "F6": "CORREO:",
        "F7": "COTIZA TU PRODUCTO:",
        "F8": "*Imágenes referenciales.",
        "F9": "Deja tu comentario.",
    },
    "english": {
        "HOME": "Home",
        "COTIZ": "Pricing",
        "BIEN": "WELCOME!",
        "INTRO": "Hello! My name is Marcela. I’m a Graphic designer and crafts enthusiast. I’m proud to introduce you to my business which was born in 2022 with the aim of creating colourful and timeless bracelets to complement with your everyday outfit. All our bracelets are handmade with carefully selected materials such as: natural stones, crystals, glass, steel and silver. Each piece is unique and made with love. If you’re interested in my work, don’t hesitate to contact me.",
        "SIGUE": "FOLLOW US",
        "F1": "FULL NAME:",
        "F2": "ID:",
        "F3": "ADDRESS:",
        "F4": "ZIP CODE:",
        "F5": "PHONE NUMBER:",
        "F6": "EMAIL:",
        "F7": "QUOTE YOUR PRODUCT:",
        "F8": "*Reference images.",
        "F9": "Leave us your comment.",
    }
};


function textos (lang){

    if(lang === "english"){
        $('input:submit').attr("value", "Pricing");
    } else {
        $('input:submit').attr("value", "Cotizar");
    }
}

function espaciado(){
    if(document.cookie === "english"){
        $(".centro").attr('style', 'width: 136px');
    } else {
        $(".centro").attr('style', 'width: 125px');
    }
}

$(window).on("load", function(){
    espaciado();
});

$(document).ready(function() {
    var lang = "español";

    const idioma = document.cookie;

    if(idioma !== ""){
        lang = idioma;
        textos(lang);
    } 

    $(".lang").each(function(index, element){
        $(this).text(arrayLang[lang][$(this).attr("key")]);
    });
});

$(".translate").click(function(){
    var lang = $(this).attr("id");

    textos(lang);

    $(".lang").each(function(index, element){
        $(this).text(arrayLang[lang][$(this).attr("key")]);
        document.cookie = lang;
        espaciado();
    });
});