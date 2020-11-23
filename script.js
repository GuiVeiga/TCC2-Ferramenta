class Shape2D {

  constructor(x, y) { this.x = x; this.y = y; }

  moveTo(x, y) { }

}

class Circle2D extends Shape2D {

  constructor(x, y, r) {

    super();

    this.x = x; this.y = y; this.r = r;

  }

  moveTo(x, y) {

    this.x += x - this.x;
    this.y += y - this.y;

  }

}

class LineSegment2D extends Shape2D {

  constructor(x, y, x0, y0, x1, y1) {

    super();

    this.x = x; this.y = y;

    this.point0 = new Point2D(x + x0, y + y0);
    this.point1 = new Point2D(x + x1, y + y1);

  }

  moveTo(x, y) {

    var vector_x = x - this.x;
    var vector_y = y - this.y;

    this.point0.x += vector_x;
    this.point0.y += vector_y;
    this.point1.x += vector_x;
    this.point1.y += vector_y;

    this.x += vector_x;
    this.y += vector_y;

  }

}

class Point2D { constructor(x, y) { this.x = x; this.y = y; } }

class Polygon2D extends Shape2D {

  constructor(x, y, d, ...vertices) {

    super();

    this.x = x; this.y = y; this.d = d; // direction in radians.
    this.vertices = new Array();

    for (let index = vertices.length - 2; index > -1; index -= 2) {

      this.vertices[index * 0.5] = new Point2D(vertices[index] + x, vertices[index + 1] + y);

    }

  }

  moveTo(x, y) {

    var vector_x = x - this.x;
    var vector_y = y - this.y;

    for (let index = this.vertices.length - 1; index > -1; --index) {

      let vertex = this.vertices[index];

      vertex.x += vector_x;
      vertex.y += vector_y;

    }

    this.x += vector_x;
    this.y += vector_y;

  }

  rotateTo(d) {

    var direction = d - this.d;
    this.d += direction;

    var vector_x = Math.cos(direction);
    var vector_y = Math.sin(direction);

    for (let index = this.vertices.length - 1; index > -1; --index) {

      let vertex = this.vertices[index];

      let x = vertex.x - this.x;
      let y = vertex.y - this.y;

      vertex.x = x * vector_x - y * vector_y + this.x;
      vertex.y = x * vector_y + y * vector_x + this.y;

    }

  }

}

var animation_frame_request = undefined;
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d", { alpha: false });
var output = document.querySelector("p");

var circleCyan0 = new Circle2D(0, 0, 6);
var circleCyan1 = new Circle2D(0, 0, 6);
var segment0 = new LineSegment2D(0, 0, (-100), (-100), 100, (-100));
var vector0 = new Point2D(undefined, undefined);

var circleMagenta0 = new Circle2D(0, 0, 6);
var circleMagenta1 = new Circle2D(0, 0, 6);
var segment1 = new LineSegment2D(0, 0, (-100), (-100), (-250), 100);
var vector1 = new Point2D(undefined, undefined);

var circleYellow0 = new Circle2D(0, 0, 6);
var circleYellow1 = new Circle2D(0, 0, 6);
var segment2 = new LineSegment2D(0, 0, (-250), 100, 250, 100)
var vector2 = new Point2D(undefined, undefined);

var circleGreen0 = new Circle2D(0, 0, 6);
var circleGreen1 = new Circle2D(0, 0, 6);
var segment3 = new LineSegment2D(0, 0, 250, 100, 100, (-100));
var vector3 = new Point2D(undefined, undefined);

var circlePinkRed0 = new Circle2D(0, 0, 6);
var circlePinkRed1 = new Circle2D(0, 0, 6);
var segment4 = new LineSegment2D(0, 0, (-200), (-150), 250, (-150));
var vector4 = new Point2D(undefined, undefined);

var circleLilac0 = new Circle2D(0, 0, 6);
var circleLilac1 = new Circle2D(0, 0, 6);
var segment5 = new LineSegment2D(0, 0, 250, (-150), 250, 200);
var vector5 = new Point2D(undefined, undefined);

var circleBlue0 = new Circle2D(0, 0, 6);
var circleBlue1 = new Circle2D(0, 0, 6);
var segment6 = new LineSegment2D(0, 0, (-200), 250, (-100), 200);
var vector6 = new Point2D(undefined, undefined);

var circleOrange0 = new Circle2D(0, 0, 6);
var circleOrange1 = new Circle2D(0, 0, 6);
var segment7 = new LineSegment2D(0, 0, 100, 280, 200, 200);
var vector7 = new Point2D(undefined, undefined);

var pointer = { down: false, x: undefined, y: undefined };

var selected_shape = undefined;

const reader = new FileReader();
const img = new Image();

///////////////////////////////
//// Vector Math Functions ////
///////////////////////////////

