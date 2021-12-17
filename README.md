# NDWeakMap

WeakMap with multiple dimensions. Use array of objects as WeakMap's key.

```
npm i nd-weakmap
yarn add nd-weakmap
```

## Quick Start

```js
import NDWeakMap from "nd-weakmap";

const map = new NDWeakMap();

// ---------------------

map.set([aaa, bbb], "this works");
map.set([aaa, aaa], "this works too");
map.set([aaa], "second stuff");

map.get([aaa]) === "second stuff";
map.get([aaa, bbb]) === "this works";
map.get([aaa, aaa]) === "this works too";

// ---------------------

map.delete([aaa]); // will NOT affect [aaa, bbb] & [aaa, aaa]

map.has([aaa]) === false;
map.has([aaa, aaa]) === true;
map.has([aaa, bbb]) === true;

// ---------------------

map.deleteCascade([aaa]); // will delete [aaa, *] and [aaa, *, *] ...

map.has([aaa]) === false;
map.has([aaa, aaa]) === false; // deleted
map.has([aaa, bbb]) === false; // deleted

// ---------------------

map.clear();
```

### Strict KeyTuple Length

By default, keyTuple's length may vary.

You can apply constraint to their length.

```js
import NDWeakMap from "nd-weakmap";

// optional constructor parameter
// if is provided, `set()` and `delete()` will strictly check the keyTuple's length

const map = new NDWeakMap(2);
//                        _
//                        |
//                        +--- Strict KeyTuple Length

map.set([aaa, bbb], "this works");
map.set([aaa], "not work"); // this throws Error

map.get([aaa]) === undefined; // this won't throw
```

### TypeScript

You may constraint the keyTuple's type. Meanwhile don't forget to set Strict KeyTuple Length!

```ts
import NDWeakMap from "nd-weakmap";

type KeyTupleType = [any, any];
type ValueType = string;

const map = new NDWeakMap<KeyTupleType, ValueType>(2);
//                                                 _
//                                                 |
//            (required) Strict KeyTuple Length ---+

map.set([aaa, bbb], "this works");
map.set([aaa], "not work"); // this throws Error

map.get([aaa]) === undefined; // this won't throw
```
