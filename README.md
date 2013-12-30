# Entire

Build features for your websites like you build modules for node!

## Install

`npm install https://github.com/entirejs/entire/tarball/master`

## KOA Setup

```js
var koa = require('koa');
var app = koa();
var path = require("path");

var entire = require("entire");

app.use(entire({
	"folder": path.join(__dirname, "features")
}).all);


app.listen(3000);
```

## Running

`node --version` -> 0.11.9

`PATH=path/to/custom/modules/folder node --harmony app.js`

## Features

The main brain of entire are the features. All features must be in a single feature folder which is passed to entire via the folder attribute of the entire opts param.

A feature must be a folder and that folder must contain a feature.json file. Here is an example.

```json
{
	"name": "index",
	"router": "node.js",
	"styles": "style.css",
	"scripts": "script.js"
}
```

### Feature: Router

The Router is a node module that exports a function which takes one argument, a router.

```js
module.exports = function(app){
	app.get("/user/:id", function(id){
		this.body = "The user id is: "+id;
	});
}
```

### Feature: Styles

This is a basic css file.

### Features: Scripts

Comming Soon.

## Adding Permissions

By default entire lets all users access all features, but this isn't always wanted.

Permissions in entire is controlled by the this.permission param of the koa context. To set this add a peice of custom middleware that sets the permission of the user and than yields next.

```js
app.use(function *(next){
	if(/\/styled\//.test(this.path)){
		this.permission = "styled";
		this.path = this.path.replace("/styled", "");
	}
	else{
		this.permission = "boring";
	}
	yield next;
});
```

Then, when setting up your entire middleware, add a permissions attribute to the opts arg. This permissions arg is a KVP where the key is a permission name and the value is an array of feature that permission can acceess.

```js
app.use(entire({
	"permissions": {
		"boring": [
			"index"
		],
		"styled": [
			"style"
		]
	},
	"folder": path.join(__dirname, "features")
}).all);
```