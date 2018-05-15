
var canvas={};
var ctx={};
var main=function(){

	var canvas = document.getElementById('canvas');
	if (canvas.getContext) 
	{
    	var ctx = canvas.getContext('2d');
    }

	drawscr();
}

function drawscr(){
	ctx.clearRect(0, 0, 800, 800)
	ctx.fillStyle="black"
	ctx.fillRect(0,0,800,800)

	kd.tick();

	requestAnimationFrame(drawscr);
}



function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
window.onresize = function(event) {
resizeDiv();
}


function resizeDiv() {
	var vpw = $(window).width();
	var vph = $(window).height();


	var m=detectmob()
}


$(document).ready(main)
$(document).ready(resizeDiv)

function lengthdir(dis, dir)
{
	var xp=Math.cos(dtr(-dir)) * dis 
	var yp=Math.sin(dtr(-dir)) * dis

	return {x:xp, y:yp}
}

