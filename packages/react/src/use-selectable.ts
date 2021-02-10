import { useEffect, useState } from 'react'
import { strictEqual, Callback, SelectableInterface } from '@selectable/core'

const ret = (v) => v

export function useSelectable<S, T = S>(
  store: SelectableInterface<S> | undefined,
  selector?: (arg: S) => T,
  equalityCheck = strictEqual
): T | undefined {
  let sel = selector ?? ret
  let [state, set] = useState(store ? sel(store.state) : undefined)

  /* eslint-disable */
  useEffect(() => {
    let current = store ? sel(store.state) : undefined
    if (!equalityCheck(current, state)) set(current)
    if (store) {
      return store.select(sel, set, equalityCheck)
    }
  })
  /* eslint-enable */

  return state
}

export function useSelectableSuspense<V, K extends SelectableInterface<T>, T>(
  store: K,
  selector: Callback<T, V>
) {
  let value
  try {
    value = selector(store.state)
  } catch (e) {}
  if (value === undefined) {
    throw new Promise<void>((resolve) => {
      let off = store.select(selector, (value) => {
        if (value !== undefined) {
          off()
          resolve()
        }
      })
    })
  }
}
