import { createProxyMiddleware } from "http-proxy-middleware";
import { NextApiRequest, NextApiResponse } from "next";

// const proxy = createProxyMiddleware("/api/proxy/**", {
//   target: process.env.BACKEND_URL,
//   ws: true, // enable proxying WebSockets
//   pathRewrite: { "^/api/proxy": "" }, // remove `/api/proxy` prefix
// });

// const simpleRequestLogger = (proxyServer, options) => {
//   proxyServer.on('proxyReq', (proxyReq, req, res) => {
//     console.log(`[HPM] [${req.method}] ${req.url}`); // outputs: [HPM] GET /users
//   });
// },

const proxy = createProxyMiddleware({
    // target: process.env.BACKEND_URL,
    target: "http://127.0.0.1:8000",
    ws: true, // enable proxying WebSockets
    // pathRewrite: { "^/api/socket": "ws" }, // remove `/api/proxy` prefix
    //pathRewrite: { "^/api/socket2": "ws://" + process.env.CONTROLLER_URI + "/streams/socket" }, // remove `/api/proxy` prefix
    pathRewrite: { "^/api/socket2": "/streams/socket" }, // remove `/api/proxy` prefix
    // logLevel: 'debug',
    secure: false,
    changeOrigin: true,
    // plugins: [simpleRequestLogger],
    // logger: 'console',
    // on: {
    //   proxyReq: () => {console.log("req")},
    //   // proxyRes: () => {console.log("res")},
    //   // proxyRes: (res) => {
    //   //   // if upgrade event isn't going to happen, close the socket
    //   //   if (!res.upgrade && socket.readyState === socket.OPEN) {
    //   //     socket.write(createHttpHeader('HTTP/' + res.httpVersion + ' ' + res.statusCode + ' ' + res.statusMessage, res.headers));
    //   //     res.pipe(socket);
    //   //   }
    //   // },
    //   error: () => {console.log("error")},
    //   proxyReqWs: (p) => {console.log("ws")},
    // }
  });

  // server.on('upgrade', proxy.upgrade);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //return res;
  console.log("socket2");
  proxy(req, res, (err) => {
    if (err) {
      throw err;
    }

    throw new Error(`Local proxy received bad request for ${req.url}`);
  });
}

export const config = {
  api: {
    // Proxy middleware will handle requests itself, so Next.js should
    // ignore that our handler doesn't directly return a response
    externalResolver: true,
    // Pass request bodies through unmodified so that the origin API server
    // receives them in the intended format
    //bodyParser: false,

    bodyParser: false,
  },
};

export var proxyOpts = {
  logLevel: 'debug',
}