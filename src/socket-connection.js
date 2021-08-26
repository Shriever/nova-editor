
var socket = io("localhost:5000", {transports: ['websocket'], upgrade: false});
console.log(socket)