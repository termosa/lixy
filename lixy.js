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
  return Object.assign(handler, { [name]: (target, ...args) => {
    const src = resolve(target.source, target.nest)
    return Reflect[name](src, ...args)
  }})
}, {
  get(target, prop) {
    const src = resolve(target.source, target.nest)
    const value = Reflect.get(src, prop)
    if (typeof value !== 'function' && typeof value !== 'object')
      return value
    return proxify(target.source, target.options, target.nest.concat(prop))
  }
})

const proxify = (source, options, nest = []) => {
  const target = options.safeType || typeof source === 'function' ? () => {} : {}
  Object.assign(target, { nest, options, source })
  return new Proxy(target, handler)
}

const defaults = {
  safeType: true // always use function as a target
}

const lixy  = (target, options) =>
  proxify(target, Object.assign({}, defaults, options))

module.exports = lixy
