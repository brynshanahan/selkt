import { shallowEqualArray, strictEqual } from './equality-checks'
import type {
  Callback,
  Callback2,
  Callback2Opt,
  SelectableInterface,
} from './types'

export class MutableSelectable<T> implements SelectableInterface<T> {
  private listeners = new Set<Callback<T>>()
  state: T
  version: number = 0
  constructor(initialState: T) {
    this.state = initialState
  }
  runUpdate() {
    this.listeners.forEach((listener) => {
      listener(this.state)
    })
  }
  subscribe(callback: Callback<T>) {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }
  set(updater: Callback<T, T | undefined | void>) {
    let result = updater(this.state)

    if (typeof result !== 'undefined') {
      this.state = result
    }

    this.version++
    this.runUpdate()
  }
  select<V>(
    selector: Callback<T, V>,
    onChange: Callback2Opt<V>,
    equalityCheck: Callback2<V, boolean> = strictEqual
  ) {
    // Check if the function requests more than one param
    const shouldMemo = onChange.length > 1
    let prev: V
    try {
      prev = selector(this.state)
    } catch (e) {
      // @ts-ignore
      prev = undefined
    }
    shouldMemo ? onChange(prev, undefined) : onChange(prev)
    return this.subscribe((state) => {
      let current: V
      try {
        current = selector(state)
      } catch (e) {
        // @ts-ignore
        current = undefined
      }
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
  getSnapshot() {
    return this.version
  }
  destroy() {
    this.listeners.clear()
  }
}
