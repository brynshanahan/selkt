import { Sandpack, SandpackConsole } from "@codesandbox/sandpack-react"
import core from "../../packages/core/package.json"
import react from "../../packages/react/package.json"

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackCodeViewer,
  SandpackPreview,
} from "@codesandbox/sandpack-react"

function LogPreview(props) {
  return (
    <SandpackProvider {...props}>
      <SandpackLayout>
        <SandpackCodeEditor />
        <SandpackPreview style={{ display: "none" }} />
      </SandpackLayout>
      <SandpackConsole resetOnPreviewRestart />
    </SandpackProvider>
  )
}

export const mutableSelectableExample1 = (
  <LogPreview
    options={{
      showTabs: false,
      showConsole: true,
    }}
    customSetup={{
      entry: "/index.ts",
      dependencies: {
        "@selkt/core": core.version,
      },
    }}
    files={{
      "/index.ts": /* tsx */ `import { MutableSelectable } from "@selkt/core"

console.clear()

const myStore = new MutableSelectable({
  username: "",
  password: "",
})

const listener = (username) => console.log(username)

myStore.select(
  (state) => state.username,
  listener // runs immediately with ""
)

myStore.set((state) => {
  state.username = "John"
})

// listener reruns with "John"`,
    }}
  />
)

export const playground = (
  <Sandpack
    template="react-ts"
    options={{
      showTabs: true,
      showConsole: true,
    }}
    customSetup={{
      dependencies: {
        "@selkt/core": core.version,
        "@selkt/react": react.version,
        immer: "latest",
        react: "latest",
        "react-dom": "latest",
      },
    }}
    files={{
      "/App.tsx": /* tsx */ `import { 
  MutableSelectable, 
  Selectable, 
  strictEqual,
  shallowEqualArray,
  shallowEqual,
  deepEqual,
} from "@selkt/core"
import { useSelectable } from "@selkt/react"
import React from 'react'
import ReactDOM from 'react-dom/client'

console.clear()

const store = new Selectable({
  username: ''
})

store.select(
  state => state.username, 
  username => {
    console.log(username)
  }
)

export default function App  ()  {
  const username = useSelectable(store, state => state.username)
  return (
    <input 
      value={username} 
      onChange={
        event => {
          let value = event.target.value
          store.set(state => {
            state.username = value
          })
        }
      }
    />
  )
}
`,
    }}
  ></Sandpack>
)
