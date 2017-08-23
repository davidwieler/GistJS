# Gist JS

### Requirements
* NodeJS 4.4+ . **Works best on NodeJS 7.6.**
* Express 4 framework
* MongoDB

## **NOTE**
This is a dev version that is currently an alpha.

Version 0.1 will soon be on NPM.

### How to install.

Clone/download this repo into your `node_modules` folder, `cd` into the directory and run `npm install`.

### Working server.js file.
```
const express = require('express');
const path = require('path');
const cms = require('gist-js');
const app = express();
const port = 3000;

const cmsSettings = {
    themeDir: path.join(__dirname + '/themes'),
    pluginDir: path.join(__dirname + '/plugins'),
    uploadDir: path.join(__dirname + '/uploads'),
	forceSSL: false,
	forceApiSSL: false
}

app.use('/', cms(cmsSettings, app));

// Handle system error 500's
app.use(function(error, req, res, next) {
    res.status(500).send('<h1>ERROR 500:</h1>Error loading services<br />'+error+'<br />'+error.stack);
});

app.listen(port);

```

### The Install
Navigate to `localhost:3000/`.
Which will launch the install process.
