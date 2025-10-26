import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AirLine Docs',
  description: 'Codebase & schema documentation',
  base: '/airline/', // REQUIRED for GitHub Pages since repo name != username.github.io
  themeConfig: {
    nav: [
      { text: 'Overview', link: '/codebase-overview' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Codebase Overview', link: '/codebase-overview' }
        ]
      }
    ],
    outline: { level: [2,3] },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jbandu/airline' }
    ]
  }
})
