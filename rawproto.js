// TODO: inline this

import codec from 'protobuf-codec'

const { decode: { reader, types, wireTypes: { decoders } } } = codec

// entry-point util function that will assemble the protobuf into a js-object
export function rawprotoparse (buffer, prefix = 'f', lengthDeliminted = false, stringMode = 'auto') {
  const out = {}
  for (const [fieldNumber, { data, wireType }] of reader(buffer)) {
    out[`${prefix}${fieldNumber}`] ||= []

    // console.log(fieldNumber, wireType, data)
    if (wireType === 0) {
      out[`${prefix}${fieldNumber}`].push(parseInt(data)) // could be bad for big numbers
    }

    if (wireType === 1) {
      out[`${prefix}${fieldNumber}`].push(data)
    }

    if (wireType === 2) {
      try {
        out[`${prefix}${fieldNumber}`].push(rawprotoparse(data, prefix))
      } catch (e) {
        if (stringMode === 'auto') {
          const lowBytes = false
          if (data.find(b => b < 32)) {
            out[`${prefix}${fieldNumber}`].push(data)
          } else {
            out[`${prefix}${fieldNumber}`].push(types.string(data))
          }
        } else if (stringMode === 'string') {
          out[`${prefix}${fieldNumber}`].push(types.string(data))
        } else {
          out[`${prefix}${fieldNumber}`].push(data)
        }
      }
    }
  }
  return out
}

export default rawprotoparse
