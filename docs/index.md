# Middleware

`Entire` is a collection of Koa middleware enabling the registration of routes,
serving of client side code and providing access control. Because of this it is required
you're app is running ES6 and is created via [Koa](http://koajs.com/).

```js
var koa = require('koa');
var app = koa();
var entire = require('entire');

app.use(entire());

app.listen(3000);
```

## Collected Middleware

Entire is built up of a collection of middleware registered with Koa in one line. Here is an overview.

1. **router**: this will respond to all routes registered in the router components of your modules.
2. **scripts server**: this will serve the compiled scripts when /scripts.js or a custom path is requested.
3. **styles server**: this will serve the result when /scripts.css or a custom path is requested.
4. **static server**: this will serve files from modules public folder where the first element of the requested path is the modules name and the following elements are the path from the modules public folder. eg. requesting **/base/logo.jpg** will load **entire_modues/base/public/logo.jpg**.

## Compiled Sources

Compilation is done when with the first request per permission type. After this the result is cached, to be quickly served. Files are compiled in order of heritage, so that modules with the fewest dependencies (ancestors) are at the top and the most dependencies are at the bottom.

1. **scripts compiler**: Compiles all client side js. When in development env, it will allow `require` to be added to the window.
2. **styles compiler**: Compile all style files.

## Entire Settings

The `Entire` constructor takes an optional options object argument.

* **folder**: A path to a folder containing all the `Entire Modules` to be registered with this middleware.
  * default: {process.cwd()}/entire_modules.
* **permissions**: A kvp of permission keys and permitted modules arrays or TRUE.
  * default: TRUE, all modules are available to all permissions.
  * note: dependencies of a module in the permitted modules array are automatically added to this array.
* **engine**: The rendering engine to use. For all available options see ____.
  * default: html.
* **scripts**: The path the scripts file will be requested on.
  * default: scripts.js
* **styles**: The path the styles file will be requested on.
  * default: styles.css

## Permissions

Permissions are essentially named collections of modules. Any dependencies of a module included in a permission set will also be included in said set. Access to these modules is enforced at the middleware level. Here is how the middleware enforces this.

* **router**: routes registered to modules outside the permission set will respond with a 401.
* **scripts**: scripts registered to modules outside the permission set will not be included in scripts.js.
* **styles**: styles registered to modules outside the permission set will not be included in styles.css.
* **static files**: static files registered to modules outside the permission set will respond with a 404.

## Request Permission

A request's permission is found on `this.permission` of the koa context. `this.permission` is not a default attribute of the koa context and must be added via middleware before `Entire` is added to the koa stack. If `this.permission` is not set and a permission object has been provided to `Entire` (exluding the default value of true) an "Unknown Permission" error will be thrown.
