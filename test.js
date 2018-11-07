const assert = require('assert')
const lixy = require('.')

assert(typeof lixy({s:{m:{}}}).s.m.p === 'undefined') // should they exist with value undefined?

try {
  lixy({}).s.m.p // should they exist with value undefined?
  assert(!'should not be here')
} catch (err) {}

const o = { s: { f: () => 1 } }
const { s: { f }} = lixy(o)
assert(f() === 1)
o.s.f = () => 2
assert(f() === 2)

assert(typeof lixy({}) === 'function')
assert(typeof lixy({}, { safeType: false }) === 'object')


console.log('Success!')
