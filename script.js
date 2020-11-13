var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasOffset = $("#canvas").offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var storedLines = [];
var startX = 0;
var startY = 0;
var isDown;

var gradient = ctx.createLinearGradient(255, 0, 0, 255);
gradient.addColorStop("0", "magenta");
gradient.addColorStop("0.4" ,"blue");
gradient.addColorStop("0.6", "red");
gradient.addColorStop("0.8", "cyan");
gradient.addColorStop("1.0", "yellow");

ctx.strokeStyle = gradient;
ctx.lineWidth = 3;

const reader = new FileReader();
const img = new Image();

// load image
var uploadImage = (e) => {
    reader.onload = () => {
        img.onload = () => {
            if ((img.width >= 1920 && img.width < 3840) || (img.height >= 1080 && img.height < 2160)) {
                canvas.width = img.width * 0.5;
                canvas.height = img.height * 0.5;
                ctx.drawImage(img, 0, 0, img.width * 0.5, img.height * 0.5);

                var gradient = ctx.createLinearGradient(255, 0, 0, 255);
                gradient.addColorStop("0", "magenta");
                gradient.addColorStop("0.4" ,"blue");
                gradient.addColorStop("0.6", "red");
                gradient.addColorStop("0.8", "cyan");
                gradient.addColorStop("1.0", "yellow");
    
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
            }

            else if (img.width >= 3840 || img.height >= 2160) {
                canvas.width = img.width * 0.2;
                canvas.height = img.height * 0.2;
                ctx.drawImage(img, 0, 0, img.width * 0.2, img.height * 0.2);

                var gradient = ctx.createLinearGradient(255, 0, 0, 255);
                gradient.addColorStop("0", "magenta");
                gradient.addColorStop("0.4" ,"blue");
                gradient.addColorStop("0.6", "red");
                gradient.addColorStop("0.8", "cyan");
                gradient.addColorStop("1.0", "yellow");
    
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
            }
            
            else {    
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                var gradient = ctx.createLinearGradient(255, 0, 0, 255);
                gradient.addColorStop("0", "magenta");
                gradient.addColorStop("0.4" ,"blue");
                gradient.addColorStop("0.6", "red");
                gradient.addColorStop("0.8", "cyan");
                gradient.addColorStop("1.0", "yellow");

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
            }
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};
var imageLoader = document.getElementById('uploader');
imageLoader.addEventListener('change', uploadImage);


$("#canvas").mousedown(function (e) {
    handleMouseDown(e);
});
$("#canvas").mousemove(function (e) {
    handleMouseMove(e);
});
$("#canvas").mouseup(function (e) {
    handleMouseUp(e);
});
$("#canvas").mouseout(function (e) {
    handleMouseOut(e);
});

// erase canvas lines
$("#clear").click(function () {
    storedLines.length = 0;
    redrawStoredLines();
    document.getElementById("lineLength").innerHTML =  "Line Length: ";
    document.getElementById("lineAngle").innerHTML =  "Line Angle: ";
});

// download canvas image
$("#download").click(function () {
    const a = document.createElement("a");

    document.body.appendChild(a);
    a.href = canvas.toDataURL();
    a.download = "canvas.png";
    a.click();
    document.body.removeChild(a);
});

function handleMouseDown(e) {
    e.preventDefault();   
    e.stopPropagation();
    
    var mouseX = parseInt(e.pageX - offsetX);
    var mouseY = parseInt(e.pageY - offsetY);
    
    isDown = true;
    startX = mouseX;
    startY = mouseY;
    
}

function handleMouseMove(e) {
    e.preventDefault();   
    e.stopPropagation();
    
    if (!isDown) {
        return;
    }
    
    redrawStoredLines();
    
    var mouseX = parseInt(e.pageX - offsetX);
    var mouseY = parseInt(e.pageY - offsetY);
    
    // draw the current line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke()
    ctx.closePath();

    var dx = startX - mouseX;
    var dy = startY - mouseY;

    var theta = Math.atan2(-dy, -dx); // [0, Ⲡ] then [-Ⲡ, 0]; clockwise; 0° = east
    theta *= 180 / Math.PI;           // [0, 180] then [-180, 0]; clockwise; 0° = east
    if (theta < 0) theta += 360;      // [0, 360]; clockwise; 0° = east

    document.getElementById("lineAngle").innerHTML =  "Line Angle: " + (theta).toFixed(0) + "°";
}


function handleMouseUp(e) {
    e.preventDefault();   
    e.stopPropagation();
    
    isDown = false;
    
    var mouseX = parseInt(e.pageX - offsetX);
    var mouseY = parseInt(e.pageY - offsetY);
    
    storedLines.push({
        x1: startX,
        y1: startY,
        x2: mouseX,
        y2: mouseY
    });
    
    redrawStoredLines();
    
}

function handleMouseOut(e) {
    e.preventDefault();   
    e.stopPropagation();
    
    if(!isDown){return;}
    
    isDown = false;
    
    var mouseX = parseInt(e.pageX - offsetX);
    var mouseY = parseInt(e.pageY - offsetY);
    
    storedLines.push({
        x1: startX,
        y1: startY,
        x2: mouseX,
        y2: mouseY
    });
    
    redrawStoredLines();
    
}


function redrawStoredLines() {

    if ((img.width >= 1920 && img.width < 3840) || (img.height >= 1080 && img.height < 2160)) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = img.width * 0.5;
        canvas.height = img.height * 0.5;
        ctx.drawImage(img, 0, 0, img.width * 0.5, img.height * 0.5);

        var gradient = ctx.createLinearGradient(255, 0, 0, 255);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.4" ,"blue");
        gradient.addColorStop("0.6", "red");
        gradient.addColorStop("0.8", "cyan");
        gradient.addColorStop("1.0", "yellow");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;

        if (storedLines.length == 0) {
            return;
        }
        
        // redraw each stored line
        for (var i = 0; i < storedLines.length; i++) {
            ctx.beginPath();
            ctx.moveTo(storedLines[i].x1, storedLines[i].y1);
            ctx.lineTo(storedLines[i].x2, storedLines[i].y2);
            ctx.stroke();
            ctx.closePath();

            var xs = 0;
            var ys = 0;
        
            xs = storedLines[i].x2 - storedLines[i].x1;
            xs = xs * xs;
        
            ys = storedLines[i].y2 - storedLines[i].y1;
            ys = ys * ys;
        
            document.getElementById("lineLength").innerHTML =  "Line Length: " + (Math.sqrt( xs + ys ).toFixed(0) + " pixels");
        }
    }

    else if (img.width >= 3840 || img.height >= 2160) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = img.width * 0.2;
        canvas.height = img.height * 0.2;
        ctx.drawImage(img, 0, 0, img.width * 0.2, img.height * 0.2);

        var gradient = ctx.createLinearGradient(255, 0, 0, 255);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.4" ,"blue");
        gradient.addColorStop("0.6", "red");
        gradient.addColorStop("0.8", "cyan");
        gradient.addColorStop("1.0", "yellow");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;

        if (storedLines.length == 0) {
            return;
        }
        
        // redraw each stored line
        for (var i = 0; i < storedLines.length; i++) {
            ctx.beginPath();
            ctx.moveTo(storedLines[i].x1, storedLines[i].y1);
            ctx.lineTo(storedLines[i].x2, storedLines[i].y2);
            ctx.stroke();
            ctx.closePath();

            var xs = 0;
            var ys = 0;
        
            xs = storedLines[i].x2 - storedLines[i].x1;
            xs = xs * xs;
        
            ys = storedLines[i].y2 - storedLines[i].y1;
            ys = ys * ys;
        
            document.getElementById("lineLength").innerHTML =  "Line Length: " + (Math.sqrt( xs + ys ).toFixed(0) + " pixels");
        }
    }

    else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    if (storedLines.length == 0) {
        return;
    }
    
    // redraw each stored line
    for (var i = 0; i < storedLines.length; i++) {
        ctx.beginPath();
        ctx.moveTo(storedLines[i].x1, storedLines[i].y1);
        ctx.lineTo(storedLines[i].x2, storedLines[i].y2);
        ctx.stroke();
        ctx.closePath();

        var xs = 0;
        var ys = 0;
    
        xs = storedLines[i].x2 - storedLines[i].x1;
        xs = xs * xs;
    
        ys = storedLines[i].y2 - storedLines[i].y1;
        ys = ys * ys;
    
        document.getElementById("lineLength").innerHTML =  "Line Length: " + (Math.sqrt( xs + ys ).toFixed(0) + " pixels");
    }
}
}