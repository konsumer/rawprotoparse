// read more here: https://github.com/protobufjs/protobuf.js/wiki/How-to-reverse-engineer-a-buffer-by-hand

const decoder = new TextDecoder()

// given a buffer, try to figure out how to return it
export function autoString(bytes, prefix) {
  if (bytes.byteLength === 0) {
    return ''
  }
  
  // try to parse it as a sub-message
  try {
    const v = rawprotoparse(bytes, prefix)
    return v
  } catch(e){}

  // search buffer for extended chars
  let hasExtended = false

  for (const b of bytes) {
    if (b < 32) {
      hasExtended = true
    }
  }

  return hasExtended ? bytes : decoder.decode(bytes)
}

export function rawprotoparse (buffer, prefix = 'f', lengthDeliminted=false, stringMode='auto') {
  if (!(buffer instanceof Uint8Array)) {
    throw new Error('bytes parameter should be a Uint8Array or Buffer.')
  }

  let bytes = buffer
  let dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let p = 0

  if (lengthDeliminted) {
    const len = getVal(0)
    bytes = bytes.slice(0, len)
    dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    p = 0
  }

  const out = {}

  function getVal (wireType) {
    let len
    let i
    let value
    switch (wireType) {
      case 0:
        i = 0
        value = bytes[p]
        if (!(bytes[p] & 0x80)) {
          p++
          return value
        }
        while (bytes[p] & 0x80) {
          value |= (bytes[p++] & 0x7f) << i++ * 7
        }
        return value
      case 1:
        value = dv.getFloat64(p, true)
        p += 8
        return value
      case 2:
        len = getVal(0)
        value = bytes.slice(p, p + len)
        p += len
        if (stringMode === 'auto') {
          return autoString(value, prefix)
        }
        if (stringMode === 'string') {
          return decoder.decode(value)
        }
        // binary
        return value
      case 3:
        p++
        return undefined
      case 4:
        p++
        return undefined
      case 5:
        value = dv.getFloat32(p, true)
        p += 8
        return value
      default:
        p++
        throw new Error(`Invalid wireType: ${wireType}`)
    }
  }

  while (p < bytes.byteLength) {
    const tag = getVal(0)
    const id = tag >>> 3
    const wireType = tag & 7

    if (id === 0) {
      throw new Error('0 is invalid field-id')
    }

    if ([0, 1, 2, 5].includes(wireType)) {
      const v = getVal(wireType)
      if (typeof v !== 'undefined') {
        out[`${prefix}${id}`] ||= []
        out[`${prefix}${id}`].push(v)
      }
    }
  }

  return out
}

export default rawprotoparse
