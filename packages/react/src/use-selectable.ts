import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector"
import { strictEqual, SelectableInterface } from "@selkt/core"
import { useCallback } from "react"

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

  const getSnapshot = useCallback(
    () => (store ? store.version : undefined),
    [store]
  )

  const subscribe = useCallback(
    (next: any) => {
      if (store) {
        return store.subscribe(next)
      } else {
        return () => {}
      }
    },
    [store]
  )

  return useSyncExternalStoreWithSelector(
    subscribe,
    // @ts-ignore
    getSnapshot,
    getSnapshot,
    () => (store ? sel(store.state) : undefined),
    equalityCheck
  )
}
