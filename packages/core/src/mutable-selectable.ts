import { strictEqual } from "./equality-checks"
import type {
  Callback,
  Callback2,
  Callback2Opt,
  SelectableInterface,
} from "./types"

export class MutableSelectable<T> implements SelectableInterface<T> {
  private meta = {
    stores: {
      computations: new Set<Callback<T>>(),
      subscriptions: new Set<Callback<T>>(),
    },
    storeNames: ["computations", "subscriptions"],
    currentStore: "subscriptions",
  }

  state: T
  version: number = 0
  flushing: false | (() => any) = false
  constructor(initialState: T) {
    this.state = initialState
  }

  flush(callback?: () => any) {
    if (callback) {
      if (!this.flushing) {
        this.flushing = callback
      }
      callback()
    }

    if (!this.flushing || this.flushing === callback) {
      this.flushing = false
      for (let groupName of this.meta.storeNames) {
        for (let listener of this.meta.stores[groupName]) {
          listener(this.state)
        }
      }
    }
  }
  subscribe(callback: Callback<T>) {
    let store = this.meta.stores[this.meta.currentStore]
    store.add(callback)
    return Object.assign(
      () => {
        store.delete(callback)
      },
      { update: () => callback(this.state) }
    )
  }
  set(updater: Callback<T, T | undefined | void>) {
    let result = updater(this.state)

    if (typeof result !== "undefined") {
      this.state = result
    }

    this.version++
    this.flush()
  }

  select<V>(
    selector: Callback<T, V>,
    onChange: Callback2Opt<V>,
    equalityCheck: Callback2<V, boolean> = strictEqual
  ) {
    /* 
    We pass in the previos state if the onChange callback has at least 2 arguments or no arguments.
    This is because functions that use the ...args operator will report as having 0 arguments
    eg.
      (function(...args) {}).length === 0
     */
    const shouldMemo = onChange.length > 1 || onChange.length === 0
    let prev: V
    prev = selector(this.state)
    shouldMemo ? onChange(prev, undefined) : onChange(prev)
    return this.subscribe((state) => {
      let current: V
      current = selector(state)
      if (!equalityCheck(prev, current)) {
        let memo = undefined
        if (shouldMemo) {
          memo = prev
        }
        prev = current
        shouldMemo ? onChange(prev, memo) : onChange(prev)
      }
    })
  }
  destroy() {
    for (let groupName of this.meta.storeNames) {
      this.meta.stores[groupName].clear()
    }
  }
}
