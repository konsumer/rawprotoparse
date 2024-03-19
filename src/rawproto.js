// TODO: inline this

import { reader, types, decoders } from './protobuf-codec.js'

export { reader, types, decoders }

/**
 * Default callback for mapping wireType to data
 *
 * @export
 * @param {Number|Uint8Array} [data] the value of the current field
 * @param {Number} [wireType] A number that represents the protobuf wire-type (see https://protobuf.dev/programming-guides/encoding/#structure)
 * @param {String} [prefix] A string-prefix to use for outputting objects. for example field id 1 will be "f1" if the prefix is "f"
 * @param {String} [stringMode] How to handle LEN fields, which can be byte-buffers, sub-messages, or strings. Could be "auto", "string", or "buffer".
 * @param {Boolean} [arrayMode]  arrayMode Should the output fields be fordced to arrays? This is to handle the idea that a field can have multiple values, which does not cleanly map to JSON. Normally, this will decide if it should be an array or not, but you can force arrays always, to keep it uniform.
 * @param {(data: Number|Uint8Array, wireType: Number, prefix: String, stringMode: String, arrayMode: Boolean, valueHandler?: typeof getVal) => any} [valueHandler=getVal]
 * @returns {*}
 */
export function getVal (data, wireType, prefix, stringMode, arrayMode, valueHandler = getVal, currentPath = '') {
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
        return rawprotoparse(data, { prefix, stringMode, arrayMode, valueHandler, currentPath })
      } catch (e) {
        if (stringMode === 'auto') {
          if (data.find((b) => b < 32)) {
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

/**
 * Entry-point util function that will assemble the protobuf into a js-object
 *
 * @export
 * @param {Uint8Array|Buffer} [buffer] The buffer of binary protobuf to parse
 * @param {Object} [options={}]
 * @param {string} [options.prefix='f'] A string-prefix to use for outputting objects. for example field id 1 will be "f1" if the prefix is "f"
 * @param {string} [options.stringMode='auto'] How to handle LEN fields, which can be byte-buffers, sub-messages, or strings. Could be "auto", "string", or "buffer".
 * @param {boolean} [options.arrayMode=false] arrayMode Should the output fields be fordced to arrays? This is to handle the idea that a field can have multiple values, which does not cleanly map to JSON. Normally, this will decide if it should be an array or not, but you can force arrays always, to keep it uniform.
 * @param {(data: Number|Uint8Array, wireType: Number, prefix: String, stringMode: String, arrayMode: Boolean, valueHandler?: typeof getVal) => any} [options.valueHandler=getVal]
 * @returns {any}
 */
export function rawprotoparse (buffer, options = {}) {
  const { prefix = 'f', stringMode = 'auto', arrayMode = false, valueHandler = getVal, currentPath = '' } = options
  const out = {}
  for (const [fieldNumber, { data, wireType }] of reader(buffer)) {
    const v = valueHandler(data, wireType, prefix, stringMode, arrayMode, valueHandler, `${currentPath}.${prefix}${fieldNumber}`)

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

export default rawprotoparse
