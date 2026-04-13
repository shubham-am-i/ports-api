# `__dirname` in ES Modules

In ECMAScript Modules (ESM), Node.js does not inject the CommonJS-specific global variables `__dirname` and `__filename` into the module scope. This is an intentional design choice to ensure that ES modules remain environment-agnostic and standards-compliant, as variables like `__dirname` are filesystem-specific and do not exist in browser environments.

## Modern Native Solution (Node.js v20.11+)

Starting with Node.js v20.11.0, you no longer need the boilerplate workaround. You can access these values directly through `import.meta`:

```js
const __dirname = import.meta.dirname;
const __filename = import.meta.filename;
```

## Traditional Workaround (Node.js < v20.11)

If you are on an older version, you must reconstruct the paths using `import.meta.url`, which provides the file's location as a `file://` URL:

```js
import { fileURLToPath } from "url";
import { dirname } from "path";

// 1. Convert file URL to a local filesystem path
const __filename = fileURLToPath(import.meta.url);

// 2. Extract the directory name from that path
const __dirname = dirname(__filename);
```
