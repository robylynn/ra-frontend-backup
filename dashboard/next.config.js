/** @type {import('next').NextConfig} */

require('next-ws/server');//.verifyPatch();

const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXTAUTH_SECRET: "sFB6I93i7B/l6eS/Y2JYYHEdQ93Oc4QfUQS+d+kp1Gs=",
    NEXTAUTH_URL: "http://localhost:3000",
  }
};

module.exports = nextConfig;
