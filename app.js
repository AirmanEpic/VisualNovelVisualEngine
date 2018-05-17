var clicked_lm=0;
var mpos={x:0,y:0};
var curve_standoff=400
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
var editing_page=0;
default_user_vars={"Location":0}

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

var dragging={mode:0,offset_x:0,offset_y:0,id:0}

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

   	//hides the preview window until it's needed
   	$('#preview').animate({width:"0px",opacity:0})

    //create special type 0 node (start)
    graph.push({
    	type:0,
    	name:"Start",
    	id:"_Start",
    	choices:[],
    	text:"What the player sees when they start the game up",
    	img_content:"",
    	height:100,
    	width:100,
    	x:0,
    	y:0
    })

    $('.uservars').click(function(event) {
    	load_uservars();
    });

     //starts the draw event ticking.
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
		//This is part of the process of verifying no node that was clicked.
		var selected=-1;

		for (var i in graph)
		{
			//instantiate through graph
			//we'll want to draw each graph node as a box to start.
			//Canvas needs you to specify the draw styles before drawing. Style=color.
			ctx.fillStyle="rgb(30,30,30)"
			//don't get used to this convenience, normally you need to begin path and manually draw each point.
			ctx.fillRect(graph[i].x-viewpos.x+.5,graph[i].y-viewpos.y+.5,graph[i].width,graph[i].height)

			ctx.strokeStyle="rgb(136,102,17)"
			ctx.lineWidth=1;

			//ok so we now have a box for this node.

			//then draw bezier curve from the bottom of this node to the top of any node which is connected.
			//draw a bezier for each node.
			count = graph[i].choices.length;
			for (var ii=0; ii<graph[i].choices.length; ii++)
			{
				tgt = find_node_by_tgt(graph[i].choices[ii].tgt)

				//this is just the horizontal position that I want the bezier curve to come out of. Saves time to store it as a variable.
				posn=(graph[i].width/2)
				//posn-=20
				posn+=(40*((ii-((graph[i].choices.length-1)/2))/(graph[i].choices.length)));

				draw_bezier(
					{x:graph[i].x+posn-viewpos.x,y:graph[i].y-viewpos.y+graph[i].height},
					{x:graph[i].x+posn-viewpos.x,y:graph[i].y-viewpos.y+graph[i].height+200},
					{x:graph[tgt].x+(graph[tgt].width/2)-viewpos.x,y:graph[tgt].y-viewpos.y-200},
					{x:graph[tgt].x+(graph[tgt].width/2)-viewpos.x,y:graph[tgt].y-viewpos.y}
					)
			}

			//Here we have the test for mouseover. If the mouse is over and a click is heard, load this unit's settings.
			rect1 = {min_x:graph[i].x-viewpos.x,min_y:graph[i].y-viewpos.y,w:graph[i].width, h:graph[i].height}
			rect2 = {min_x:mpos.x,min_y:mpos.y,w:1,h:1}
			//the rectangle collision function (which I'm using here for simplicity sake) requires two rectangles for arguments, which are composed of x,y, height, and width.
			if (collision_rect(rect1,rect2))
			{
				ctx.strokeStyle = "#d9a31b"
				//the mouse is over.
				if (clicked_lm==1)
				{
					//lm==1 means that the left mouse is clicked. These combined mean that the box has been clicked.
					load_settings(i);
					editing_page = i;

					//initiate dragging
					dragging.mode = 1;
					dragging.id = i;
					dragging.offset_x = mpos.x-(graph[i].x-viewpos.x)
					dragging.offset_y = mpos.y-(graph[i].y-viewpos.y)
				}
				//this tells the later codes that a box has indeed been moused over and thus don't initiate viewport drag
				selected=i;
			}

			if (clicked_lm==2)
			{
				//dragging action.
				if (dragging.mode==1 && dragging.id==i)
				{
					graph[i].x=mpos.x-dragging.offset_x+viewpos.x
					graph[i].y=mpos.y-dragging.offset_y+viewpos.y
				}
			}

			//next up we'll need to draw the name and ID on the top, and a small-texted version of the description below.
			ctx.fillStyle="#861";
			ctx.textAlign="left"
			ctx.font="12px Verdana"
			ctx.fillText(graph[i].name,graph[i].x-viewpos.x+3,graph[i].y-viewpos.y+12)

			//draw ID
			ctx.fillStyle="#740"
			ctx.font="10px Verdana"
			ctx.textAlign="right"
			ctx.fillText("id: "+graph[i].id,graph[i].x-viewpos.x-3+graph[i].width,graph[i].y-viewpos.y+12)

			//draw description
			ctx.fillStyle="#740"
			ctx.font="10px Verdana"
			ctx.textAlign="left"
			//wraptext now returns number of lines
			h=wrapText(ctx,graph[i].text,graph[i].x-viewpos.x+7, graph[i].y-viewpos.y+25, graph[i].width-10,12)

			//this is the height of the node based on the number of lines, plus some space for the start line.
			graph[i].height=(h*13)+28


			//the arguments are identical here to the above.
			ctx.strokeRect(graph[i].x-viewpos.x+.5,graph[i].y-viewpos.y+.5,graph[i].width,graph[i].height)
		}
	}


	if (clicked_lm==1)
	{
		//If clicked=1, we need to change that into the hold event. (1 is the mousedown event)
		clicked_lm=2

		//also, if no graph was moused over (clicked in this event) it means that the user is trying to grab the viewport
		if (selected==-1)
		{
			dragging.mode=2;
			dragging.offset_x=mpos.x+viewpos.x;
			dragging.offset_y=mpos.y+viewpos.y;
		}
	}

	if (clicked_lm==2)
	{
		if (dragging.mode==2)
		{
			//viewport dragging is happening
			viewpos.x=dragging.offset_x-mpos.x
			viewpos.y=dragging.offset_y-mpos.y
		}
	}

	if (clicked_lm==3)
	{
		//3 is the "Up" event and so clicked_lm must be reset to 0.
		clicked_lm=0
		dragging.mode=0;
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
	//what happens when the screen is resized.
	var vpw = $(window).width();
	var vph = $(window).height();

	var m=detectmob()

	//figuring out how big the canvas area should be.
	var vp_canvarea_w = $('.timelinearea').width() - 8;
	var vp_canvarea_h = $('.timelinearea').height() - 58;

	canvas.height= vp_canvarea_h;
	canvas.width = vp_canvarea_w;

	//figure out how big the settings box should be based on the canvas and make this the MINIMUM size.
	//THIS DID NOT WORK. Using conditionals instead.
	if (graph[editing_page].choices.length<4)
	{
		min_h = $('#timeline').height()
		$('#settings').css({"min-height":(min_h+"px")})
	}
	else
	{
		$('#settings').css({"min-height":"auto"})
	}
}


