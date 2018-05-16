var clicked_lm=0;
var mpos={x:0,y:0};
document.body.addEventListener('mousedown', function(){
		if (clicked_lm==0)
		{
			clicked_lm=1;
		}
	}, true); 

	document.body.addEventListener('mouseup', function(){
		clicked_lm=3
	}, true); 

var canvas={};
var ctx={};

var viewpos={x:0,y:0}

var graph=[];
//each graph entry will need:
/*
	- name
	- type
	- id (6 digit string)
	- Output or outputs
	- height and width? Why not.
	- x and y
*/
//Nodes type list:
/*
	0: start node. Unique and can't be created.
	1: standard node.
	2: variable node (controls a user defined variable)
*/

var init=function(){

	canvas = document.getElementById('canvas');
	if (canvas.getContext) 
	{
    	ctx = canvas.getContext('2d');
    }

    $("canvas").mousemove(function(e) {
		mouse_out = false;
	    mpos.x = e.pageX - $('canvas').offset().left;
	   	mpos.y = e.pageY - $('canvas').offset().top;
	})

    //starts the draw event ticking.

    //create special type 0 node (start)
    graph.push({
    	type:0,
    	name:"Start",
    	id:"_Start",
    	outputs:[],
    	height:100,
    	width:100,
    	x:0,
    	y:0
    })
	draw();
}

function draw(){
	//the equivalent of the draw event. And the step event. Whatever.
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle="#220800"
	ctx.fillRect(0,0,canvas.width, canvas.height)

	//ok draw each little box
	if (graph.length!=0)
	{
		for (var i in graph)
		{
			//instantiate through graph
			//we'll want to draw each graph node as a box to start. 
			//Canvas needs you to specify the draw styles before drawing. Style=color.
			ctx.strokeStyle="black"
			//don't get used to this convenience, normally you need to begin path and manually draw each point.
			ctx.fillRect(graph[i].x-viewpos.x,graph[i].y-viewpos.y,graph[i].height,graph[i].width)
			ctx.fillStyle="rgb(30,30,30)"
			//the arguments are identical here to the above.
			ctx.strokeRect(graph[i].x-viewpos.x,graph[i].y-viewpos.y,graph[i].height,graph[i].width)

			//ok so we now have a box for this node. 
			//next up we'll need to draw the name and ID on the top, and a small-texted version of the description below.

			//then draw bezier curve from the bottom of this node to the top of any node which is connected.

			//Here we have the test for mouseover. If the mouse is over and a click is heard, load this unit's settings.
			
		}
	}


	requestAnimationFrame(draw);
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

	var vp_canvarea_w = $('.timelinearea').width() - 8;
	var vp_canvarea_h = $('.timelinearea').height() - 58;

	canvas.height=vp_canvarea_h;
	canvas.width = vp_canvarea_w;
}


$(document).ready(init)
$(document).ready(resizeDiv)

function lengthdir(dis, dir)
{
	var xp=Math.cos(dtr(-dir)) * dis 
	var yp=Math.sin(dtr(-dir)) * dis

	return {x:xp, y:yp}
}

lerp=function(pos1,pos2,perc)
{
	var ret_x=pos1.x+((pos2.x-pos1.x)*perc)
	var ret_y=pos1.y+((pos2.y-pos1.y)*perc)

	return {x:ret_x,y:ret_y}
}

lerp_1d=function(pos1,pos2,perc)
{
	var ret_x=pos1+((pos2-pos1)*perc)

	return ret_x
}

function draw_bezier(pos1,pos2,pos3,pos4)
{
	if (Math.abs(pos1.x-pos4.x)<curve_standoff*2)
	{
		pos2 = lerp(pos1,pos2,.2)
		pos3 = lerp(pos4,pos3,.2)
	}

	var bez = new Bezier(pos1,pos2,pos3,pos4)

	ctx.beginPath()
	var lut = bez.getLUT(20)
	ctx.moveTo(lut[0].x,lut[0].y)
	for (var i=0; i<lut.length; i++)
	{
		ctx.lineTo(lut[i].x,lut[i].y)
	}
	ctx.strokeStyle="black";
	ctx.stroke();
}