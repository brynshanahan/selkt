import { useEffect, useState } from 'react'
import {
  strictEqual,
  Callback,
  SelectableInterface,
  MutableSelectable,
} from '@selkt/core'

const ret: <T>(arg: T) => T = (v) => v
type NonNullable<T> = Exclude<T, null | undefined>

export function useSelectable<TState, TSlice = TState>(
  store: SelectableInterface<TState> | undefined,
  selector?: (arg: TState) => TSlice,
  equalityCheck = strictEqual
): TSlice | undefined {
  let sel = selector ?? (ret as (arg: TState) => TSlice)
  let [state, set] = useState(store ? sel(store.state) : undefined)

  useEffect(() => {
    let current = store ? sel(store.state) : undefined
    if (!equalityCheck(current, state)) set(current)
    if (store) {
      return store.select(sel, set, equalityCheck)
    }
  })

  return state
}
export function useSelectableSuspense<TState, TSlice = TState>(
  store: SelectableInterface<TState>,
  selector: Callback<TState, TSlice>
): NonNullable<TSlice> {
  let value
  try {
    value = selector(store.state)
  } catch (e) {}
  if (value === undefined || value === null) {
    throw new Promise<void>((resolve) => {
      let off = store.select(selector, (value) => {
        if (value !== undefined) {
          off()
          resolve()
        }
      })
    })
  }
  return value as NonNullable<TSlice>
}
