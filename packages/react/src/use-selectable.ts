import { useSyncExternalStore, useLayoutEffect, useRef, useState } from "react"
import { strictEqual, SelectableInterface } from "@selkt/core"

const ret: <T>(arg: T) => T = (v) => v
export function useSelectable<TState, TSlice = TState>(
  store: SelectableInterface<TState>,
  selector?: (arg: TState) => TSlice,
  equalityCheck?: (arg1: TSlice, arg2: TSlice) => boolean
): TSlice
export function useSelectable<TState = undefined, TSlice = TState>(
  store?: SelectableInterface<TState>,
  selector?: (arg: TState) => TSlice,
  equalityCheck?: (arg1: TSlice, arg2: TSlice) => boolean
): TSlice
export function useSelectable<TState, TSlice = TState>(
  store?: SelectableInterface<TState> | undefined,
  selector?: (arg: TState) => TSlice,
  equalityCheck = strictEqual
): TSlice | undefined {
  let sel = selector ?? (ret as (arg: TState) => TSlice)

  return useSyncExternalStore(
    (onChange) => {
      if (store) {
        return store.select(sel, () => onChange(), equalityCheck)
      } else {
        onChange()
        return () => {}
      }
    },
    () => (store ? sel(store.state) : undefined),
    () => (store ? sel(store.state) : undefined)
  )
}
