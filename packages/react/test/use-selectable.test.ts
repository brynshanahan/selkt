import { useSelectable } from "../src/use-selectable";
import { MutableSelectable } from "../../core/src/mutable-selectable";
import { Selectable } from "../../core/src/selectable";
import { act, renderHook } from "@testing-library/react-hooks";
import { render, waitFor } from "@testing-library/react";
import { createElement } from "react";

describe(`useSelectable`, () => {
  it("subscribes and unsubscribes from a mutableStore", () => {
    const initialState = { test: undefined };
    const store = new MutableSelectable<{ test?: number }>(initialState);
    const selector = jest.fn((state) => state.test);

    const { result, unmount } = renderHook(() =>
      useSelectable(store, selector)
    );

    expect(selector).toBeCalledTimes(4);

    expect(result.current).toBe(undefined);

    act(() => {
      store.set((state) => {
        state.test = 1;
      });
    });

    expect(selector).toBeCalledTimes(7);
    expect(result.current).toBe(1);
    expect(store.state).toBe(initialState);

    unmount();
    act(() => {
      store.set((state) => {
        state.test = 2;
      });
    });

    expect(selector).toBeCalledTimes(7);
  });

  it("subscribes and unsubscribes from a immutable store", () => {
    const initialState = { test: undefined };
    const store = new Selectable<{ test?: number }>(initialState);
    const selector = jest.fn((state) => state.test);

    const { result, unmount } = renderHook(() =>
      useSelectable(store, selector)
    );

    expect(selector).toBeCalledTimes(4);

    expect(result.current).toBe(undefined);

    act(() => {
      store.set((state) => {
        state.test = 1;
      });
    });

    expect(selector).toBeCalledTimes(7);
    expect(result.current).toBe(1);
    expect(store.state).not.toBe(initialState);

    unmount();
    act(() => {
      store.set((state) => {
        state.test = 2;
      });
    });

    expect(selector).toBeCalledTimes(7);
  });

  it("renders a component with updated state", () => {
    const store = new Selectable({ test: 0 });
    const selector = jest.fn((state) => state.test);
    const ExampleComponent = () => {
      const state = useSelectable(store, selector);

      return createElement("div", {}, state);
    };

    const { container, unmount } = render(createElement(ExampleComponent, {}));

    expect(container).toBeTruthy();
    expect(container.querySelector("div")?.textContent).toBe("0");

    act(() => {
      store.set((state) => {
        state.test = 1;
      });
    });

    expect(selector).toBeCalledTimes(7);
    expect(container.querySelector("div")?.textContent).toBe("1");

    unmount();

    act(() => {
      store.set((state) => {
        state.test = 2;
      });
    });

    expect(selector).toBeCalledTimes(7);
  });
});
