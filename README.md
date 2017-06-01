# segments-cms

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
var express = require('express');
var path = require('path');
var cms = require('segments-cms');
var app = express();
var port = 3000;

var cmsSettings = {
    themeDir: path.join(__dirname + '/themes'),
    pluginDir: path.join(__dirname + '/plugins'),
    uploadDir: path.join(__dirname + '/uploads'),
}

app.use('/', cms(cmsSettings, app));

app.listen(port);

```

### The Install
Navigate to `localhost:7367/install`.
