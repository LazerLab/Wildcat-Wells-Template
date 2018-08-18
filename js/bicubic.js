var paper = null;

var MAP_W = 512;
var MAP_H = MAP_W;
var P = 1; // pixels per square

var map = null;

//Initialize form
function startBicubic() {
  $("#seed").val(seed);
  for (var i = 1; i < 10; i++) {
//  var max = (1/i).toFixed(2);
    var max = 1;
    if (i > 1) {
      max = 1/Math.pow(2, i-2);
    }
    var sharpness = i+1;
    $("#controlTable").append('<tr><th>Octave '+i+'</th><td><input id="active_'+i+'" type="checkbox" '+( (i>1 && i<6) ? 'checked="checked"' : '')+'/> Min:<input id="min_'+i+'" value="0" type="text"/>  Max:<input id="max_'+i+'" value="'+max+'" type="text" /> Sharpness:<input id="jagged_'+i+'" value="'+sharpness+'" type="text"/></td></tr>');
    
    // Min:<input id="max_'+i+'" value="'+(1/o)+'"/> Jaggedness:<input id="jagged_'+i+'" value="1.5"/>
  }
}

function submitSettings() {
  submit("name:"+$("#name").val()+" "+$("#settings").html());
}

function drawBicubic2() {
  seed = parseInt($("#seed").val());
  initializeMap(MAP_W, MAP_H, 0);
  buildMap(seed);
  drawBitMap();
}
  
// generate, render map from form
function drawBicubic() {
//  paper = Raphael("canvas", MAP_W*P, MAP_H*P);
  try {
    MAP_W = parseInt($("#width").val());
    MAP_H = parseInt($("#height").val());
    seed = parseInt($("#seed").val());
  
    $("#settings").html("w:"+MAP_W+" h:"+MAP_H+" seed:"+seed);
    
    initializeMap(MAP_W, MAP_H, 0);
  } catch (err) {
    alert(err);
    return;
  }

  octave = 1;
  setTimeout(addNextOctave, 10);
//  addOctave(5,0,1,seed);
//  for (var octave = 2; octave <= 7; octave++) {
//    addOctave(octave, 0, 1/octave, seed+octave);
//  }
  
  
//  drawMap();
//  drawBitMap();
}

var octave = 1;
function addNextOctave() {
  log("addNextOctave()");
  try {
    if (octave > 9) {
      drawBitMap();
      return;
    }
    addOctave(octave, 
        parseFloat($('#min_'+octave).val()), 
        parseFloat($('#max_'+octave).val()), 
        seed+octave);
    octave++;
  } catch (err) {
    alert(err);
    return;
  }

  setTimeout(addNextOctave,10);
}

// hard-coded fractal
function buildMap(r_seed) {
  log("buildMap("+r_seed+")");
  for (var i = 2; i <= 5; i++) {
    var min = 0;
    var max = 1/Math.pow(2, i-2);
    var sharpness = i+1;
    addInterval(Math.pow(2,i),Math.pow(2,i),min,max,
        sharpness,r_seed);
  }
}

function addOctave(o,min,max,r_seed) {
  log("addOctave("+o+","+min+","+max+")");
  if (!$("#active_"+o).is(':checked')) {
    return;
  }
  var sharpness = parseFloat($('#jagged_'+o).val()); 
  $("#settings").append("(octave "+o+" min:"+min+" max:"+max+" sharp:"+sharpness+")");
  setStatus("Reticulating Octave "+o);
  addInterval(Math.pow(2,o),Math.pow(2,o),min,max,
      sharpness,r_seed);
}

function initializeMap(w, h, v) {
  setStatus("Initializing Map");
  map = new Array(w);
  for (var x = 0; x < w; x++) {
//    log("initializeMap()"+x);
    map[x] = new Array(h);
    for (var y = 0; y < h; y++) {
      map[x][y] = v; //(y%100)/100;
    }
  }
}

function addInterval(x_sections,y_sections,min,max,exponent,r_seed) {
  var w = x_sections+3;
  var h = y_sections+3;
  var span = max-min;
  
  Math.seedrandom(r_seed);

  var input = new Array(w);
  for (var x = 0; x < w; x++) {
    input[x] = new Array(h);
    for (var y = 0; y < h; y++) {
      input[x][y] = min+Math.pow(Math.random(),exponent)*span;
    }
  }
  
  fillBicubic(input,w,h, map,MAP_W,MAP_H);  
}

function displayMap() {
  $("#themap").html("working...");
  setTimeout(displayMap2,0);
}

