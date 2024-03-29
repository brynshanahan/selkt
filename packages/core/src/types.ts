export type Callback<T = any, R = any> = (arg: T) => R
export type Callback2<T = any, R = any> = (arg1: T, arg2: T) => R
export type Callback2Opt<T = any, R = any> = (arg1: T, arg2?: T) => R
type CancelSub = () => void

export type SelectableInterface<T> = {
  select: <V>(
    selector: Callback<T, V>,
    onChange: Callback2Opt<V>,
    equalityCheck?: Callback2<V, boolean>
  ) => CancelSub
  state: T
  version: number
  subscribe: (callback: Callback<T>) => CancelSub & { update: () => void }
}
