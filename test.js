var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

const dom = new JSDOM(`<!DOCTYPE html><body><canvas id="canvas"></canvas><p>Hello world</p></body>`);
console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
var canvas = dom.window.document.createElement('canvas');
canvas.id = "canvas";
canvas.width = 1224;
canvas.height = 768;
canvas.style.zIndex = 8;
canvas.style.position = "absolute";
canvas.style.border = "1px solid";


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
    socket.on('line added', function(xPos, yPos) {
        console.log('Line was added.');
        io.emit('new line', xPos, yPos);
    });
});

var message = "hello world";
console.log(message);
