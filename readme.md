# {{ mustache }} prestatic
[![Travis Build Status][travis-badge]][travis]
[![LGTM Grade][lgtm-badge]][lgtm]
[![npm][npm-badge]][npm]

Node.js module that turns [mustache] files, partials and data into static HTML pages. Making [mustache.js] usable through a simple CLI and JavaScript API by allowing multiple files as input. mustache-prestatic automatically maps the passed partial files to their file names and populates the template files from passed data files with the same name.

`npm install mustache-prestatic --save-dev`

## Examples

### CLI
This will take all files in the 'views', 'data' and 'partials' directories and use those together to write HTML files to the 'dist' directory:
```shell
mustache-prestatic ./views/*.mustache --data ./data/* --partials ./partials/* --output dist
```

For example using the [test input data](/tests/input) files would be:
```shell
mustache-prestatic ./tests/input/views/*.mustache --data ./tests/input/data/* --partials ./tests/input/partials/*
```

### JavaScript
```js
const { render } = require('mustache-prestatic');

const templateFiles = ['views/blog.mustache', 'views/home.mustache'];
const dataFiles = ['data/home.json'];
const partialFiles = ['partials/article.mustache', 'partials/header.mustache'];

render(templateFiles, dataFiles, partialFiles)
  .then(console.info);
```

## API

### CLI
```
Usage: mustache-prestatic templateFiles [options]
Compile pages of static HTML from mustache templates, data and partials.

Options:
  --help, -h        Show help text.
  --version, -v     Show version number.
  --data, -d        Input mustache template data files.
  --partials, -p    Input mustache partial files.
  --tags, -t        Use custom delimiters/tags like '[%%' '%%]'.
  --unescaped, -u   No HTML-escaping.
  --output, -o      Output directory, defaults to current directory.
  --verbose         Log extra information about the process to stdout.
```

### JavaScript
#### mustachePrestatic(templateFiles, [dataFiles], [partialFiles], [customTags], unescaped)
Compile HTML from provided mustache files.

##### templateFiles
Type: `Array`  
The files that contain the mustache templates, or often called views.

##### dataFiles
Type: `Array`  
The files that contain the mustache template data, this data will populate the template files.

##### partialFiles
Type: `Array`  
The files that contain the mustache partials, these are re-usable parts of views that get included.

##### customTags
Type: `Array`  
Array with custom mustache start- and end-tag - default: ['{{', '}}']

##### unescaped
Type: `Boolean`  
Set to true to overwrite the global mustache.escape function and return unescaped input.

[mustache]: https://mustache.github.io/
[mustache.js]: https://github.com/janl/mustache.js

[travis]: https://travis-ci.com/Siilwyn/mustache-prestatic
[travis-badge]: https://api.travis-ci.com/Siilwyn/mustache-prestatic.svg
[lgtm]: https://lgtm.com/projects/g/Siilwyn/mustache-prestatic/
[lgtm-badge]: https://tinyshields.dev/lgtm/grade/javascript/g/Siilwyn/mustache-prestatic.svg
[npm]: https://www.npmjs.com/package/mustache-prestatic
[npm-badge]: https://tinyshields.dev/npm/mustache-prestatic.svg
