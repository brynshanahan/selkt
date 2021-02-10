export function strictEqual(a: any, b: any) {
  return a === b
}

export function shallowEqualArray(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  return a.every((item, index) => b[index] === item)
}

export function shallowEqual(a: { [k: string]: any }, b: { [k: string]: any }) {
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

export function deepEqual(a: { [k: string]: any }, b: { [k: string]: any }) {
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
