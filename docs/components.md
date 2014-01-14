# Module Components

`Entire Modules` are comprised of one to three components:

## Styles

The `styles` component is a css file to be added to the compiled style sheet.

## Scripts

The `scripts` component is a client-side.js that will be wrapped in an iffe. Whatever is added to `modules.export` can be required by its decedents via require("module_name"); 

## Backend

The `backend` component is a node_modules which exports a function that accepts one argument, the [`entire_api`](#entire-api).

```js
module.exports = function(api){
	api.router.get('/childPage', function*(){
		this.body = yield api.render('module_name/child');
	});

	api.beforeRender('parent_module/index', function*(options){
		if(this.path=='/'){
			options.value = 'over ridden';
		}
	});
}
```

## Extends -- [very unstable](https://github.com/EntireJS/entire/issues/8)

This is how an `entire_module` tells entire which other `entire_modules` MUST be included in a permission set for it to work right.

