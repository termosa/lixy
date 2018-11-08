// Notes
//  - Static code works better then a list of generated methods (Chrome can interactively show the result of execution
//  - Should test the case when the object is replaced with the one that has/missed readonly properties
//    - will proxy recalculate invariants?
//    - if not, and it's not because we give it not the exact object, need to implement that check manually

class LixyError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, lixy)
  }
}

class LixyLazyError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, lazy)
  }
}

const isObject = value => typeof value === 'object' || typeof value === 'function'

const resolve = (src, nest) => {
  return nest.reduce((src, level) => {
    if (!isObject(src)) throw new ReferenceError('you come too late')
    return Reflect.get(src, level)
  }, src)
}

const handlerNames = [
  'apply', // (target, thisArgument, argumentsList) → any
  'construct', // (target, argumentsList, newTarget?) → Object
  'defineProperty', // (target, propertyKey, propDesc) → boolean
  'deleteProperty', // (target, propertyKey) → boolean
  'enumerate', // (target) → Iterator
  'getOwnPropertyDescriptor', // (target, propertyKey) → PropDesc|Undefined
  'getPrototypeOf', // (target) → Object|Null
  'has', // (target, propertyKey) → boolean
  'isExtensible', // (target) → boolean
  'ownKeys', // (target) → Array<PropertyKey>
  'preventExtensions', // (target) → boolean
  'set', // (target, propertyKey, value, receiver?) → boolean
  'setPrototypeOf', // (target, proto) → boolean
]

const handler = handlerNames.reduce((handler, name) => {
  return Object.assign(handler, { [name]: (src, ...args) => {
    const target = resolve(src.getter(), src.nest)
    return Reflect[name](target, ...args)
  }})
}, {
  get(src, prop) {
    const target = resolve(src.getter(), src.nest)
    const value = Reflect.get(target, prop)
    if (typeof value !== 'function' && typeof value !== 'object')
      return value
    return proxify(src.getter, false, src.nest.concat(prop))
  }
})

const proxify = (getter, lazy, nest = []) => {
  if (lazy) {
    if (typeof getter !== 'function')
      throw new LixyLazyError('Target of lazy proxy must be a function')
  } else {
    const target = getter()
    if (typeof target !== 'function' && typeof target !== 'object')
      throw new LixyError('Target of proxy must be a function or an object (primitives are not supported)')
  }
  const src = lazy || typeof resolve(getter(), nest) === 'function' ? () => {} : {}
  Object.assign(src, { getter, nest })
  return new Proxy(src, handler)
}

const lixy = target => proxify(() => target)
const lazy = getter => proxify(getter, 'lazy')

exports = module.exports = lixy
exports.lazy = lazy;
