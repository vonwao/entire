# Featurlets

Build features for your websites like you build modules for node!

## Install

`npm install https://github.com/mcwhittemore/featurlets/tarball/master`

## KOA Setup

```js
var koa = require('koa');
var app = koa();
var path = require("path");

var featurlets = require("featurlets");

app.use(featurlets({
	"folder": path.join(__dirname, "features")
}).all);


app.listen(3000);
```

## Features

The main brain of featurlets are the features. All features must be in a single feature folder which is passed to featurlets via the folder attribute of the featurlets opts param.

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

By default featurlets lets all users access all features, but this isn't always wanted.

Permissions in featurlets is controlled by the this.permission param of the koa context. To set this add a peice of custom middleware that sets the permission of the user and than yields next.

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

Then, when setting up your featurlets middleware, add a permissions attribute to the opts arg. This permissions arg is a KVP where the key is a permission name and the value is an array of feature that permission can acceess.

```js
app.use(featurlets({
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