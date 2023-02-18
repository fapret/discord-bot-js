var nO = document.getElementById('useropt');
var l = document.getElementById('nav-user');
function sNO(b){
    const style = getComputedStyle(nO, "").display;
    if (style == "none"){
        nO.style.display = "block";
    } else {
        nO.style.display = "none";
    }
}
l.addEventListener("click", sNO);
document.addEventListener('mouseup', function(e) {
    if (!nO.contains(e.target)) {
        nO.style.display = 'none';
    }
});