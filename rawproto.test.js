/* global test, expect */
import protobuf from 'protobufjs'
import rawprotoparse from './rawproto.js'

const proto = await protobuf.load(new URL('test.proto', import.meta.url).pathname)

const Test = proto.lookupType('Test')
const Simple = proto.lookupType('Simple')

describe('documented hand-parsing', () => {
  test('message from protobufjs wiki', () => {
    const pb = Buffer.from([0X0A, 0X0A, 0X32, 0X08, 0X08, 0X07, 0X10, 0X00, 0X18, 0X1A, 0X20, 0X00, 0X0A, 0X08, 0X22, 0X06, 0X08, 0X02, 0X10, 0X19, 0X18, 0X03, 0X0A, 0X09, 0X22, 0X07, 0X08, 0X02, 0X10, 0XA2, 0X03, 0X18, 0X20, 0X0A, 0X09, 0X22, 0X07, 0X08, 0X02, 0X10, 0X8D, 0X02])
    const r = rawprotoparse(pb)
    expect(r).toMatchSnapshot()
  })

  test('protobufjs#143', () => {
    const pb = Buffer.from([0x0A, 0x0F, 0x72, 0x62, 0x68, 0x5F, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x5F, 0x76, 0x30, 0x2E, 0x31, 0x10, 0x06, 0x42, 0x1E, 0x0A, 0x16, 0x6C, 0x69, 0x76, 0x69, 0x6E, 0x67, 0x72, 0x6F, 0x6D, 0x5F, 0x73, 0x65, 0x6E, 0x73, 0x6F, 0x72, 0x6D, 0x6F, 0x64, 0x75, 0x6C, 0x65, 0x12, 0x04, 0x74, 0x65, 0x6D, 0x70])
    const r = rawprotoparse(pb)
    console.log(r)
    expect(r).toMatchSnapshot()
  })
})

describe('buffers made with protobufjs', () => {
  test.skip('Simple message', () => {
    const pb = Simple.encode({ a: 150 }).finish()
    const r = rawprotoparse(pb)
  })

  test('Test message', () => {
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

    const r = rawprotoparse(pb)
    expect(r).toMatchSnapshot()
  })
})
