// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxtjs/tailwindcss',
    'unplugin-icons/nuxt',
    '@vueuse/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/google-fonts',
    'nuxt-gtag'
  ],
  css: [
    '@/assets/base.scss'
  ],
  googleFonts: {
    families: {
      'Roboto Mono': [400, 500, 600, 700],
    }
  },
  gtag: {
    id: 'G-W10J4ZNTQY'
  },
  app: {
    head: {
      title: 'Gimme Money - PromptPay QR + Split The Bill',
      link: [
        { rel: 'icon', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'icon', sizes: '512x512', href: '/android-chrome-512x512.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'shortcut icon', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'manifest', href: `/manifest.json` },
      ],
      meta: [
        { name: 'description', content: 'Local-first PromptPay QR generator, plus, a split-the-bill function that runs locally' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'og:site_name', content: 'Gimme Money' },
        { name: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://gimme.netlify.app/ogimage.png' },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://gimme.netlify.app/ogimage.png' },
        { name: 'apple-mobile-web-app-title', content: 'Gimme Money' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
      ]
    }
  },
})