function displayMap2() {
  seed = parseInt($("#seed").val());
  initializeMap(MAP_W, MAP_H, 0);
  buildMap(seed);
  $("#themap").html(JSON.stringify(map));
}

/**
 * a section is the rectangle between 4 input points
 * 
 * 
 * @param input the input values.  Note that it must include 1 square of values beyond the map to make the map smooth on the edges
 * @param output the map.  Will add the new value to the map, this allows addition of additional octaves
 */
function fillBicubic(p,iw,ih, output,ow,oh) {
  var sx = ow/(iw-3); // output samples per input section
  var sy = oh/(ih-3);
  
  for (var ix = 0; ix < iw-3; ix++) {  // input_x this is 1 before the current section
    for (var iy = 0; iy < ih-3; iy++) { // input_y this is 1 before the current section
      // set coefficients for the section
      var a00 =     p[ix+1][iy+1];
      var a01 = -.5*p[ix+1][iy+0] +   .5*p[ix+1][iy+2];
      var a02 =     p[ix+1][iy+0] -  2.5*p[ix+1][iy+1] +    2*p[ix+1][iy+2] -   .5*p[ix+1][iy+3];
      var a03 = -.5*p[ix+1][iy+0] +  1.5*p[ix+1][iy+1] -  1.5*p[ix+1][iy+2] +   .5*p[ix+1][iy+3];
      var a10 = -.5*p[ix+0][iy+1] +   .5*p[ix+2][iy+1];
      var a11 = .25*p[ix+0][iy+0] -  .25*p[ix+0][iy+2] -  .25*p[ix+2][iy+0] +  .25*p[ix+2][iy+2];
      var a12 = -.5*p[ix+0][iy+0] + 1.25*p[ix+0][iy+1] -      p[ix+0][iy+2] +  .25*p[ix+0][iy+3] +   .5*p[ix+2][iy+0] - 1.25*p[ix+2][iy+1] +      p[ix+2][iy+2] -  .25*p[ix+2][iy+3];
      var a13 = .25*p[ix+0][iy+0] -  .75*p[ix+0][iy+1] +  .75*p[ix+0][iy+2] -  .25*p[ix+0][iy+3] -  .25*p[ix+2][iy+0] +  .75*p[ix+2][iy+1] -  .75*p[ix+2][iy+2] +  .25*p[ix+2][iy+3];
      var a20 =     p[ix+0][iy+1] -  2.5*p[ix+1][iy+1] +    2*p[ix+2][iy+1] -   .5*p[ix+3][iy+1];                                                                              
      var a21 = -.5*p[ix+0][iy+0] +   .5*p[ix+0][iy+2] + 1.25*p[ix+1][iy+0] - 1.25*p[ix+1][iy+2] -      p[ix+2][iy+0] +      p[ix+2][iy+2] +  .25*p[ix+3][iy+0] -  .25*p[ix+3][iy+2];
      var a22 =     p[ix+0][iy+0] -  2.5*p[ix+0][iy+1] +    2*p[ix+0][iy+2] -   .5*p[ix+0][iy+3] -  2.5*p[ix+1][iy+0] + 6.25*p[ix+1][iy+1] -    5*p[ix+1][iy+2] + 1.25*p[ix+1][iy+3] +   2*p[ix+2][iy+0] -    5*p[ix+2][iy+1] +    4*p[ix+2][iy+2] -     p[ix+2][iy+3] -  .5*p[ix+3][iy+0] + 1.25*p[ix+3][iy+1] -     p[ix+3][iy+2] + .25*p[ix+3][iy+3];
      var a23 = -.5*p[ix+0][iy+0] +  1.5*p[ix+0][iy+1] -  1.5*p[ix+0][iy+2] +   .5*p[ix+0][iy+3] + 1.25*p[ix+1][iy+0] - 3.75*p[ix+1][iy+1] + 3.75*p[ix+1][iy+2] - 1.25*p[ix+1][iy+3] -     p[ix+2][iy+0] +    3*p[ix+2][iy+1] -    3*p[ix+2][iy+2] +     p[ix+2][iy+3] + .25*p[ix+3][iy+0] -  .75*p[ix+3][iy+1] + .75*p[ix+3][iy+2] - .25*p[ix+3][iy+3];
      var a30 = -.5*p[ix+0][iy+1] +  1.5*p[ix+1][iy+1] -  1.5*p[ix+2][iy+1] +   .5*p[ix+3][iy+1];                                                                                                                                                                                                                                                     
      var a31 = .25*p[ix+0][iy+0] -  .25*p[ix+0][iy+2] -  .75*p[ix+1][iy+0] +  .75*p[ix+1][iy+2] +  .75*p[ix+2][iy+0] -  .75*p[ix+2][iy+2] -  .25*p[ix+3][iy+0] +  .25*p[ix+3][iy+2];                                                                                                                                                                
      var a32 = -.5*p[ix+0][iy+0] + 1.25*p[ix+0][iy+1] -      p[ix+0][iy+2] +  .25*p[ix+0][iy+3] +  1.5*p[ix+1][iy+0] - 3.75*p[ix+1][iy+1] +    3*p[ix+1][iy+2] -  .75*p[ix+1][iy+3] - 1.5*p[ix+2][iy+0] + 3.75*p[ix+2][iy+1] -    3*p[ix+2][iy+2] + .75*p[ix+2][iy+3] +  .5*p[ix+3][iy+0] - 1.25*p[ix+3][iy+1] +     p[ix+3][iy+2] - .25*p[ix+3][iy+3];
      var a33 = .25*p[ix+0][iy+0] -  .75*p[ix+0][iy+1] +  .75*p[ix+0][iy+2] -  .25*p[ix+0][iy+3] -  .75*p[ix+1][iy+0] + 2.25*p[ix+1][iy+1] - 2.25*p[ix+1][iy+2] +  .75*p[ix+1][iy+3] + .75*p[ix+2][iy+0] - 2.25*p[ix+2][iy+1] + 2.25*p[ix+2][iy+2] - .75*p[ix+2][iy+3] - .25*p[ix+3][iy+0] +  .75*p[ix+3][iy+1] - .75*p[ix+3][iy+2] + .25*p[ix+3][iy+3];

      
//      log("x:"+((ix-1)*sx)+" - "+(ix*sx) );
      for (var ox = ix*sx; ox < (ix+1)*sx; ox++) { // output_x
        var x = (ox - ix*sx)/sx;
        var x2 = x * x;
        var x3 = x2 * x;
        
        for (var oy = iy*sy; oy < (iy+1)*sy; oy++) { // output_y
          var y = (oy - iy*sy)/sy;
          var y2 = y * y;
          var y3 = y2 * y;

          var v = (a00 + a01 * y + a02 * y2 + a03 * y3) +
                  (a10 + a11 * y + a12 * y2 + a13 * y3) * x +
                  (a20 + a21 * y + a22 * y2 + a23 * y3) * x2 +
                  (a30 + a31 * y + a32 * y2 + a33 * y3) * x3;
          
          output[ox][oy] += v;            
        }
      }  
    }  
  }
}


