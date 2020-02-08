var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const jsdom = require("jsdom");
const {JSDOM} = jsdom;


/*
const dom = new JSDOM(`<!DOCTYPE html><body><canvas id="canvas"></canvas><p>Hello world</p></body>`);
console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
var canvas = dom.window.document.createElement('canvas');
canvas.id = "canvas";
canvas.width = 1224;
canvas.height = 768;
canvas.style.zIndex = 8;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";
*/
const DrawingType = {Dot: 1, Line: 2};
class DrawingStep {
    lineWidth = 10;
    lineCap = "butt";
    strokeStyle = "black";
    posX = 0;
    posY = 0;

    constructor(posX, posY, lineWidth = 10, lineCap = "butt", strokeStyle = "black") {
        this.posX = posX;
        this.posY = posY;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.strokeStyle = strokeStyle;
    }

    get posX() {
        return this.posX;
    }

    get posY() {
        return this.posY;
    }

    SendToClient (socket) {
        socket.emit('new dot', this.posX, this.posY);
    }
}

class DrawingStepLine extends DrawingStep {
    lastX = 0;
    lastY = 0;

    constructor(lastX, lastY, posX, posY, lineWidth = 10, lineCap = "butt", strokeStyle = "black") {
        super(posX,posY,lineWidth,lineCap,strokeStyle);
        this.lastX = lastX;
        this.lastY = lastY;
    }

    SendToClient (socket) {
        socket.emit('new line', this.lastX, this.lastY, this.posX, this.posY);
    }
}

var DrawingStack = [];

http.listen(3000, function() {
    console.log('Server gestartet, listening on localhost:3000');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket, name) {
    console.log('Ein neuer Nutzer hat den Server betreten.');
    io.emit('user join', {for: 'everyone'});
    socket.on('disconnect', function() {
        console.log('Ein Nutzer hat den Server verlassen.');
        io.emit('user leave', {for: 'everyone'});
    });
    socket.on('chat message', function(msg) {
        console.log('Nachricht erhalten.');
        io.emit('chat message', msg);
    });
    socket.on('line added', function(lastX, lastY, xPos, yPos) {
        DrawingStack.push(new DrawingStepLine(lastX,lastY,xPos,yPos));
        console.log('Line was added. Drawing Stack: ', DrawingStack.length);
        io.emit('new line', lastX, lastY, xPos, yPos);
    });
    socket.on('dot added', function(xPos,yPos) {
        DrawingStack.push(new DrawingStep(xPos,yPos));
        console.log('Dot was added. Drawing Stack: ', DrawingStack.length);
        io.emit('new dot', xPos, yPos);
    })
    socket.on('request drawing data', function() {
        DrawingStack.forEach(element => {
            element.SendToClient(socket);
        });
        socket.emit('drawing data end');
    });
});

var message = "hello world";
console.log(message);
