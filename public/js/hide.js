var username = document.getElementById("username");
var counter = document.getElementById("counter").innerText;

if(username !== null && username.innerText == ''){
    document.getElementById("counter").style.display= "none";
    document.getElementById('login').style.display = 'block';
    document.getElementById('logout').style.display = 'none';
    document.getElementById('pipe').style.display = 'none';
    document.getElementById("username").style.display = 'none';
} else {
    document.getElementById('login').style.display = 'none';
    document.getElementById("counter").style.display= "block";
    document.getElementById('logout').style.display = 'block';

}
