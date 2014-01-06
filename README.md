# Entire

Build features for your websites like you build modules for node! [Click here for more detailed docs](http://entirejs.github.io/entirejs.com/)

## Install

`npm install https://github.com/entirejs/entire/tarball/master`

## KOA Setup

```js
var koa = require('koa');
var app = koa();
var path = require("path");

var entire = require("entire");

app.use(entire());

app.listen(3000);
```

## Simple Module

```txt
app.js
entire_modules
	simple_module
		package.json
		node.js
```

**package.json**

```json
{
 "name":"simple_module",
 "router": "./node.js"
}
```

**node.js**

```js
module.exports = function(app){
	app.get("/", function*(){
		this.body = "simple module";
	});
}
```

## Running

`node --version` -> 0.11.9

`PATH=path/to/custom/modules/folder node --harmony app.js`
