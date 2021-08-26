const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path")

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.resolve(__dirname, "dist")));


app.get('/test', (req, res) => {
    res.status(200).send("Request Received")
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(5000, () => {
  console.log('listening on port 5000!');
});







/*const express = require("express");
const path = require("path");

let {PythonShell} = require('python-shell')
const fs = require("fs")

const app = express();

// create application/json parser
app.use(express.json())
app.use(express.urlencoded({
    extended: true
  }));


app.use(express.static(path.resolve(__dirname, "dist")));

app.post("/runCode", (req ,res) => {
    fs.writeFile("script.py", req.body.text, () => {

        const pyShell = new PythonShell("script.py");
        let output = "";
        pyShell.on('message', (message) => {
            output += message + "\n";
        })

        pyShell.end((err, code, signal) => {
            if(err) res.status(500).send(err)
            else{
                res.status(200).json({exitCode: code, exitSignal: signal, output: output})
            }
        })
    })
})

const port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log("Nova-Editor (React) listening on port " + port + "!\n");
});*/