$('input#birthdate').on('keyup', function(e) {
    var unicode = e.keyCode? e.keyCode : e.charCode;
    if(unicode != 8){
        if(this.value.length === 2 || this.value.length == 5) {
            this.value += '-';
        }
    }
});