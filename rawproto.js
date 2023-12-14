// read more here: https://github.com/protobufjs/protobuf.js/wiki/How-to-reverse-engineer-a-buffer-by-hand

function rawprotoparse (bytes, prefix = 'f') {
  if (!bytes instanceof Uint8Array) {
    throw new Error('bytes parameter should be a Uint8Array or Buffer.')
  }

  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const out = {}
  const p = 0
  const f = 0

  // TODO

  return out
}

export default rawprotoparse
