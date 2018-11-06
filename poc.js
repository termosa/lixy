const resolve = (src, nest) => nest
  .reduce((src, level) => Reflect.get(src, level), src);

const handler = {
  apply(target, ...args) {
    const fn = resolve(target.source, target.nest);
    return Reflect.apply(fn, ...args);
  },
  get(target, prop) {
    console.log('get', prop, target.nest);
    const src = resolve(target.source, target.nest);
    const value = Reflect.get(src, prop);
    if (typeof value !== 'function' && typeof value !== 'object')
      return value;
     return proxy(target.source, target.nest.concat(prop));
  }
};

const proxy = (source, nest = []) => {
  const target = Object.assign(() => {}, { source, nest });
  return new Proxy(target, handler);
};

const M = 'MESSAGE - MESSAGE - MESSAGE - MESSAGE - MESSAGE'

const s = {
  n: {
    v: 1,
    f: console.log
  }
};

const p = proxy(s);

const f = p.n.f;

f(M);
s.n.f = console.warn;
f(M); // should warn
delete s.n;
f(M); // should failed as undefined (custom error?)