$(document).ready(init)
$(document).ready(resizeDiv)

//support functions
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
		//draws a bezier curve. Notice how it has 4 points? Bezier curves have 4 points.
		//	the middle two should be the points that kinda help define the curve. Just play around with the middle arguments, you'll see.
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
		ctx.strokeStyle="rgb(136,102,17)";
		ctx.lineWidth=2;
		ctx.stroke();
	}

	function collision_rect(rect1,rect2)
	{
		ret=false

		return (rect1.min_x < rect2.min_x + rect2.w &&rect1.min_x + rect1.w > rect2.min_x &&rect1.min_y < rect2.min_y + rect2.h && rect1.h + rect1.min_y > rect2.min_y)
	}

	function wrapText(context, text, x, y, maxWidth, lineHeight) {
		//no idea how this works, downloaded it from stackexchange.
		//it's supposed to make wrap properly on canvas, which is difficult as all hell.
        var words = text.split(' ');

        if (words.length>40)
        {
        	words.splice(40,words.length-40)

        	words.push("...")
        }

        var line = '';
        var h = 0;

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            h+=1;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);

        return h;
      }

function load_settings(i){
	$("#settings").html("<h2>SETTINGS</h2>")
	//this_box is arguably easier to type than graph[i]
	//it corresponds to the graph entry of the clicked box.
	this_box=graph[i]

	//populate the settings box based on this node/page
	//Start box is identical to the standard box, but it won't be able to be moved.
	if (this_box.type==0 || this_box.type==1)
	{
		//if it's a type=2 node, this will be a "user variable" node and the html string will be different.
		//yes. This is how you do HTML in Javascript. I never said it was pretty.
		str  = "<h4>Settings for "+this_box.name+"</h4>"
		str += "<h5>Name:</h5>"
		str += "<input class='namebox' value='"+this_box.name+"'>"
		str += "<h5>Page text:</h5>"
		str += "<textarea class='textbox' >"+this_box.text+"</textarea>"
		str += "<h5>Images markdown: </h5>"
		str += "<textarea class='imgbox' >"+this_box.img_content+"</textarea>"
		str += "<h5>Player's options: </h5>"

		for (var d=0; d<this_box.choices.length; d++)
		{
			str += "<div class='choiceline'>"
			str += "<p>Title:</p><input class='choicetitle' ind="+d+" value="+this_box.choices[d].text+">"
			str += "<p>Target page:</p><input style='width:54px' class='choicetgt' ind="+d+" value="+this_box.choices[d].tgt+">"
			str += "<p>Conditionals:</p><input class='choiceconds' ind="+d+" value="+this_box.choices[d].cond+">"
			str += "<div class='butt smallbut delete' ind="+d+"><p>Delete</p></div>"
			str += "</div>"
		}

		str += "<div class='butt new'><p>New option<p></div>"
		str += "<div class='butt save'><p>Save page<p></div>"
		str += "<div class='butt prvw' i=" + i + "><p>Preview thy adventure<p></div>"

		//at the end, the string is added to the settings box. I used to just replace the settings html entirely, but that lost the h3. So.
		$('#settings').append(str)
	}

	//due to the way JQuery works, new DOM (such a what was just made with .append) erases all click events. We must create new ones.
	$('.new').click(function(event) {
		//create a new node and option for this node.

		//new node will have a 6 digit random string.
		new_id = randstr(6)

		//This is where the new node (which is attached to the just created option) is created. 
		//this is the data structure of nodes, pay attention!
		graph.push({
	    	type:1,
	    	name:"New Page",
	    	id:new_id,
	    	choices:[],
	    	text:"What the player sees when they start the game up",
	    	img_content:"",
	    	height:100,
	    	width:100,
	    	x:this_box.x+(150*graph[i].choices.length),
	    	y:this_box.y+250
	    })

	    //re-size the node to fit the text on the top line.
	    graph[graph.length-1].width = ((graph[graph.length-1].name.length+graph[graph.length-1].id.length)*10)+15

	    //create a "choice" for the parent node
	    graph[i].choices.push({
	    	text:"Option text",
	    	tgt:new_id,
	    	cond:""
	    })

	    //figure out how big the settings box should be based on the canvas and make this the MINIMUM size.
		//THIS DID NOT WORK. Using conditionals instead.
		if (graph[editing_page].choices.length<4)
		{
			min_h = $('#timeline').height()
			$('#settings').css({"min-height":(min_h+"px")})
		}
		else
		{
			$('#settings').css({"min-height":"auto"})
		}

	    //always reload when making changes so they'll appear.
	    load_settings(i);
	});

	$('.save').click(function(event) {
		//this gets the data from the form and fills in the graph's data with it.
		newtitle = $('.namebox').val();
		newtext = $('.textbox').val();
		newimg = $('.imgbox').val();
		graph[editing_page].name 		= newtitle;
		graph[editing_page].text 		= newtext;
		graph[editing_page].img_content = newimg;

		//resize the node based on the text on the top line.
		graph[editing_page].width = ((newtitle.length+graph[editing_page].id.length)*10)+15


		//these things get all the data from the forms and saves it to the correct node (editing_page)
		$('.choicetitle').each(function(){
			t=parseInt($(this).attr("ind"));
			graph[editing_page].choices[t].text=$(this).val();
		})

		$('.choicetgt').each(function(){
			t=parseInt($(this).attr("ind"));
			graph[editing_page].choices[t].tgt=$(this).val();
		})

		$('.choiceconds').each(function(){
			t=parseInt($(this).attr("ind"));
			graph[editing_page].choices[t].cond=$(this).val();
		})
	});

	$('.delete').click(function(event) {
		ind = parseInt($(this).attr('ind'))

		this_box.choices.splice(ind,1);

		load_settings(i)
	});

	$(".prvw").click(function(event) {
		$('#preview').animate({width:"95%",opacity:1});
		deploy_preview($(this).attr("i"));
	});
}

