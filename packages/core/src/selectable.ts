import { produce, createDraft, finishDraft, nothing } from "immer"
import { MutableSelectable } from "./mutable-selectable"
import { Callback } from "./types"

export class Selectable<T> extends MutableSelectable<T> {
  set(
    updater: Callback<
      T,
      T extends undefined
        ? T | undefined | void | typeof nothing
        : T | undefined | void
    >
  ) {
    const draft =
      typeof this.state === "object"
        ? createDraft(this.state as any)
        : this.state

    let original = this.state
    this.state = draft as T

    /**
     * When the updater is called it can:
     * - return a new state
     * - modify the draft and return undefined
     */
    let change = updater(draft)

    const producedResult = finishDraft(draft)

    if (change || producedResult !== original) {
      if (change === undefined) {
        change = producedResult
      }
      if (change === nothing) {
        // @ts-ignore
        change = undefined
      }
      this.state = change as T
      this.version++
      this.flush()
    } else {
      this.state = original
    }
  }
}
