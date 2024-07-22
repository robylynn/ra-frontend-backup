/** @type {import('next').NextConfig} */

require('next-ws/server');//.verifyPatch();

const nextConfig = {
  env: {
    NEXTAUTH_SECRET: "sFB6I93i7B/l6eS/Y2JYYHEdQ93Oc4QfUQS+d+kp1Gs=",
    NEXTAUTH_URL: "http://localhost:3000",
    // NEXTAUTH_URL: "http://10.252.1.2",
  }
  // async rewrites() {
    
  //   // cookies().set('device_id', "testid");
    
  //   return [
  //     {
  //       source: '/devices/1',
  //       destination: 'http://10.252.1.10',
  //       //destination: 'http://www.google.com'
  //       basePath: false
  //     },
  //     // {
  //     //   source: '/api/socket2/',
  //     //   destination: 'http://127.0.0.1:8000/streams/socket'
  //     // }
  //     // {
  //     //   source: "/api/socket'
  //     // }
  //     // {
  //     //   source: '/devices/1:slug',
  //     //   destination: 'http://10.252.1.10/:slug'
  //     //   //destination: 'http://www.google.com'
  //     // },
  //     // {
  //     //   source: '/static/js/bundle.js',
  //     //   destination: 'http://10.252.1.10/static/js/bundle.js'
  //     //   //destination: 'http://www.google.com'
  //     // },
  //     // {
  //     //   source: '/manifest.json',
  //     //   destination: 'http://10.252.1.10/manifest.json'
  //     //   //destination: 'http://www.google.com'
  //     // },
  //     // {
  //     //   source: '/logo192.png',
  //     //   destination: 'http://10.252.1.10/logo192.png'
  //     //   //destination: 'http://www.google.com'
  //     // }

  //   ]
  // }
};

module.exports = nextConfig;
