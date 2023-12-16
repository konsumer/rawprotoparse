/* global test, expect */
import protobuf from 'protobufjs'
import rawprotoparse from './rawproto.js'

const proto = await protobuf.load(new URL('test.proto', import.meta.url).pathname)

describe('Simple', () => {
  const Simple = proto.lookupType('Simple')

  const pb = Simple.encode({ a: 105 }).finish()

  /*
  08 69
  */

  test('default: prefix=f', () => {
    const r = rawprotoparse(pb)
    expect(r).toMatchSnapshot()
  })

  test('prefix=a', () => {
    const r = rawprotoparse(pb, 'a')
    expect(r).toMatchSnapshot()
  })
})

describe('Test', () => {
  const Test = proto.lookupType('Test')

  const pb = Test.encode({
    nums: [1, 2, 3, 4, 5],
    num: 1,
    str: 'hello',
    children: [
      { num: 1, str: 'cool', children: [{ num: 1 }] },
      { num: 2, str: 'awesome', children: [{ num: 2 }] },
      { num: 3, str: 'neat', children: [{ num: 3 }] }
    ]
  }).finish()

  /*
  0A 05 01 02  03 04 05 10
  01 1A 05 68  65 6C 6C 6F
  22 0C 08 01  12 04 63 6F
  6F 6C 1A 02  08 01 22 0F
  08 02 12 07  61 77 65 73
  6F 6D 65 1A  02 08 02 22
  0C 08 03 12  04 6E 65 61
  74 1A 02 08  03
  */

  test('default: prefix=f, stringMode=auto, arrayMode=false', () => {
    const r = rawprotoparse(pb)
    expect(r).toMatchSnapshot()
  })

  test('prefix=a, stringMode=auto, arrayMode=false', () => {
    const r = rawprotoparse(pb, 'a')
    expect(r).toMatchSnapshot()
  })

  test('prefix=f, stringMode=auto, arrayMode=true', () => {
    const r = rawprotoparse(pb, 'f', 'auto', true)
    expect(r).toMatchSnapshot()
  })

  test('prefix=f, stringMode=buffer, arrayMode=false', () => {
    const r = rawprotoparse(pb, 'f', 'buffer')
    expect(r).toMatchSnapshot()
  })

  test('prefix=f, stringMode=string, arrayMode=false', () => {
    const r = rawprotoparse(pb, 'f', 'string')
    expect(r).toMatchSnapshot()
  })
})
