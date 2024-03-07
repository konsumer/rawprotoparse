// from https://github.com/emilbayes/nanoassert
// from https://github.com/vegaprotocol/js-protobuf-codec

import * as types from './protobuf-types.js'

export { types }

class AssertionError extends Error {}
AssertionError.prototype.name = 'AssertionError'

/**
 * Minimal assert function
 * @param  {any} t Value to check if falsy
 * @param  {string=} m Optional assertion error message
 * @throws {AssertionError}
 */
function assert(t, m) {
  if (!t) {
    const err = new AssertionError(m)
    if (Error.captureStackTrace) Error.captureStackTrace(err, assert)
    throw err
  }
}

/**
 * Wire type decoders mapping the `type` integer to the basic decoder.
 * Groups are not supported, and the higher-level types are done in a 2nd pass
 * @type {Object}
 */
export const decoders = {
  0: varint,
  1: fixed64bit,
  2: bytes,
  5: fixed32bit
}

export function tag(buf, byteOffset = 0) {
  const int = Number(varint(buf, byteOffset)) // Safe as protoc only allows fieldNumber up to int32 + 3 bits for wireType
  const wireType = int & 0b111
  const fieldNumber = int >> 3

  tag.bytes = varint.bytes

  return { wireType, fieldNumber }
}

export function varint(buf, byteOffset = 0) {
  let o = byteOffset
  let acc = 0n
  let shift = 0n
  while (buf[o] & 0b1000_0000) {
    acc |= BigInt(buf[o++] & 0b0111_1111) << shift
    shift += 7n
  }

  assert((buf[o] & 0b1000_0000) === 0, 'Malformed varint')

  acc |= BigInt(buf[o++] & 0b0111_1111) << shift

  varint.bytes = o - byteOffset
  return acc
}

export function bytes(buf, byteOffset = 0) {
  const len = varint(buf, byteOffset)

  assert(buf.byteLength - byteOffset - varint.bytes >= len, 'Malformed bytes')
  const b = buf.subarray(byteOffset + varint.bytes, byteOffset + varint.bytes + Number(len))

  bytes.bytes = varint.bytes + Number(len)
  return b
}

export function fixed64bit(buf, byteOffset = 0) {
  assert(buf.byteLength - byteOffset >= 8, 'Malformed 64-bit')
  fixed64bit.bytes = 8
  return buf.subarray(byteOffset, byteOffset + 8)
}

export function fixed32bit(buf, byteOffset = 0) {
  assert(buf.byteLength - byteOffset >= 4, 'Malformed 64-bit')
  fixed32bit.bytes = 4
  return buf.subarray(byteOffset, byteOffset + 4)
}

export function* reader(buf, byteOffset = 0, byteLength = buf.byteLength) {
  let o = byteOffset
  const end = byteOffset + byteLength
  assert(end <= buf.byteLength)

  for (; o < end; ) {
    const { wireType, fieldNumber } = tag(buf, o)
    const tagByteOffset = o
    const tagByteLength = tag.bytes
    o += tagByteLength

    const data = decoders[wireType](buf, o)
    const dataByteLength = decoders[wireType].bytes
    o += dataByteLength

    yield [fieldNumber, { tagByteOffset, tagByteLength, fieldNumber, wireType, dataByteLength, data }]
  }

  assert(o === end)
}

export default reader
