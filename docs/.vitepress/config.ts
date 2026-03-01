import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'haoyunlai-123',
  description: 'Personal Tech Blog',
  base: '/', // 你的站点是 username.github.io，必须是 /

  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ]
  },
  markdown: {
  html: false
  }
})