/** @type {import('next').NextConfig} */

require('next-ws/server');//.verifyPatch();

const nextConfig = {
  reactStrictMode: false,
  env: {
    //NEXTAUTH_SECRET: "sFB6I93i7B/l6eS/Y2JYYHEdQ93Oc4QfUQS+d+kp1Gs=",
    // NEXTAUTH_URL: "http://localhost:3000",
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        name: 'static/[hash].worker.js',
        publicPath: '/_next/'
      }
    })

    // Overcome Webpack referencing `window` in chunks
    config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`

    return config
  }
};

module.exports = nextConfig;
