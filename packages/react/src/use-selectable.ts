import { useEffect, useState } from 'react'
import {
  strictEqual,
  Callback,
  SelectableInterface,
  Selectable,
} from '@selkt/core'

const ret: <T>(arg: T) => T = (v) => v

export function useSelectable<
  Store extends SelectableInterface<TState>,
  TState,
  TSlice = TState
>(
  store: Store | undefined,
  selector?: (arg: TState) => TSlice,
  equalityCheck = strictEqual
): TSlice | undefined {
  let sel = selector ?? (ret as (arg: TState) => TSlice)
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

export function useSelectableSuspense<
  Value,
  Store extends SelectableInterface<T>,
  T
>(store: Store, selector: Callback<T, Value>) {
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

let store = new Selectable(0)
useSelectable(store)