function deploy_preview(i) {
	$("#preview").html(htmlify( "h2", "YE PREVIEW" ));
	this_box=graph[i];

	var str = "";
	str += htmlify( "h4", "Beholding " + this_box.name );
	str += htmlify( "div", htmlify( "p", "Dismiss" ), "class = 'butt deprvw'" );
	str += htmlify( "canvas", "", "id = 'preview-canvas'" );

	$('#preview').append(str);

	$(".deprvw").click(function(event) {
		$('#preview').animate({width:"0px",opacity:0});
	});
}

function find_node_by_tgt(tgt){
	//very important. This function returns the index in graph of the node with the given ID.
	//this will allow you to search for a node by the ID. 
	//WHY? Well the thing is indexes change when things are created or deleted, and you don't want to have to re-target every node based on that,
	//	so it's simpler to just have everything tied to ID and search it out every time.
	ret = -1;
	for (var i=0; i<graph.length; i++)
	{
		if (graph[i].id==tgt)
		{
			ret = i
		}
	}
	return ret;
}

function load_uservars(){
	$("#settings").html("<h2>SETTINGS</h2>")
	str  = "<h4>User Variable settings</h4>"

	count=0

	//according to stack exchange, this is how you go through data structures with names like this.
	for (var property in default_user_vars) {
	    if (default_user_vars.hasOwnProperty(property)) {
	        // do stuff
	        str += "<div class='choiceline'>"
			str += "<p>Title:</p><input class='varname' ind="+property+" value="+property+">"
			str += "<p>Default Value:</p><input class='vardefval' ind="+property+" value="+default_user_vars[property]+">"
			str += "<div class='butt smallbut delete-var' ind="+property+"><p>Delete</p></div>"
			str += "</div>"
	    }
	}

	str += "<div class='butt new-var'><p>New uservar<p></div>"
	str += "<div class='butt save-var'><p>Save changes<p></div>"

	$('#settings').append(str)

	//affix HTML events to this.
	//note: on varname change, delete the old key, create a new key, and give it the value in the value box.
	$('.varname').change(function(event) {
		todel = $(this).attr("ind")
		oldval = default_user_vars[todel];

		delete default_user_vars[todel]

		newname = $(this).val();
		default_user_vars[newname]=oldval;

		load_uservars();
	});

	$('.new-var').click(function(event) {
		var newname = "user_variable"+Object.keys(default_user_vars).length
		default_user_vars[newname]=0;

		load_uservars();
	});

	$('.delete-var').click(function(event) {
		t = $(this).attr("ind")

		delete default_user_vars[t]

		load_uservars();
	});

	$('.save-var').click(function(event) {

		$('.vardefval').each(function(index, el) {
			t = $(el).attr('ind')
			v = $(el).val()
			default_user_vars[t]=v

			//console.log("set")
			console.log("setting "+t+" to "+v)

			load_uservars();
		});
	});
}

function randstr(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function htmlify( tag, contents, attributes ) {
	if (typeof contents   == "undefined") {contents   = ""};
	if (typeof attributes == "undefined") {attributes = ""};
	var output = "<" + tag + " " + attributes + ">" + contents + "</" + tag + ">";
	return output;
}
