// TODO: inline this

import { reader, types, decoders } from './protobuf-codec.js'

// map wireType to data
function getVal (data, wireType, prefix, stringMode, arrayMode) {
  switch (wireType) {
    // varint - could be bad if it's big (over 6 bytes) but this will handle most usecases
    case 0:
      return parseInt(data)

    // fixed64bit - returns a BigInt
    case 1:
      return data

    // bytes - try to parse as sub-message, and handle stringMode
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

    // these are depracated group messages
    case 3:
    case 4:
      return null

    // fixed32bit - returns a regular int
    case 5:
      return data

    default:
      throw new Error(`Invalid wire-type: ${wireType}`)
  }
}

// entry-point util function that will assemble the protobuf into a js-object
export default function rawprotoparse (buffer, prefix = 'f', stringMode = 'auto', arrayMode = false) {
  const out = {}
  for (const [fieldNumber, { data, wireType }] of reader(buffer)) {
    const v = getVal(data, wireType, prefix, stringMode, arrayMode)

    if (v === null) {
      continue
    }

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
