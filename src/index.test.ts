import { NDWeakMap } from "./index";

const makeObjs = (length: number) => Array.from({ length }, () => ({}));

type Case = { fixedLen: boolean };

describe("NDWeakMap", () => {
  const table: Case[] = [{ fixedLen: true }, { fixedLen: false }];

  test.each(table)("works %o", ({ fixedLen }: Case) => {
    // optioanlly provide a length argument
    const map = new NDWeakMap<[any, any], number>(fixedLen ? 2 : void 0);

    const [x, y] = makeObjs(2);
    const [a, b] = makeObjs(2);

    expect(map.get([x, a])).toBeUndefined();
    expect(map.get([x, b])).toBeUndefined();

    expect(map.has([x, a])).toBe(false);
    expect(map.has([x, b])).toBe(false);

    // -----------
    // invalid keyTuples
    // @ts-expect-error
    expect(() => map.get(null)).toThrowError();
    // @ts-expect-error
    expect(() => map.get([])).toThrowError();
    // -----------

    if (fixedLen) {
      /**
       * If NDWeakMap is constructed with a fixed length,
       * The keyTuple passed to `set` and `delete` must have the same length
       */

      //@ts-expect-error
      expect(() => map.set([x], 1)).toThrowError();

      //@ts-expect-error
      expect(() => map.delete([x], 1)).toThrowError();
    } else {
      /**
       * If NDWeakMap is constructed WITHOUT fixed length,
       *
       * The keyTuple passed to `set` and `delete` can have any length,
       *
       * 1. keyTuple `[foo]` is independent of `[foo, *]`
       *
       * 2. call `deleteCascade()` with `[foo]` will also delete nested keyTuples (eg. `[foo, *]`)
       */

      //@ts-expect-error
      map.set([x], 1);

      //@ts-expect-error
      expect(map.get([x])).toBe(1);
      expect(map.get([x, a])).toBeUndefined();

      map.set([x, a], 999);

      //@ts-expect-error
      expect(map.get([x])).toBe(1);
      expect(map.get([x, a])).toBe(999);

      //@ts-expect-error
      expect(map.has([x])).toBe(true);
      expect(map.has([x, a])).toBe(true);

      //@ts-expect-error
      expect(map.has([y])).toBe(false);
      expect(map.has([x, b])).toBe(false);

      // ------------
      // normal delete

      //@ts-expect-error
      expect(map.delete([x])).toBe(true);

      //@ts-expect-error
      expect(map.get([x])).toBeUndefined();
      expect(map.get([x, a])).toBe(999);

      //@ts-expect-error
      expect(map.has([x])).toBe(false);
      expect(map.has([x, a])).toBe(true);

      // ------------
      // cascadeDelete

      //@ts-expect-error
      map.set([x], 1);
      map.set([x, a], 999);
      map.set([x, b], 888);

      expect(map.deleteCascade([x])).toBe(true);
      expect(map.deleteCascade([x])).toBe(false);

      //@ts-expect-error
      expect(map.get([x])).toBeUndefined();
      expect(map.get([x, a])).toBeUndefined(); // nested nodes are deleted too!
      expect(map.get([x, b])).toBeUndefined(); // nested nodes are deleted too!

      //@ts-expect-error
      expect(map.has([x])).toBe(false);
      expect(map.has([x, a])).toBe(false);
      expect(map.has([x, b])).toBe(false);
    }

    // -----

    map.set([x, a], 1);
    map.set([x, a], 2);

    // invalid keyTuples
    expect(() => map.set([x, "notObj"], 99)).toThrowError();

    expect(map.get([x, a])).toBe(2);
    expect(map.get([x, b])).toBeUndefined();

    expect(map.has([x, a])).toBe(true);
    expect(map.has([x, b])).toBe(false);

    // -----

    expect(map.delete([x, a])).toBe(true);
    expect(map.delete([x, a])).toBe(false);
    expect(map.delete([x, b])).toBe(false);

    expect(map.get([x, a])).toBeUndefined();
    expect(map.get([x, b])).toBeUndefined();

    expect(map.has([x, a])).toBe(false);
    expect(map.has([x, b])).toBe(false);

    // -----

    map.set([x, a], 1);
    map.set([x, b], 2);
    map.clear();
    expect(map.has([x, a])).toBe(false);
    expect(map.has([x, b])).toBe(false);
    expect(map.delete([x, a])).toBe(false);
  });

  test("cascadeDelete", () => {
    const map = new NDWeakMap<[any, any], number>(2);

    const [x, y] = makeObjs(2);
    const [a, b] = makeObjs(2);

    map.set([x, a], 1);
    map.set([x, b], 2);
    map.set([y, a], 3);
    map.set([y, b], 4);

    expect(map.get([x, a])).toBe(1);
    expect(map.get([y, b])).toBe(4);

    // -----

    expect(map.deleteCascade([y])).toBe(true);
    expect(map.deleteCascade([y])).toBe(false);  // already deleted

    expect(map.get([x, a])).toBe(1);
    expect(map.get([x, b])).toBe(2);
    expect(map.get([y, a])).toBeUndefined();
    expect(map.get([y, b])).toBeUndefined();

    // -----

    expect(() => map.deleteCascade([])).toThrowError();
  });
});
