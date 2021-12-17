type Head<T> = T extends [] ? [] : T extends [...infer R, any] ? R : any[];
type PartialTuples<T extends any[]> = any[] extends T ? T : 0 extends T["length"] ? never : T | PartialTuples<Head<T>>;

const isObj = (x: any): x is Object => (typeof x === "object" || typeof x === "function") && x !== null;

function validateKeyTuple(keyTuple: any, host: NDWeakMap<any>, ensureItemsAreObject?: boolean, noStrictLength?: boolean) {
  if (!Array.isArray(keyTuple) || !keyTuple.length) throw new Error("key must be an array");
  if (!noStrictLength && host.keyTupleLength && host.keyTupleLength !== keyTuple.length) throw new Error(`keyTuple's length must be ${host.keyTupleLength!}`);

  if (ensureItemsAreObject) {
    const notObjItem = keyTuple.findIndex((x) => !isObj(x));
    if (notObjItem !== -1) throw new Error(`keyTuple can only contain objects. Find invalid item#${notObjItem}`);
  }
}

export class NDWeakMap<KeyTuple extends object[] = any[], Value = any> {
  private children?: WeakMap<any, NDWeakMap>;
  private selfValue?: Value | undefined;
  readonly keyTupleLength?: number;

  constructor(strictKeyTupleLength?: KeyTuple["length"]) {
    if (strictKeyTupleLength! > 0) this.keyTupleLength = strictKeyTupleLength;
  }

  get(keyTuple: KeyTuple): Value | undefined {
    validateKeyTuple(keyTuple, this);
    return this.getSubMap(keyTuple)?.selfValue;
  }

  private getSubMap(keyTuple: object[], create?: boolean): NDWeakMap | undefined {
    if (keyTuple.length === 0) return this;

    let cur: NDWeakMap<any> = this;
    for (const k of keyTuple) {
      if (!cur.children) {
        if (!create) return;
        cur.children = new WeakMap();
      }

      const t = cur.children.get(k);
      if (!t) {
        if (!create) return;
        cur.children.set(k, (cur = new NDWeakMap()));
      } else {
        cur = t;
      }
    }

    return cur;
  }

  has(keyTuple: KeyTuple): boolean {
    validateKeyTuple(keyTuple, this);
    return typeof this.getSubMap(keyTuple)?.selfValue !== "undefined";
  }

  set(keyTuple: KeyTuple, value: Value): this {
    validateKeyTuple(keyTuple, this, true);
    this.getSubMap(keyTuple, true)!.selfValue = value;
    return this;
  }

  clear() {
    this.children = this.selfValue = void 0;
  }

  delete(keyTuple: KeyTuple): boolean {
    validateKeyTuple(keyTuple, this);
    const subMap = this.getSubMap(keyTuple);
    if (!subMap || typeof subMap.selfValue === "undefined") return false;
    subMap.selfValue = void 0;
    return true;
  }

  deleteCascade(keyTuplePrefix: PartialTuples<KeyTuple>): boolean;
  deleteCascade(keyTuplePrefix: any[]): boolean;
  deleteCascade(keyTuplePrefix: any[]): boolean {
    validateKeyTuple(keyTuplePrefix, this, false, true);

    const head = keyTuplePrefix.slice(0, -1);
    const k = keyTuplePrefix[keyTuplePrefix.length - 1]!;

    const node = this.getSubMap(head);
    if (!node) return false;

    return !!node.children?.delete(k);
  }
}

export default NDWeakMap;
