# Entire Api

## api.router

### api.router.[VERB](https://npmjs.org/package/methods)(path, fn);

Register a route for a particular http-verb.

* path: the path requested
* fn: a GeneratorFunction with the koa context that will be passed arguments corresponding to the named params of the matching path. If '/user/:user/name/:name/' is registered its corresponding middleware will be passed a `user` and a `name` argument.

### api.router.del(path, fn)

An alias for `api.delete`

### api.router.all(path, fn)

This route will be responded to despite the verb used to request it.

## api.render(path, options)

A yieldable object that renders a view from a particular `entire module`.

* path: view to render, {entire_module}/path/from/views
* options: object to be passed to the template.

### api.beforeView(path, fn)

Modify render options before they are passed to the template.

* path: view to modify, {entire_module}/path/from/views
* fn: a GeneratorFunction with the koa context that will be passed the options object to be modified.