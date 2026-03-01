export default defineConfig({
  title: "如云烟 | Backend Engineer",
  description: "Distributed Systems | JVM Internals | RPC",

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'RPC', link: '/rpc/' },
      { text: '调度系统', link: '/scheduler/' },
      { text: 'Saga事务', link: '/saga/' },
      { text: 'Learn', link: '/learn/' },
      { text: '网关', link: '/gateway/' },	
    ],

    sidebar: {
      '/rpc/': [
        {
          text: 'RPC 框架设计',
          items: [
            { text: '整体架构', link: '/rpc/architecture' },
            { text: '协议设计', link: '/rpc/protocol' }
          ]
        }
      ]
    }
  }
})