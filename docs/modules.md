# Entire Modules

`Entire Modules` are the core units of `Entire` and are created by following a simple convention. 

```txt
module/
	package.json
		name: module
		active: true
		router: ./router.js
		styles: ./styles.css
		scripts: ./scripts.js
		dependencies: ['parent']
	views/
	public/
	router.js
	styles.css
	scripts.js
```

1. Create a folder, naming it the name of your module.
2. Is your module going to have views? Create a views folder.
3. Is your module going to server static files? Create a public folder.
4. Create a package.json file. This file must be valid json.
5. `Entire` requires package.json to have:
	1. a "name" field
	3. and one or all of the component fields, paths to the component file.
		* styles
		* scripts
		* router
6. Along with the required fields the package.json file can have
	1. a "dependencies" array
	2. an "active" boolean. If this is not provided it will be presumed TRUE.