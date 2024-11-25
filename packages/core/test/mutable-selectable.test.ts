import { nothing } from "immer"
import {
  deepEqual,
  MutableSelectable,
  Selectable,
  shallowEqual,
  shallowEqualArray,
} from "../src"

describe("equalityChecks", () => {
  test("deepEqual checks correctly", () => {
    expect(
      deepEqual({ a: { b: { c: true } } }, { a: { b: { c: true } } })
    ).toBe(true)
    expect(
      deepEqual({ a: { b: { c: false } } }, { a: { b: { c: true } } })
    ).toBe(false)
    expect(deepEqual([{}], [{}])).toBe(true)
    expect(deepEqual({}, undefined)).toBe(false)
    expect(deepEqual({}, { test: true })).toBe(false)
  })

  test("shallowEqualArray checks correctly", () => {
    const a = {}
    // @ts-ignore hmm not ideal
    expect(shallowEqualArray(false, "")).toBe(true)
    // @ts-ignore
    expect(shallowEqualArray([1, 2, 3], false)).toBe(false)
    expect(shallowEqualArray([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(shallowEqualArray([], [1, 2, 3])).toBe(false)
    expect(shallowEqualArray([a], [a])).toBe(true)
    expect(shallowEqualArray([{}], [{}])).toBe(false)
    expect(shallowEqualArray([true, false], [false, true])).toBe(false)
    expect(shallowEqualArray([true, true], [false, true], 1)).toBe(true)
  })

  test("shallowEqual checks correctly", () => {
    expect(shallowEqual({}, {})).toBe(true)
    // @ts-ignore
    expect(shallowEqual("", undefined)).toBe(false)
    expect(shallowEqual({}, undefined)).toBe(false)
    expect(shallowEqual(undefined, {})).toBe(false)
    expect(shallowEqual({ a: true }, { a: true })).toBe(true)
    expect(shallowEqual({ a: false, test: false }, { a: true })).toBe(false)
    expect(shallowEqual({ a: false, test: false }, undefined)).toBe(false)
  })
})

describe("MutableSelectable", () => {
  it("Immediately calls handler when created", () => {
    let callback = jest.fn()

    let store = new MutableSelectable({
      count: 0,
    })

    store.select((state) => state.count, callback)

    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith(0, undefined)
  })

  it("replaces state when returning a new value", () => {
    let callback = jest.fn()

    const initialState = {
      count: 0,
    }
    let store = new MutableSelectable(initialState)

    store.select((state) => state.count, callback)

    const nextState = {
      count: 1,
    }
    store.set((state) => nextState)

    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0, undefined)
    expect(callback).toBeCalledWith(1, 0)
  })

  it("Accepts different equality functions", () => {
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
  it(`can force an update`, () => {
    let callback = jest.fn()

    let store = new MutableSelectable({
      count: 0,
    })

    const listener = store.select((state) => state.count, callback)

    store.set((state) => {
      state.count++
    })

    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0, undefined)
    expect(callback).toBeCalledWith(1, 0)

    store.state.count++
    listener.update()

    expect(callback).toBeCalledTimes(3)
    expect(callback).toBeCalled
  })
  it("Cancels subscriptions", () => {
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
  it("Mutates values", () => {
    let callback = jest.fn()
    let state = { count: 0 }

    let store = new MutableSelectable(state)

    store.select((state) => state.count, callback)

    store.set((state) => {
      state.count++
    })

    expect(state.count).toEqual(1)
  })

  it("Runs immediately with equality assertions", () => {
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

  it("Uses default check when passed undefined as an equalityCheck", () => {
    let store = new MutableSelectable({ test: 0 })
    let callback = jest.fn(() => console.log("test"))

    store.select((state) => state.test, callback, undefined)

    expect(callback).toBeCalledTimes(1)

    store.set((state) => {
      state.test = 1
    })

    expect(callback).toBeCalledTimes(2)
  })

  it("Respects equality functions", () => {
    let callback = jest.fn()
    let state = { count: 0, likes: 0, users: [{ id: 1 }, { id: 2 }] }

    let store = new MutableSelectable(state)

    const firstListener = store.select(
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

    firstListener()
    expect(state.count).toEqual(1)
    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith([0, 0], undefined)
    expect(callback).toBeCalledWith([1, 10], [0, 0])

    const secondCallback = jest.fn()

    store.select(
      (state) => state.users.map((user) => user.id),
      secondCallback,
      (a, b) => {
        const same = shallowEqualArray(a, b)
        console.log({ a, b, same })
        return same
      }
    )

    store.set((state) => {
      state.users = []
    })

    // this update is ignored
    store.set((state) => {
      state.users = []
    })

    store.set((state) => {
      state.users = [{ id: 1 }, { id: 2 }]
    })

    store.set((state) => {
      state.users = [{ id: 1 }, { id: 2 }]
    })

    // select is called immediately
    expect(secondCallback).toBeCalledTimes(3)
    expect(secondCallback).toBeCalledWith([1, 2], undefined)
    expect(secondCallback).toBeCalledWith([], [1, 2])
  })

  it("Sets state to undefined when returning 'nothing'", () => {
    let callback = jest.fn()
    let state = { count: 0 }

    let store = new MutableSelectable<typeof state | undefined>(state)

    store.select((state) => state?.count, callback)

    store.set(() => nothing)

    expect(store.state).toEqual(undefined)
    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0, undefined)
    expect(callback).toBeCalledWith(undefined, 0)
  })

  it("only flushes once when nesting flush calls", () => {
    let callback = jest.fn()
    let state = { count: 0, likes: 0, users: [{ id: 1 }, { id: 2 }] }

    let store = new MutableSelectable(state)

    const listener = store.select((state) => state, callback)

    store.flush(() => {
      store.set((state) => {
        state.likes++
      })

      store.set((state) => {
        state.count++
      })

      store.set((state) => {
        state.users.push({ id: 3 })
      })
    })

    expect(store.state).toEqual({
      count: 1,
      likes: 1,
      users: [{ id: 1 }, { id: 2 }, { id: 3 }],
    })
    expect(callback).toBeCalledTimes(1)
    listener()
  })
})

describe("Selectable", () => {
  it("Immediately calls handler when created", () => {
    let callback = jest.fn((arg) => {})

    let store = new Selectable({
      count: 0,
    })

    store.select((state) => state.count, callback)

    expect(callback).toBeCalledTimes(1)
    expect(callback).toBeCalledWith(0)
  })
  it("allows you to mutate store.state without using the value in the callback", () => {
    let callback = jest.fn((arg) => {})

    let store = new Selectable({
      count: 0,
    })

    store.select((state) => state.count, callback)

    store.set(() => {
      store.state.count++
    })

    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0)
    expect(callback).toBeCalledWith(1)
  })
  it("Cancels subscriptions", () => {
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
  it("only flushes once when nesting flush calls", () => {
    let callback = jest.fn()
    let state = { count: 0, likes: 0, users: [{ id: 1 }, { id: 2 }] }

    let store = new Selectable(state)

    store.select((state) => state, callback)
    expect(callback).toBeCalledTimes(1)

    store.flush(() => {
      store.set((state) => {
        state.likes++
      })

      store.set((state) => {
        state.count++
      })

      store.set((state) => {
        state.users.push({ id: 3 })
      })
    })

    expect(store.state).toEqual({
      count: 1,
      likes: 1,
      users: [{ id: 1 }, { id: 2 }, { id: 3 }],
    })
    expect(callback).toBeCalledTimes(2)
  })

  it("changes in a running flush should trigger a new update", () => {
    let callback = jest.fn((val) => {})

    let state = { count: 0 }

    let store = new Selectable(state)

    store.select((state) => state.count, callback)

    let divisibleByTwoCallback = jest.fn((divisibleByTwo) => {
      if (divisibleByTwo) {
        store.set((state) => {
          state.count++
        })
      }
    })

    store.select(
      (state) => state.count % 2 === 0 && state.count !== 0,
      divisibleByTwoCallback
    )

    expect(callback).toBeCalledTimes(1)

    store.set((state) => {
      state.count++
    })
    store.set((state) => {
      state.count++
    })

    expect(store.state).toEqual({
      count: 3,
    })
    expect(callback).toBeCalledTimes(4)

    store.flush(() => {
      store.set((state) => {
        state.count++
      })
      expect(callback).toBeCalledTimes(4)

      store.set((state) => {
        state.count++
        state.count++
      })
      expect(callback).toBeCalledTimes(4)
    })

    expect(store.state).toEqual({
      count: 7,
    })
    expect(callback).toBeCalledWith(7)
    expect(callback).toBeCalledTimes(6)
  })

  it("doesn't run updates when returning undefined and nothing was modified", () => {
    let callback = jest.fn()
    let state: any = { value: 1 }

    let store = new Selectable(state)

    store.select(
      (state) => state.value,
      (a, b) => callback(a, b)
    )
    expect(callback).toBeCalledTimes(1)

    store.set((state) => {
      state.value = 1
    })

    expect(store.state).toEqual({ value: 1 })
    expect(callback).toBeCalledTimes(1)
    expect(callback).toHaveBeenNthCalledWith(1, state.value, undefined)
  })

  it("Sets state to undefined when returning 'nothing'", () => {
    let callback = jest.fn()
    let state = { count: 0 }

    let store = new Selectable<typeof state | undefined>(state)

    store.select((state) => state?.count, callback)

    store.set(() => nothing)

    expect(store.state).toEqual(undefined)
    expect(callback).toBeCalledTimes(2)
    expect(callback).toBeCalledWith(0, undefined)
    expect(callback).toBeCalledWith(undefined, 0)
  })

  it("runs updates when returning undefined", () => {
    let callback = jest.fn()
    let state: any = { value: {} }

    let store = new Selectable(state)

    store.select(
      (state) => state.value,
      (a, b) => callback(a, b)
    )
    expect(callback).toBeCalledTimes(1)

    store.set((state) => {
      state.value = undefined
    })

    expect(store.state).toEqual({ value: undefined })
    expect(callback).toBeCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, state.value, undefined)
    expect(callback).toHaveBeenNthCalledWith(2, undefined, state.value)
  })
})
