import { defineConfig } from 'vitepress'
export default defineConfig({
  title: 'AirLine Docs',
  description: 'Codebase & schema documentation',
  base: '/airline/',
  themeConfig: {
    nav: [{ text: 'Overview', link: '/codebase-overview' }],
    sidebar: [
      {
        text: 'Docs',
        items: [
          { text: 'Codebase Overview', link: '/codebase-overview' }
        ]
      }
    ],
    outline: { level: [2,3] },
    socialLinks: [{ icon: 'github', link: 'https://github.com/jbandu/airline' }]
  }
})
