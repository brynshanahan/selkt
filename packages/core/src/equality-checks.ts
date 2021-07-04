export function strictEqual<T1 extends any, T2 extends any>(a: T1, b: T2) {
  return a === b
}

export function shallowEqualArray<Arr extends any[], Arr2 extends any[]>(
  a: Arr,
  b: Arr2
) {
  if (a.length !== b.length) return false
  return a.every((item, index) => b[index] === item)
}

export function shallowEqual<
  T1 extends { [k: string]: any },
  T2 extends { [k: string]: any }
>(a: T1, b: T2) {
  let aKeys = Object.keys(a)
  let bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) return false

  for (let key of aKeys) {
    if (a[key] !== b[key]) {
      return false
    }
  }

  return true
}

export function deepEqual<
  T1 extends { [k: string]: any },
  T2 extends { [k: string]: any }
>(a: T1, b: T2) {
  let aKeys = Object.keys(a)
  let bKeys = Object.keys(b)

  if (aKeys.length !== bKeys.length) return false

  for (let key of aKeys) {
    if (typeof a[key] === 'object' && typeof b[key] === 'object') {
      if (!deepEqual(a[key], b['key'])) {
        return false
      }
    } else {
      if (a[key] !== b[key]) {
        return false
      }
    }
  }

  return true
}
