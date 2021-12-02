import { useEffect, useLayoutEffect, useState } from "react";
import { strictEqual, Callback, SelectableInterface } from "@selkt/core";

const isoLayoutEffect = // @ts-ignore
  typeof window === "undefined" ? () => {} : useLayoutEffect;

const ret: <T>(arg: T) => T = (v) => v;
type DeepRequired<T> = T extends object
  ? Required<{
      [K in keyof T]: NonNullable<DeepRequired<T[K]>>;
    }>
  : T;
export function useSelectable<TState, TSlice = TState>(
  store: SelectableInterface<TState>,
  selector?: (arg: TState) => TSlice,
  equalityCheck?: (arg1: TSlice, arg2: TSlice) => boolean
): TSlice;
export function useSelectable<TState, TSlice = TState>(
  store?: SelectableInterface<TState> | undefined,
  selector?: (arg: TState) => TSlice,
  equalityCheck = strictEqual
): TSlice | undefined {
  let sel = selector ?? (ret as (arg: TState) => TSlice);
  let [state, set] = useState(store ? () => sel(store.state) : undefined);

  isoLayoutEffect(() => {
    let current = store ? sel(store.state) : undefined;
    if (!equalityCheck(current, state)) set(current);
  }, []);
  useEffect(() => {
    let current = store ? sel(store.state) : undefined;
    if (!equalityCheck(current, state)) set(current);
    if (store) {
      return store.select(
        sel,
        (slice) => {
          // We have to check here to make sure this isn't run when the selectable is setup
          if (!equalityCheck(current, slice)) {
            set(slice);
          }
        },
        equalityCheck
      );
    }
  });

  return state;
}
export function useSelectableSuspense<TState, TSlice = TState>(
  store: SelectableInterface<TState>,
  selector: Callback<DeepRequired<TState>, TSlice>
): NonNullable<TSlice> {
  let value;
  try {
    value = selector(store.state as unknown as DeepRequired<TState>);
  } catch (e) {}
  if (value === undefined || value === null) {
    throw new Promise<void>((resolve) => {
      let off = store.select(selector as any, (value) => {
        if (value !== undefined) {
          off();
          resolve();
        }
      });
    });
  }
  return value as NonNullable<TSlice>;
}
