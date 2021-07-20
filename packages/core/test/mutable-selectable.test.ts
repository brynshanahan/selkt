import { MutableSelectable, Selectable, shallowEqualArray } from '../src'

describe('MutableSelectable', () => {
  it('Immediately calls handler when created', () => {
    let callback = jest.fn()

    let store = new MutableSelectable({
      count: 0,
    })

    store.select((state) => state.count, callback)

    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith(0, undefined)
  })

  it('Accepts different equality functions', () => {
    let callback = jest.fn(console.log)

    let store = new MutableSelectable(0)

    /* Only updates when the first value of the array changes */
    store.select(
      (state) => [Math.floor(state / 2), state] as const,
      ([flag, num]) => {
        callback(num)
        console.info(num)
      },
      (a, b) => a[0] === b[0]
    )

    store.set((s) => s + 1)
    store.set((s) => s + 1)
    store.set((s) => s + 1)

    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0)
    expect(callback).toBeCalledWith(2)
  })
  it('Cancels subscriptions', () => {
    let callback = jest.fn()

    let store = new MutableSelectable({
      count: 0,
    })

    let sub = store.select((state) => state.count, callback)

    store.set((state) => {
      state.count++
      state.count++
    })

    sub()

    store.set((state) => {
      state.count++
    })

    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0, undefined)
    expect(callback).toBeCalledWith(2, 0)
  })
  it('Mutates values', () => {
    let callback = jest.fn()
    let state = { count: 0 }

    let store = new MutableSelectable(state)

    store.select((state) => state.count, callback)

    store.set((state) => {
      state.count++
    })

    expect(state.count).toEqual(1)
  })

  it('Runs immediately with equality assertions', () => {
    let callback = jest.fn()
    let state = { count: 0, likes: 0 }

    let store = new MutableSelectable(state)

    store.select(
      (state) => [state.count, state.likes],
      callback,
      shallowEqualArray
    )

    store.set((state) => {
      state.count++
      state.likes = 10
    })
    store.set((state) => {
      state.count = 1
      state.likes = 10
    })

    expect(state.count).toEqual(1)
    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith([0, 0], undefined)
    expect(callback).toBeCalledWith([1, 10], [0, 0])
  })
})

describe('Selectable', () => {
  it('Immediately calls handler when created', () => {
    let callback = jest.fn((arg) => {})

    let store = new Selectable({
      count: 0,
    })

    store.select((state) => state.count, callback)

    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith(0)
  })
  it('Cancels subscriptions', () => {
    let callback = jest.fn()

    let store = new Selectable({
      count: 0,
    })

    let unsub = store.select((state) => state.count, callback)

    store.set((state) => {
      state.count++
      state.count++
    })

    unsub()

    store.set((state) => {
      state.count++
    })

    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0, undefined)
    expect(callback).toBeCalledWith(2, 0)
  })
  it(`Doesn't mutate values`, () => {
    let state = { count: 0 }

    let store = new Selectable(state)

    store.set((state) => {
      state.count++
    })

    expect(state.count).toEqual(0)
  })
})
