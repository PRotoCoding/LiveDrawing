var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
});

var message = "hello world";
console.log(message);
