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
    userName;
    drawingStepNumber;

    constructor(posX, posY, userName, drawingStepNumber, lineWidth = 10, lineCap = "butt", strokeStyle = "black") {
        this.posX = posX;
        this.posY = posY;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.strokeStyle = strokeStyle;
        this.userName = userName;
        this.drawingStepNumber = drawingStepNumber;
    }

    get posX() {
        return this.posX;
    }

    get posY() {
        return this.posY;
    }

    get userName() {
        return this.userName;
    }

    get drawingStepNumber() {
        return this.drawingStepNumber;
    }

    SendToClient (socket) {
        socket.emit('new dot', this.posX, this.posY, this.strokeStyle, this.lineWidth);
    }
    SendToAllClients (io) {
        io.emit('new dot', this.posX, this.posY, this.strokeStyle, this.lineWidth);
    }
}

class DrawingStepLine extends DrawingStep {
    lastX = 0;
    lastY = 0;

    constructor(lastX, lastY, posX, posY, userName, drawingStepNumber,  lineWidth = 10, lineCap = "butt", strokeStyle = "black") {
        super(posX,posY,userName,drawingStepNumber,lineWidth,lineCap,strokeStyle);
        this.lastX = lastX;
        this.lastY = lastY;
    }

    SendToClient (socket) {
        socket.emit('new line', this.lastX, this.lastY, this.posX, this.posY, this.strokeStyle, this.lineWidth);
    }

    SendToAllClients (io) {
        io.emit('new line', this.lastX, this.lastY, this.posX, this.posY, this.strokeStyle, this.lineWidth);
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
    var userName;
    //console.log('Ein neuer Nutzer hat den Server betreten.');
    
    socket.on('disconnect', function() {
        if(userName == null) {

        } else {
            console.log(userName, 'has left.');
            io.emit('user leave', userName);
        }
        
    });
    socket.on('chat message', function(msg) {
        console.log(userName, ": ", msg);
        if(msg !== "") {
            io.emit('chat message', userName, msg);
        }
    });
    socket.on('line added', function(lastX, lastY, xPos, yPos, drawingStepNumber,strokeStyle, lineWidth) {
        DrawingStack.push(new DrawingStepLine(lastX,lastY,xPos,yPos,userName,drawingStepNumber,lineWidth,"butt",strokeStyle));
        console.log('Line was added. User: ', userName, ' Num: ', drawingStepNumber, ' Width: ', lineWidth, ' Drawing Stack: ', DrawingStack.length);
        io.emit('new line', lastX, lastY, xPos, yPos, strokeStyle, lineWidth);
    });
    socket.on('dot added', function(xPos,yPos,drawingStepNumber,strokeStyle, lineWidth) {
        DrawingStack.push(new DrawingStep(xPos,yPos,userName,drawingStepNumber,lineWidth,"butt",strokeStyle));
        console.log('Dot was added. User: ', userName, ' Num: ', drawingStepNumber, ' Width: ', lineWidth, ' Drawing Stack: ', DrawingStack.length);
        io.emit('new dot', xPos, yPos, strokeStyle, lineWidth);
    })
    socket.on('request drawing data', function() {
        DrawingStack.forEach(element => {
            element.SendToClient(socket);
        });
        socket.emit('drawing data end');
    });
    socket.on('permission request', function(nm) {
        userName = nm;
        console.log('"', userName, '" hat den Server betreten.');
        socket.emit('permission received');
        io.emit('user join', userName);
    });
    socket.on('undo request', function(number) {
        io.emit('clear permitted');
        var i = 0;
        while(i < DrawingStack.length) {
            if(DrawingStack[i].userName === userName && DrawingStack[i].drawingStepNumber === number) {
                DrawingStack.splice(i, 1);
            }
            else
            {
                DrawingStack[i].SendToAllClients(io);
                i = i + 1;
            }
        }
    });

    socket.on('clear request', function(password) {
        if(password === 'clear') {
            DrawingStack.splice(0, DrawingStack.length);
            io.emit('clear permitted');
        }
    });
});

var message = "hello world";
console.log(message);
