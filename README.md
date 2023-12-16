Very small raw protobuf parser.

This is similar to [rawproto](https://github.com/konsumer/rawproto), but without anything around the schema-def.

Use this if you want a really light library, and don't need to generate the schema for some raw protobuf messages, or anything like that. It's fast & light. It has 0-dependencies, and can be used in just about any place that runs javascript (browser, nodejs, cloudflare-edge, deno, bun, etc.)

It can read a `Buffer` (nodejs) or `Uint8Array` of bytes, and outputs a JSON-encodable object.

## usage

### nodejs (module)

```js
import rawprotoparse from 'rawprotoparse'
import { readFile } from 'fs/promises'

console.log(rawprotoparse(await readFile('somebinaryfile.pb')))
```

### nodejs (commonjs)

```js
const rawprotoparse  = require('rawprotoparse')
const { readFile }  = require('fs')

readFile('somebinaryfile.pb', (err, bytes) => {
  console.log(rawprotoparse(bytes))
})
```

### web (module)

```html
<script type="module">
import rawprotoparse from "https://esm.run/rawprotoparse"

console.log(rawprotoparse(someBytes))
</script>
```

### options

```js
rawprotoparse (buffer, prefix = 'f', stringMode = 'auto', arrayMode = false)
```

- `prefix` - a string to put in front of the fieldnames
- `stringMode` - a string for what to do with buffers.
  - `auto` - try to guess if it's `string` or `buffer`, based on bytes
  - `string` - force a string, that may have escaped characters
  - `buffer` - outputs an array of bytes. I use a plain array so that you can encode to JSON easier
- `arrayMode` - a boolean that forces all fields to be arrays. This allows you to assume all values are arrays (not just repeated fields)
