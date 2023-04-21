import React from "react"
import { useSelectable } from "../src/use-selectable"
import { MutableSelectable } from "@selkt/core/src/mutable-selectable"
import { Selectable } from "@selkt/core/src/selectable"
import { act, render, waitFor } from "@testing-library/react"
import { createElement } from "react"
import { shallowEqualArray } from "@selkt/core/src"
import { ReactDOM } from "react"
import { renderToString } from "react-dom/server"
import { SelectableInterface } from "@selkt/core"

function SubscribeStore(props: {
  store: SelectableInterface<{ test?: number }>
  selector: (state: { test?: number }) => number | undefined
}) {
  const value = useSelectable(props.store, props.selector)
  return <div>{String(value)}</div>
}

function Mounted({ mounted = false, children }: any) {
  return <>{mounted && children}</>
}

describe(`useSelectable`, () => {
  it("subscribes and unsubscribes from a mutableStore", () => {
    const initialState = { test: undefined }
    const store = new MutableSelectable<{ test?: number }>(initialState)
    const selector = jest.fn((state) => state.test)

    render(<SubscribeStore store={store} selector={selector} />)

    expect(selector).toBeCalledTimes(1)

    let div = document.querySelector("div")!

    expect(div.textContent).toBe("undefined")

    act(() => {
      store.set((state) => {
        state.test = 1
      })
    })

    expect(selector).toBeCalledTimes(3)
    expect(div.textContent).toBe("1")
    expect(store.state).toBe(initialState)

    act(() => {
      store.set((state) => {
        state.test = 2
      })
    })

    expect(selector).toBeCalledTimes(5)

    expect(div.textContent).toBe("2")
    expect(store.state).toBe(initialState)
  })

  it("subscribes and unsubscribes from a immutable store", () => {
    const initialState = { test: undefined }
    const store = new Selectable<{ test?: number }>(initialState)
    const selector = jest.fn((state) => state.test)
    const { unmount } = render(
      <SubscribeStore store={store} selector={selector} />
    )

    expect(selector).toBeCalledTimes(1)
    const div = document.querySelector("div")!

    expect(div.textContent).toBe("undefined")

    act(() => {
      store.set((state) => {
        state.test = 1
      })
    })

    expect(selector).toBeCalledTimes(3)
    expect(div.textContent).toBe("1")
    expect(store.state).not.toBe(initialState)

    unmount()
    act(() => {
      store.set((state) => {
        state.test = 2
      })
    })

    expect(selector).toBeCalledTimes(3)
  })

  it("hydrates", () => {
    const store = new Selectable({ test: 0 })

    const content = renderToString(
      <SubscribeStore store={store} selector={(state) => state.test} />
    )

    const root = document.createElement("root")

    root.innerHTML = content

    render(<SubscribeStore store={store} selector={(state) => state.test} />, {
      container: root,
      hydrate: true,
    })
  })

  it("renders a component with updated state", () => {
    const store = new Selectable({ test: 0 })
    const selector = jest.fn((state) => state.test)
    const ExampleComponent = () => {
      const state = useSelectable(store, selector)

      return <div>{state}</div>
    }

    const { container, unmount } = render(<ExampleComponent />)

    expect(container).toBeTruthy()
    expect(container.querySelector("div")?.textContent).toBe("0")

    act(() => {
      store.set((state) => {
        state.test = 1
      })
    })

    expect(selector).toBeCalledTimes(3)
    expect(container.querySelector("div")?.textContent).toBe("1")

    unmount()

    act(() => {
      store.set((state) => {
        state.test = 2
      })
    })

    expect(selector).toBeCalledTimes(3)
  })

  it("respects equality functions", () => {
    const store = new Selectable({ test: [] as { id: number }[] })
    const selector = jest.fn((state) => state.test.map((user: any) => user.id))

    const onRender = jest.fn()

    const ExampleComponent = () => {
      const state = useSelectable(store, selector, shallowEqualArray)
      onRender(state)

      return createElement("div", {}, state[0])
    }

    const { container, unmount } = render(createElement(ExampleComponent, {}))

    expect(container).toBeTruthy()
    expect(container.querySelector("div")?.textContent).toBe("")

    expect(onRender).toBeCalledTimes(1)

    act(() => {
      store.set((state) => {
        state.test = []
      })
    })

    expect(onRender).toBeCalledTimes(1)

    expect(selector).toBeCalledTimes(2)
    expect(container.querySelector("div")?.textContent).toBe("")

    act(() => {
      store.set((state) => {
        state.test = [{ id: 1 }, { id: 2 }]
      })
    })

    expect(onRender).toBeCalledTimes(2)

    expect(selector).toBeCalledTimes(4)
    expect(container.querySelector("div")?.textContent).toBe("1")

    unmount()

    act(() => {
      store.set((state) => {
        state.test = [{ id: 2 }]
      })
    })

    expect(selector).toBeCalledTimes(4)
  })

  it("Picks out the right value", () => {
    const store = new Selectable({ test: { value: 0 } })

    const ExampleComponent = () => {
      const state = useSelectable(store, (state) => state.test.value)

      return createElement("div", {}, state)
    }

    const { container, unmount } = render(createElement(ExampleComponent, {}))

    expect(container).toBeTruthy()
    expect(container.querySelector("div")?.textContent).toBe("0")

    act(() => {
      store.set((state) => {
        state.test.value++
      })
    })

    expect(container.querySelector("div")?.textContent).toBe("1")

    act(() => {
      store.set((state) => {
        state.test.value++
      })
    })

    expect(container.querySelector("div")?.textContent).toBe("2")

    act(() => {
      store.set((state) => {
        state.test.value = 3
      })
    })

    expect(container.querySelector("div")?.textContent).toBe("3")
  })
})
