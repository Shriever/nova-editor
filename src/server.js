const express = require("express");
//const webpack = require("webpack");
//const webpackDevMiddleware = require("webpack-dev-middleware");
//const webpackHotMiddleware = require("webpack-hot-middleware");
//const historyApiFallback = require("connect-history-api-fallback");
const path = require("path");

let {PythonShell} = require('python-shell')
const fs = require("fs")
var cors = require('cors');

const app = express();

// create application/json parser
app.use(express.json())
app.use(express.urlencoded({
    extended: true
  }));

//app.use(cors({origin: 'http://localhost:8080'}));



/*const config = require("./webpack.config.js");
const compiler = webpack(config);
const instance = webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
});*/

//.env file load
//require("dotenv").config();

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
//NOTE: Need two use calls to instance, otherwise routes won't work
//app.use(instance);
//app.use(historyApiFallback());
//app.use(instance);

//enable hot middleware
//app.use(webpackHotMiddleware(compiler));
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
});