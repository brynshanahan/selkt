import React from "react"
import { DocsThemeConfig } from "nextra-theme-docs"
import { useRouter } from "next/router"

const config: DocsThemeConfig = {
  logo: <span>@selkt</span>,
  project: {
    link: "https://github.com/brynshanahan/selkt",
  },
  footer: {
    text: "Nextra Docs Template",
  },
  useNextSeoProps() {
    const { asPath } = useRouter()

    if (asPath !== "/") {
      return {
        titleTemplate: "%s | @selkt",
      }
    }
  },
}

export default config
