// TODO: inline this

import codec from 'protobuf-codec'

const { decode: { reader, types, wireTypes: { decoders } } } = codec

// map wireType to data
function getVal (data, wireType, prefix, stringMode, arrayMode) {
  switch (wireType) {
    case 0: return parseInt(data)
    case 1: return data
    case 2:
      try {
        return rawprotoparse(data, prefix, stringMode, arrayMode)
      } catch (e) {
        if (stringMode === 'auto') {
          const lowBytes = false
          if (data.find(b => b < 32)) {
            return Array.from(data)
          } else {
            return types.string(data)
          }
        } else if (stringMode === 'string') {
          return types.string(data)
        } else {
          return Array.from(data)
        }
      }
      break
  }
}

// entry-point util function that will assemble the protobuf into a js-object
export function rawprotoparse (buffer, prefix = 'f', stringMode = 'auto', arrayMode = false) {
  const out = {}
  for (const [fieldNumber, { data, wireType }] of reader(buffer)) {
    const v = getVal(data, wireType, prefix, stringMode, arrayMode)

    if (arrayMode) {
      out[`${prefix}${fieldNumber}`] ||= []
      out[`${prefix}${fieldNumber}`].push(v)
    } else {
      if (out[`${prefix}${fieldNumber}`]) {
        if (Array.isArray(out[`${prefix}${fieldNumber}`])) {
          out[`${prefix}${fieldNumber}`].push(v)
        } else {
          out[`${prefix}${fieldNumber}`] = [out[`${prefix}${fieldNumber}`], v]
        }
      } else {
        out[`${prefix}${fieldNumber}`] = v
      }
    }
  }
  return out
}

export default rawprotoparse
