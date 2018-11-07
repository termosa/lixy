# lixy is live proxy

That means it lives an unpredictable life.

While you call to proxied object it stays a proxy unless you get a primitive
value.

```
const lixy = require('lixy');

const math = {
  add (a, b) {
    return a + b;
  }
};

const { add } = lixy(() => math);

add(5, 3); // 8

math.add = (a, b) => a - b;

add(5, 3); // 2
```

**Note:** proxified objects will always have the type `function` to handle the
case when you need to replace the source object with a function, eg
`math = eval`. If you want to change this behaviour pass the second argument
`lixy(getter, { safeType: false })`.