function angle(A1x, A1y, A2x, A2y , B1x, B1y, B2x, B2y) {
  var dAx = A2x - A1x;
  var dAy = A2y - A1y;
  var dBx = B2x - B1x;
  var dBy = B2y - B1y;
  var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
  if(angle < 0) {angle = angle * -1;}
  var degree_angle = angle * (180 / Math.PI);

  return degree_angle;
}

function lineDistance(p1x, p1y, p2x, p2y) {
  return Math.hypot(p2x - p1x, p2y - p1y)
}

function angleSingleLine(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return Math.abs(theta);
}

///////////////////////////
//// Drawing Functions ////
///////////////////////////

function drawCircle(circle, color, line_w = 2) {

  context.beginPath();
  context.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
  context.closePath();
  if (line_w == 0) {
    context.fillStyle = color;
    context.fill();
  } else {
    context.strokeStyle = color;
    context.lineWidth = line_w;
    context.stroke();
  }

}

function drawPolygon(polygon, color, line_w = 2) {

  context.beginPath();

  var point = polygon.vertices[0];
  context.moveTo(point.x, point.y);

  for (let index = polygon.vertices.length - 1; index > 0; --index) {

    point = polygon.vertices[index];
    context.lineTo(point.x, point.y);

  }

  context.closePath();

  if (line_w == 0) {
    context.fillStyle = color;
    context.fill();
  } else {
    context.strokeStyle = color;
    context.lineWidth = line_w;
    context.stroke();
  }

}

function drawSegment(segment, color, line_w = 2) {

  context.beginPath();
  context.moveTo(segment.point0.x, segment.point0.y);
  context.lineTo(segment.point1.x, segment.point1.y);
  context.strokeStyle = color;
  context.lineWidth = line_w;
  context.stroke();

}

///////////////
//// Logic ////
///////////////

function select(shape, r) {

  var vector_x = pointer.x - shape.x;
  var vector_y = pointer.y - shape.y;

  if (vector_x * vector_x + vector_y * vector_y < r * r) {

    selected_shape = shape;

  }

}

function snap(circle0, circle1, r) {

  var vector_x = circle1.x - circle0.x;
  var vector_y = circle1.y - circle0.y;

  if (vector_x * vector_x + vector_y * vector_y < r * r) {

    circle0.x = circle1.x;
    circle0.y = circle1.y;

  }

}

////////////////////
//// Download Image ////
////////////////////

function download() {
  const a = document.createElement("a");

  document.body.appendChild(a);
  a.href = canvas.toDataURL();
  a.download = "canvas.png";
  a.click();
  document.body.removeChild(a);
}

////////////////////
//// Load Image ////
////////////////////

