
var username = document.getElementById("username");
console.log(username);

if(username !== null) {
    if(username.innerText == 'index'){
        document.getElementById('login').style.display = 'block';
        document.getElementById('logout').style.display = 'none';
        document.getElementById('pipe').style.display = 'none';
        document.getElementById("username").style.display = 'none';
    } else {
        document.getElementById('login').style.display = 'none';
    }
}

var counter = document.getElementById("counter").innerText;

if(counter == 0){
    document.getElementById("counter").style= "display: none";
}