function setStatus(str) {
  $("#statuss").html(str);
}

/********** MAP DRAWING FUNCTIONS ***********/
function drawBitMap() {
  setStatus("drawBitMap()");
  var canvas = $("#myCanvas")[0];
  var ctx = canvas.getContext("2d");
  ctx.clearRect ( 0 , 0 , 512 , 512 );
  var img = ctx.createImageData(MAP_W,MAP_H);
  var ctr = 0;
  for (var y = 0; y < MAP_H; y++) {
    for (var x = 0; x < MAP_W; x++) {
      var v = map[x][y];
      if (v > 1) v = 1;
      if (v < 0) v = 0;
      
      var v2 = Math.floor(255-v*255);

      img.data[ctr++] = v2; //Math.min(255, Math.max(0, map[x][y]*255)); // r
      img.data[ctr++] = v2; // g
      img.data[ctr++] = v2; // b
      img.data[ctr++] = 255; // a
    }
  }
  ctx.putImageData(img,0,0);
  setStatus("drawBitMap() done");
}

// ************** old raphael version ************** //
var curRow = 0;
function drawMap() {  
  curRow = 0;
  drawMapInterval = setInterval(drawNextRow,10);
}

function drawNextRow() {
  drawRow(curRow);
  curRow++;
  if (curRow > MAP_H) {
    clearInterval(drawMapInterval);
  }
}

function drawRow(y) {
  setStatus("Drawing row "+y);
//  log("drawRow("+y+")");
  for (var x = 0; x < MAP_W; x++) {
    drawPoint(x,y, map[x][y]);
  }
}

function getColor(v) {
  if (v > 1) v = 1;
  if (v < 0) v = 0;
  
  var v2 = Math.floor(255-v*255);
  var ret = "rgb(255,"+v2+","+v2+")";
//  alert(ret);
//  log(v+" => "+ret);
  return ret;
}

function drawPoint(x,y,v) {
  var point = paper.rect(x*P, y*P, P, P);
  var color = getColor(v);
  point.attr({"stroke":color,"fill":color});
}




