function cRTP(r) { //converts Rem To Pixels
    return r * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function pS(e){ //prevents scroll on event
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function pKBS(e) { //prevents scroll on event
  let k = [32, 33, 34, 35, 37, 38, 39, 40];
  if (k.includes(e.keyCode)) {
    e.preventDefault();
    return false;
  }
}