var uploadImage = (e) => {
  reader.onload = () => {
    img.onload = () => {
      resize();
      loop();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};
var imageLoader = document.getElementById('uploader');
imageLoader.addEventListener('change', uploadImage);

function loop() {

  animation_frame_request = window.requestAnimationFrame(loop);

  if (pointer.down && selected_shape == undefined) {

    select(circleCyan0, 20);
    select(circleCyan1, 20);
    
    select(circleMagenta0, 20);
    select(circleMagenta1, 20);
    
    select(circleYellow0, 20);
    select(circleYellow1, 20);
    
    select(circleGreen0, 20);
    select(circleGreen1, 20);
    
    select(circlePinkRed0, 20);
    select(circlePinkRed1, 20);
    
    select(circleLilac0, 20);
    select(circleLilac1, 20);

    select(circleBlue0, 20);
    select(circleBlue1, 20);

    select(circleOrange0, 20);
    select(circleOrange1, 20);

  } else if (!pointer.down) selected_shape = undefined;

  if (selected_shape != undefined) selected_shape.moveTo(Math.round(pointer.x), Math.round(pointer.y));

  if (selected_shape == circleCyan0) snap(circleCyan0, circleMagenta0, 20);
  if (selected_shape == circleMagenta0) snap(circleMagenta0, circleCyan0, 20);

  if (selected_shape == circleMagenta1) snap(circleMagenta1, circleYellow0, 20);
  if (selected_shape == circleYellow0) snap(circleYellow0, circleMagenta1, 20);

  if (selected_shape == circleYellow1) snap(circleYellow1, circleGreen0, 20);
  if (selected_shape == circleGreen0) snap(circleGreen0, circleYellow1, 20);

  if (selected_shape == circleGreen1) snap(circleGreen1, circleCyan1, 20);
  if (selected_shape == circleCyan1) snap(circleCyan1, circleGreen1, 20);

  if (selected_shape == circlePinkRed1) snap(circlePinkRed1, circleLilac0, 20);
  if (selected_shape == circleLilac0) snap(circleLilac0, circlePinkRed1, 20);

  segment0.point0.x = circleCyan0.x;
  segment0.point0.y = circleCyan0.y;
  segment0.point1.x = circleCyan1.x;
  segment0.point1.y = circleCyan1.y;

  segment1.point0.x = circleMagenta0.x;
  segment1.point0.y = circleMagenta0.y;
  segment1.point1.x = circleMagenta1.x;
  segment1.point1.y = circleMagenta1.y;

  segment2.point0.x = circleYellow0.x;
  segment2.point0.y = circleYellow0.y;
  segment2.point1.x = circleYellow1.x;
  segment2.point1.y = circleYellow1.y;

  segment3.point0.x = circleGreen0.x;
  segment3.point0.y = circleGreen0.y;
  segment3.point1.x = circleGreen1.x;
  segment3.point1.y = circleGreen1.y;

  segment4.point0.x = circlePinkRed0.x;
  segment4.point0.y = circlePinkRed0.y;
  segment4.point1.x = circlePinkRed1.x;
  segment4.point1.y = circlePinkRed1.y;

  segment5.point0.x = circleLilac0.x;
  segment5.point0.y = circleLilac0.y;
  segment5.point1.x = circleLilac1.x;
  segment5.point1.y = circleLilac1.y;

  segment6.point0.x = circleBlue0.x;
  segment6.point0.y = circleBlue0.y;
  segment6.point1.x = circleBlue1.x;
  segment6.point1.y = circleBlue1.y;

  segment7.point0.x = circleOrange0.x;
  segment7.point0.y = circleOrange0.y;
  segment7.point1.x = circleOrange1.x;
  segment7.point1.y = circleOrange1.y;


/////////////////////////////////////////
//// Display Angles and Lines Length ////
/////////////////////////////////////////

  document.getElementById("value").innerHTML = 
  "Cyan Line Length: " + (lineDistance(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y)).toFixed(0) 
  + "&emsp; Cyan-Magenta Angle (v0,v3): " 
  + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)

  + "<br><br>"
  + "Magenta Line Length: " + (lineDistance(segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0) 
  + "&emsp; Magenta-Yellow Angle (v2,v5): " 
  + (angle(segment1.point1.x, segment1.point1.y, segment1.point0.x, segment1.point0.y, segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)

  + "<br><br>"
  + "Yellow Line Length: " + (lineDistance(segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0) 
  + "&emsp; Yellow-Green Angle (v4,v7): " 
  + (angle(segment2.point1.x, segment2.point1.y, segment2.point0.x, segment2.point0.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)

  + "<br><br>"
  + "Green Line Length: " + (lineDistance(segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0) 
  + "&emsp; Green-Cyan Angle (v0,v6): " 
  + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)

  + "<br><br>"
  + "PinkRed Line Length: " + (lineDistance(segment4.point0.x, segment4.point0.y, segment4.point1.x, segment4.point1.y)).toFixed(0)
  + "<br><br>" 
  + "Lilac Line Length: " + (lineDistance(segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0) 
  + "&emsp; PinkRed-Lilac Angle (v8,v11): " 
  + (angle(segment4.point1.x, segment4.point1.y, segment4.point0.x, segment4.point0.y, segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)

  + "<br><br>"
  + "Blue Line Length: " + (lineDistance(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)
  + "&emsp; Blue Line Angle (v12,v13): " 
  + (angleSingleLine(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)
  
  + "<br><br>" 
  + "Orange Line Length: " + (lineDistance(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)
  + "&emsp; Orange Line Angle (v14,v15): " 
  + (angleSingleLine(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0);
  

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  var gap = 48;
  var columns = Math.ceil(context.canvas.width / gap);
  var rows = Math.ceil(context.canvas.height / gap);
  var offset_x = Math.round((context.canvas.width - columns * gap) * 0.5);
  var offset_y = Math.round((context.canvas.height - rows * gap) * 0.5);

  for (let index = columns * rows; index > -1; --index) {

    let row = Math.floor(index / columns);
    let column = index % columns;
    let x = column * gap + offset_x;
    let y = row * gap + offset_y;

    context.fillRect(x, y, gap, gap);

  }

  if ((img.width >= 1920 && img.width < 3840) || (img.height >= 1080 && img.height < 2160)) {
    context.canvas.height = img.height * 0.5;
    context.canvas.width = img.width * 0.5;
    context.drawImage(img, 0, 0, img.width * 0.5, img.height * 0.5);

    drawSegment(this.segment0, "#00FFFF", 4);
    drawCircle(this.circleCyan0, "#00FFFF", 0);
    drawCircle(this.circleCyan1, "#00FFFF", 0);

    drawSegment(this.segment1, "#FF00FF", 4);
    drawCircle(this.circleMagenta0, "#FF00FF", 0);
    drawCircle(this.circleMagenta1, "#FF00FF", 0);

    drawSegment(this.segment2, "#FFFF00", 4);
    drawCircle(this.circleYellow0, "#FFFF00", 0);
    drawCircle(this.circleYellow1, "#FFFF00", 0);

    drawSegment(this.segment3, "#39FF14", 4);
    drawCircle(this.circleGreen0, "#39FF14", 0);
    drawCircle(this.circleGreen1, "#39FF14", 0);

    drawSegment(this.segment4, "#FF0039", 4);
    drawCircle(this.circlePinkRed0, "#FF0039", 0);
    drawCircle(this.circlePinkRed1, "#FF0039", 0);

    drawSegment(this.segment5, "#E3CCFF", 4);
    drawCircle(this.circleLilac0, "#E3CCFF", 0);
    drawCircle(this.circleLilac1, "#E3CCFF", 0);

    drawSegment(this.segment6, "#0000FF", 4);
    drawCircle(this.circleBlue0, "#0000FF", 0);
    drawCircle(this.circleBlue1, "#0000FF", 0);

    drawSegment(this.segment7, "#FF4700", 4);
    drawCircle(this.circleOrange0, "#FF4700", 0);
    drawCircle(this.circleOrange1, "#FF4700", 0);

    context.fillStyle = "#FFFFFF";
    context.font = "16px Arial";
    context.fillText("v0 ( " + segment0.point0.x + ", " + segment0.point0.y + " )", circleCyan0.x, circleCyan0.y);
    context.fillText("v1 ( " + segment0.point1.x + ", " + segment0.point1.y + " )", circleCyan1.x, circleCyan1.y);

    context.fillText("v2 ( " + segment1.point0.x + ", " + segment1.point0.y + " )", circleMagenta0.x, circleMagenta0.y);
    context.fillText("v3 ( " + segment1.point1.x + ", " + segment1.point1.y + " )", circleMagenta1.x, circleMagenta1.y);

    context.fillText("v4 ( " + segment2.point0.x + ", " + segment2.point0.y + " )", circleYellow0.x, circleYellow0.y);
    context.fillText("v5 ( " + segment2.point1.x + ", " + segment2.point1.y + " )", circleYellow1.x, circleYellow1.y);

    context.fillText("v6 ( " + segment3.point0.x + ", " + segment3.point0.y + " )", circleGreen0.x, circleGreen0.y);
    context.fillText("v7 ( " + segment3.point1.x + ", " + segment3.point1.y + " )", circleGreen1.x, circleGreen1.y);

    context.fillText("v8 ( " + segment4.point0.x + ", " + segment4.point0.y + " )", circlePinkRed0.x, circlePinkRed0.y);
    context.fillText("v9 ( " + segment4.point1.x + ", " + segment4.point1.y + " )", circlePinkRed1.x, circlePinkRed1.y);

    context.fillText("v10 ( " + segment5.point0.x + ", " + segment5.point0.y + " )", circleLilac0.x, circleLilac0.y);
    context.fillText("v11 ( " + segment5.point1.x + ", " + segment5.point1.y + " )", circleLilac1.x, circleLilac1.y);

    context.fillText("v12 ( " + segment6.point0.x + ", " + segment6.point0.y + " )", circleBlue0.x, circleBlue0.y);
    context.fillText("v13 ( " + segment6.point1.x + ", " + segment6.point1.y + " )", circleBlue1.x, circleBlue1.y);

    context.fillText("v14 ( " + segment7.point0.x + ", " + segment7.point0.y + " )", circleOrange0.x, circleOrange0.y);
    context.fillText("v15 ( " + segment7.point1.x + ", " + segment7.point1.y + " )", circleOrange1.x, circleOrange1.y);


    context.fillStyle = "black";
    context.fillRect(5, 5, 355, 160);
    
    
    context.font = "12px Arial"
    context.fillStyle = "#00FFFF";
    context.fillText(("Cyan Line Length: " + (lineDistance(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y)).toFixed(0)), 10, 20);
    
    context.fillStyle = "#FF00FF";
    context.fillText(("Magenta Line Length: " + (lineDistance(segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)), 10, 40);

    context.fillStyle = "#FFFF00";
    context.fillText(("Yellow Line Length: " + (lineDistance(segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)), 10, 60);

    context.fillStyle = "#39FF14";
    context.fillText(("Green Line Length: " + (lineDistance(segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 10, 80);

    context.fillStyle = "#FF0039";
    context.fillText(("PinkRed Line Length: " + (lineDistance(segment4.point0.x, segment4.point0.y, segment4.point1.x, segment4.point1.y)).toFixed(0)), 10, 100);

    context.fillStyle = "#E3CCFF";
    context.fillText(("Lilac Line Length: " + (lineDistance(segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)), 10, 120);

    context.fillStyle = "#0000FF";
    context.fillText(("Blue Line Length: " + (lineDistance(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)), 10, 140);

    context.fillStyle = "#FF4700";
    context.fillText(("Orange Line Length: " + (lineDistance(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)), 10, 160);


    context.font = "12px Arial"
    context.fillStyle = "#FFFFFF";
    context.fillText(("Cyan-Magenta Angle (v0,v3): " 
    + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)), 170, 20);

    context.fillText(("Magenta-Yellow Angle (v2,v5): " 
    + (angle(segment1.point1.x, segment1.point1.y, segment1.point0.x, segment1.point0.y, segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)), 170, 40);

    context.fillText(("Yellow-Green Angle (v4,v7): " 
    + (angle(segment2.point1.x, segment2.point1.y, segment2.point0.x, segment2.point0.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 170, 60);
    
    context.fillText(("Green-Cyan Angle (v0,v6): " 
    + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 170, 80);

    context.fillText(("PinkRed-Lilac Angle (v8,v11): " 
    + (angle(segment4.point1.x, segment4.point1.y, segment4.point0.x, segment4.point0.y, segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)), 170, 100);

    context.fillStyle = "#0000FF";
    context.fillText(("Blue Line Angle (v12,v13): " 
    + (angleSingleLine(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)), 170, 120);

    context.fillStyle = "#FF4700";
    context.fillText(("Blue Line Angle (v12,v13): " 
    + (angleSingleLine(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)), 170, 140);
  }

  else if (img.width >= 3840 || img.height >= 2160) {
    context.canvas.height = img.height * 0.2;
    context.canvas.width = img.width * 0.2;
    context.drawImage(img, 0, 0, img.width * 0.2, img.height * 0.2);

    drawSegment(this.segment0, "#00FFFF", 4);
    drawCircle(this.circleCyan0, "#00FFFF", 0);
    drawCircle(this.circleCyan1, "#00FFFF", 0);

    drawSegment(this.segment1, "#FF00FF", 4);
    drawCircle(this.circleMagenta0, "#FF00FF", 0);
    drawCircle(this.circleMagenta1, "#FF00FF", 0);

    drawSegment(this.segment2, "#FFFF00", 4);
    drawCircle(this.circleYellow0, "#FFFF00", 0);
    drawCircle(this.circleYellow1, "#FFFF00", 0);

    drawSegment(this.segment3, "#39FF14", 4);
    drawCircle(this.circleGreen0, "#39FF14", 0);
    drawCircle(this.circleGreen1, "#39FF14", 0);

    drawSegment(this.segment4, "#FF0039", 4);
    drawCircle(this.circlePinkRed0, "#FF0039", 0);
    drawCircle(this.circlePinkRed1, "#FF0039", 0);

    drawSegment(this.segment5, "#E3CCFF", 4);
    drawCircle(this.circleLilac0, "#E3CCFF", 0);
    drawCircle(this.circleLilac1, "#E3CCFF", 0);

    drawSegment(this.segment6, "#0000FF", 4);
    drawCircle(this.circleBlue0, "#0000FF", 0);
    drawCircle(this.circleBlue1, "#0000FF", 0);

    drawSegment(this.segment7, "#FF4700", 4);
    drawCircle(this.circleOrange0, "#FF4700", 0);
    drawCircle(this.circleOrange1, "#FF4700", 0);

    context.fillStyle = "#FFFFFF";
    context.font = "16px Arial";
    context.fillText("v0 ( " + segment0.point0.x + ", " + segment0.point0.y + " )", circleCyan0.x, circleCyan0.y);
    context.fillText("v1 ( " + segment0.point1.x + ", " + segment0.point1.y + " )", circleCyan1.x, circleCyan1.y);

    context.fillText("v2 ( " + segment1.point0.x + ", " + segment1.point0.y + " )", circleMagenta0.x, circleMagenta0.y);
    context.fillText("v3 ( " + segment1.point1.x + ", " + segment1.point1.y + " )", circleMagenta1.x, circleMagenta1.y);

    context.fillText("v4 ( " + segment2.point0.x + ", " + segment2.point0.y + " )", circleYellow0.x, circleYellow0.y);
    context.fillText("v5 ( " + segment2.point1.x + ", " + segment2.point1.y + " )", circleYellow1.x, circleYellow1.y);

    context.fillText("v6 ( " + segment3.point0.x + ", " + segment3.point0.y + " )", circleGreen0.x, circleGreen0.y);
    context.fillText("v7 ( " + segment3.point1.x + ", " + segment3.point1.y + " )", circleGreen1.x, circleGreen1.y);

    context.fillText("v8 ( " + segment4.point0.x + ", " + segment4.point0.y + " )", circlePinkRed0.x, circlePinkRed0.y);
    context.fillText("v9 ( " + segment4.point1.x + ", " + segment4.point1.y + " )", circlePinkRed1.x, circlePinkRed1.y);

    context.fillText("v10 ( " + segment5.point0.x + ", " + segment5.point0.y + " )", circleLilac0.x, circleLilac0.y);
    context.fillText("v11 ( " + segment5.point1.x + ", " + segment5.point1.y + " )", circleLilac1.x, circleLilac1.y);

    context.fillText("v12 ( " + segment6.point0.x + ", " + segment6.point0.y + " )", circleBlue0.x, circleBlue0.y);
    context.fillText("v13 ( " + segment6.point1.x + ", " + segment6.point1.y + " )", circleBlue1.x, circleBlue1.y);

    context.fillText("v14 ( " + segment7.point0.x + ", " + segment7.point0.y + " )", circleOrange0.x, circleOrange0.y);
    context.fillText("v15 ( " + segment7.point1.x + ", " + segment7.point1.y + " )", circleOrange1.x, circleOrange1.y);


    context.fillStyle = "black";
    context.fillRect(5, 5, 355, 160);
    
    
    context.font = "12px Arial"
    context.fillStyle = "#00FFFF";
    context.fillText(("Cyan Line Length: " + (lineDistance(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y)).toFixed(0)), 10, 20);
    
    context.fillStyle = "#FF00FF";
    context.fillText(("Magenta Line Length: " + (lineDistance(segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)), 10, 40);

    context.fillStyle = "#FFFF00";
    context.fillText(("Yellow Line Length: " + (lineDistance(segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)), 10, 60);

    context.fillStyle = "#39FF14";
    context.fillText(("Green Line Length: " + (lineDistance(segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 10, 80);

    context.fillStyle = "#FF0039";
    context.fillText(("PinkRed Line Length: " + (lineDistance(segment4.point0.x, segment4.point0.y, segment4.point1.x, segment4.point1.y)).toFixed(0)), 10, 100);

    context.fillStyle = "#E3CCFF";
    context.fillText(("Lilac Line Length: " + (lineDistance(segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)), 10, 120);

    context.fillStyle = "#0000FF";
    context.fillText(("Blue Line Length: " + (lineDistance(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)), 10, 140);

    context.fillStyle = "#FF4700";
    context.fillText(("Orange Line Length: " + (lineDistance(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)), 10, 160);


    context.font = "12px Arial"
    context.fillStyle = "#FFFFFF";
    context.fillText(("Cyan-Magenta Angle (v0,v3): " 
    + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)), 170, 20);

    context.fillText(("Magenta-Yellow Angle (v2,v5): " 
    + (angle(segment1.point1.x, segment1.point1.y, segment1.point0.x, segment1.point0.y, segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)), 170, 40);

    context.fillText(("Yellow-Green Angle (v4,v7): " 
    + (angle(segment2.point1.x, segment2.point1.y, segment2.point0.x, segment2.point0.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 170, 60);
    
    context.fillText(("Green-Cyan Angle (v0,v6): " 
    + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 170, 80);

    context.fillText(("PinkRed-Lilac Angle (v8,v11): " 
    + (angle(segment4.point1.x, segment4.point1.y, segment4.point0.x, segment4.point0.y, segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)), 170, 100);

    context.fillStyle = "#0000FF";
    context.fillText(("Blue Line Angle (v12,v13): " 
    + (angleSingleLine(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)), 170, 120);

    context.fillStyle = "#FF4700";
    context.fillText(("Blue Line Angle (v12,v13): " 
    + (angleSingleLine(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)), 170, 140);
  }

  else {
    context.canvas.height = img.height;
    context.canvas.width = img.width;
    context.drawImage(img, 0, 0);

    drawSegment(this.segment0, "#00FFFF", 4);
    drawCircle(this.circleCyan0, "#00FFFF", 0);
    drawCircle(this.circleCyan1, "#00FFFF", 0);

    drawSegment(this.segment1, "#FF00FF", 4);
    drawCircle(this.circleMagenta0, "#FF00FF", 0);
    drawCircle(this.circleMagenta1, "#FF00FF", 0);

    drawSegment(this.segment2, "#FFFF00", 4);
    drawCircle(this.circleYellow0, "#FFFF00", 0);
    drawCircle(this.circleYellow1, "#FFFF00", 0);

    drawSegment(this.segment3, "#39FF14", 4);
    drawCircle(this.circleGreen0, "#39FF14", 0);
    drawCircle(this.circleGreen1, "#39FF14", 0);

    drawSegment(this.segment4, "#FF0039", 4);
    drawCircle(this.circlePinkRed0, "#FF0039", 0);
    drawCircle(this.circlePinkRed1, "#FF0039", 0);

    drawSegment(this.segment5, "#E3CCFF", 4);
    drawCircle(this.circleLilac0, "#E3CCFF", 0);
    drawCircle(this.circleLilac1, "#E3CCFF", 0);

    drawSegment(this.segment6, "#0000FF", 4);
    drawCircle(this.circleBlue0, "#0000FF", 0);
    drawCircle(this.circleBlue1, "#0000FF", 0);

    drawSegment(this.segment7, "#FF4700", 4);
    drawCircle(this.circleOrange0, "#FF4700", 0);
    drawCircle(this.circleOrange1, "#FF4700", 0);

    context.fillStyle = "#FFFFFF";
    context.font = "16px Arial";
    context.fillText("v0 ( " + segment0.point0.x + ", " + segment0.point0.y + " )", circleCyan0.x, circleCyan0.y);
    context.fillText("v1 ( " + segment0.point1.x + ", " + segment0.point1.y + " )", circleCyan1.x, circleCyan1.y);

    context.fillText("v2 ( " + segment1.point0.x + ", " + segment1.point0.y + " )", circleMagenta0.x, circleMagenta0.y);
    context.fillText("v3 ( " + segment1.point1.x + ", " + segment1.point1.y + " )", circleMagenta1.x, circleMagenta1.y);

    context.fillText("v4 ( " + segment2.point0.x + ", " + segment2.point0.y + " )", circleYellow0.x, circleYellow0.y);
    context.fillText("v5 ( " + segment2.point1.x + ", " + segment2.point1.y + " )", circleYellow1.x, circleYellow1.y);

    context.fillText("v6 ( " + segment3.point0.x + ", " + segment3.point0.y + " )", circleGreen0.x, circleGreen0.y);
    context.fillText("v7 ( " + segment3.point1.x + ", " + segment3.point1.y + " )", circleGreen1.x, circleGreen1.y);

    context.fillText("v8 ( " + segment4.point0.x + ", " + segment4.point0.y + " )", circlePinkRed0.x, circlePinkRed0.y);
    context.fillText("v9 ( " + segment4.point1.x + ", " + segment4.point1.y + " )", circlePinkRed1.x, circlePinkRed1.y);

    context.fillText("v10 ( " + segment5.point0.x + ", " + segment5.point0.y + " )", circleLilac0.x, circleLilac0.y);
    context.fillText("v11 ( " + segment5.point1.x + ", " + segment5.point1.y + " )", circleLilac1.x, circleLilac1.y);

    context.fillText("v12 ( " + segment6.point0.x + ", " + segment6.point0.y + " )", circleBlue0.x, circleBlue0.y);
    context.fillText("v13 ( " + segment6.point1.x + ", " + segment6.point1.y + " )", circleBlue1.x, circleBlue1.y);

    context.fillText("v14 ( " + segment7.point0.x + ", " + segment7.point0.y + " )", circleOrange0.x, circleOrange0.y);
    context.fillText("v15 ( " + segment7.point1.x + ", " + segment7.point1.y + " )", circleOrange1.x, circleOrange1.y);


    context.fillStyle = "black";
    context.fillRect(5, 5, 355, 160);
    
    
    context.font = "12px Arial"
    context.fillStyle = "#00FFFF";
    context.fillText(("Cyan Line Length: " + (lineDistance(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y)).toFixed(0)), 10, 20);
    
    context.fillStyle = "#FF00FF";
    context.fillText(("Magenta Line Length: " + (lineDistance(segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)), 10, 40);

    context.fillStyle = "#FFFF00";
    context.fillText(("Yellow Line Length: " + (lineDistance(segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)), 10, 60);

    context.fillStyle = "#39FF14";
    context.fillText(("Green Line Length: " + (lineDistance(segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 10, 80);

    context.fillStyle = "#FF0039";
    context.fillText(("PinkRed Line Length: " + (lineDistance(segment4.point0.x, segment4.point0.y, segment4.point1.x, segment4.point1.y)).toFixed(0)), 10, 100);

    context.fillStyle = "#E3CCFF";
    context.fillText(("Lilac Line Length: " + (lineDistance(segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)), 10, 120);

    context.fillStyle = "#0000FF";
    context.fillText(("Blue Line Length: " + (lineDistance(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)), 10, 140);

    context.fillStyle = "#FF4700";
    context.fillText(("Orange Line Length: " + (lineDistance(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)), 10, 160);


    context.font = "12px Arial"
    context.fillStyle = "#FFFFFF";
    context.fillText(("Cyan-Magenta Angle (v0,v3): " 
    + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment1.point0.x, segment1.point0.y, segment1.point1.x, segment1.point1.y)).toFixed(0)), 170, 20);

    context.fillText(("Magenta-Yellow Angle (v2,v5): " 
    + (angle(segment1.point1.x, segment1.point1.y, segment1.point0.x, segment1.point0.y, segment2.point0.x, segment2.point0.y, segment2.point1.x, segment2.point1.y)).toFixed(0)), 170, 40);

    context.fillText(("Yellow-Green Angle (v4,v7): " 
    + (angle(segment2.point1.x, segment2.point1.y, segment2.point0.x, segment2.point0.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 170, 60);
    
    context.fillText(("Green-Cyan Angle (v0,v6): " 
    + (angle(segment0.point0.x, segment0.point0.y, segment0.point1.x, segment0.point1.y, segment3.point0.x, segment3.point0.y, segment3.point1.x, segment3.point1.y)).toFixed(0)), 170, 80);

    context.fillText(("PinkRed-Lilac Angle (v8,v11): " 
    + (angle(segment4.point1.x, segment4.point1.y, segment4.point0.x, segment4.point0.y, segment5.point0.x, segment5.point0.y, segment5.point1.x, segment5.point1.y)).toFixed(0)), 170, 100);

    context.fillStyle = "#0000FF";
    context.fillText(("Blue Line Angle (v12,v13): " 
    + (angleSingleLine(segment6.point0.x, segment6.point0.y, segment6.point1.x, segment6.point1.y)).toFixed(0)), 170, 120);

    context.fillStyle = "#FF4700";
    context.fillText(("Blue Line Angle (v12,v13): " 
    + (angleSingleLine(segment7.point0.x, segment7.point0.y, segment7.point1.x, segment7.point1.y)).toFixed(0)), 170, 140);
  }
}

/////////////////////////
//// Event Listeners ////
/////////////////////////

function clickTouchStart(event) {

  event.preventDefault();

  vector_math = window[this.dataset.function];

}

function mouseDownMoveUp(event) {

  event.preventDefault();

  var rectangle = context.canvas.getBoundingClientRect();

  pointer.x = event.clientX - rectangle.left;
  pointer.y = event.clientY - rectangle.top;

  if (event.type == "mousedown") pointer.down = true;
  else if (event.type == "mouseup") pointer.down = false;

}

function resize(event) {
  context.imageSmoothingEnabled = false;

  segment0.moveTo(Math.round(context.canvas.width * 0.5), Math.round(context.canvas.height * 0.5));
  circleCyan0.moveTo(segment0.point0.x, segment0.point0.y);
  circleCyan1.moveTo(segment0.point1.x, segment0.point1.y);
  
  segment1.moveTo(segment0.x, segment0.y);
  circleMagenta0.moveTo(segment1.point0.x, segment1.point0.y);
  circleMagenta1.moveTo(segment1.point1.x, segment1.point1.y);

  segment2.moveTo(segment1.x, segment1.y);
  circleYellow0.moveTo(segment2.point0.x, segment2.point0.y);
  circleYellow1.moveTo(segment2.point1.x, segment2.point1.y);

  segment3.moveTo(segment2.x, segment2.y);
  circleGreen0.moveTo(segment3.point0.x, segment3.point0.y);
  circleGreen1.moveTo(segment3.point1.x, segment3.point1.y);

  segment4.moveTo(segment3.x, segment3.y);
  circlePinkRed0.moveTo(segment4.point0.x, segment4.point0.y);
  circlePinkRed1.moveTo(segment4.point1.x, segment4.point1.y);

  segment5.moveTo(segment4.x, segment4.y);
  circleLilac0.moveTo(segment5.point0.x, segment5.point0.y);
  circleLilac1.moveTo(segment5.point1.x, segment5.point1.y);

  segment6.moveTo(segment5.x, segment5.y);
  circleBlue0.moveTo(segment6.point0.x, segment6.point0.y);
  circleBlue1.moveTo(segment6.point1.x, segment6.point1.y);

  segment7.moveTo(segment6.x, segment6.y);
  circleOrange0.moveTo(segment7.point0.x, segment7.point0.y);
  circleOrange1.moveTo(segment7.point1.x, segment7.point1.y);

}

function touchEndMoveStart(event) {

  event.preventDefault();

  var rectangle = context.canvas.getBoundingClientRect();

  if (event.type != "touchend") {
    pointer.down = true;
    pointer.x = event.touches[0].clientX - rectangle.left;
    pointer.y = event.touches[0].clientY - rectangle.top;
  } else pointer.down = false;

}

////////////////////
//// INITIALIZE ////
////////////////////

var links = document.querySelectorAll("a");

for (let index = links.length - 1; index > -1; --index) {

  let link = links[index];

  link.addEventListener("click", clickTouchStart);
  link.addEventListener("touchstart", clickTouchStart)

}

window.addEventListener("resize", resize);
window.addEventListener("mousedown", mouseDownMoveUp, { passive: false });
window.addEventListener("mousemove", mouseDownMoveUp, { passive: false });
window.addEventListener("mouseup", mouseDownMoveUp, { passive: false });
window.addEventListener("touchend", touchEndMoveStart, { passive: false });
window.addEventListener("touchmove", touchEndMoveStart, { passive: false });
window.addEventListener("touchstart", touchEndMoveStart, { passive: false });

resize();
loop();