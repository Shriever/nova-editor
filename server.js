const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path")
const webpack = require('webpack');
const config = require('./webpack.config.js');

require('dotenv').config()

const middleware = require('webpack-dev-middleware'); 
const compiler = webpack(config); 

app.use(middleware(compiler, {publicPath: config.output.publicPath}));

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(path.resolve(__dirname, "dist")));


//---------APP ROUTES---------

app.get('/test', (req, res) => {
    res.status(200).send("Request Received")
});



















//---------SOCKET EVENTS---------
io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});





















server.listen(process.env.SERVER_PORT, () => {
  console.log('listening on port ' + process.env.SERVER_PORT + "!");
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