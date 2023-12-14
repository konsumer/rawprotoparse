import rawprotoparse from './rawproto.js'
import { readFile } from 'fs/promises'

const pb = await readFile('test.pb')

test('Buffer (nodejs)', () => {
  const r = rawprotoparse(pb)
  // expect(r).toMatchSnapshot()
  // console.log(r)
})

test('Uint8Array', () => {
  const r = rawprotoparse(new Uint8Array(pb))
  console.log(r)
})
