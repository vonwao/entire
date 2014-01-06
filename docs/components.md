# Module Components

`Entire Modules` are comprised of one to three components:

## Styles

The `styles` component is a css file to be added to the compiled style sheet.

## Scripts

The `scripts` component is a client-side.js that will be wrapped in an iffe. Whatever is added to `modules.export` can be required by its decedents via require("module_name"); 

## Router

The `router` component is a node_modules which exports a function that accepts one argument, `app`.

```js
module.exports = function(app){
	app.get('/childPage', function*(){
		this.body = yield app.render('module_name/child');
	});

	app.hook('parent_module/index', function*(options){
		if(this.path=='/'){
			options.value = 'over ridden';
		}
	});
}
```

### app.[VERB](https://npmjs.org/package/methods)(path, fn);

Register a route for a particular http-verb.

* path: the path requested
* fn: a GeneratorFunction with the koa context that will be passed arguments corresponding to the named params of the matching path. If '/user/:user/name/:name/' is registered its corresponding middleware will be passed a `user` and a `name` argument.

### app.del(path, fn)

An alias for `app.delete`

### app.all(path, fn)

This route will be responded to despite the verb used to request it.

### app.render(path, options)

A yieldable object that renders a view from a particular `entire module`.

* path: view to render, {entire_module}/path/from/views
* options: object to be passed to the template.

### app.modify(path, fn)

Modify render options before they are passed to the template.

* path: view to modify, {entire_module}/path/from/views
* fn: a GeneratorFunction with the koa context that will be passed the options object to be modified.

