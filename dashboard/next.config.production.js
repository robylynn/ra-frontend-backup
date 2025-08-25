/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    //NEXTAUTH_SECRET: "sFB6I93i7B/l6eS/Y2JYYHEdQ93Oc4QfUQS+d+kp1Gs=",
    // NEXTAUTH_URL: "http://localhost:80",
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
