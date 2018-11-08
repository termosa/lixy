const assert = require('assert')
const lixy = require('.')

assert(typeof lixy({s:{m:{}}}).s.m.p === 'undefined') // should they exist with value undefined?

try {
  lixy({}).s.m
  assert(!'should not be here')
} catch (err) {}

const o = { s: { f: () => 1 } }
const { s: { f }} = lixy(o)
assert(f() === 1)
o.s.f = () => 2
assert(f() === 2)

assert(typeof lixy({}) === 'object')
assert(typeof lixy(() => {}) === 'function')
assert(typeof lixy({}, { safeType: false }) === 'object')

let fs = { a: 1 }
let fp = lixy.lazy(() => fs)
assert(fp.a === 1);
fs = () => 3
assert(fp() === 3);

lixy(1)

assert('b' in lixy({ a: { b: 1 } }).a)

let proto
const withProto = Object.create(proto = {})
assert(Object.getPrototypeOf(lixy({ a: withProto }).a) === proto)

console.log('Success!')
