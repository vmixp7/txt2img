/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    prodApiHost: 'http://wa59lhsdapi.sexygirl.ai:7860',
    devApiHost: 'http://111.185.143.98:8188',
    googleApiKey: 'AIzaSyC4KNhzUBgTdjICbZY4U7Ni3gkL7Jm4oVs',
    firebase: {
      apiKey: 'AIzaSyC4KNhzUBgTdjICbZY4U7Ni3gkL7Jm4oVs',
      authDomain: "txt2img-c11dc.firebaseapp.com",
      projectId: "txt2img-c11dc",
      storageBucket: "txt2img-c11dc.appspot.com",
      messagingSenderId: "871308186906",
      appId: "1:871308186906:web:bbc726123522060766c8a3",
      measurementId: "G-4939Y3NK3S"
    }
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "replicate.com",
      "replicate.delivery",
      "user-images.githubusercontent.com",
      "111.185.143.98",
    ],
  },
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/replicate/paint-by-text",
        permanent: false,
      },
      {
        source: "/deploy",
        destination: "https://vercel.com/templates/next.js/paint-by-text",
        permanent: false,
      },
    ]
  }
};

module.exports = nextConfig;
