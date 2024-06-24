import { createProxyMiddleware } from "http-proxy-middleware";
import { NextApiRequest, NextApiResponse } from "next";

// const proxy = createProxyMiddleware("/api/proxy/**", {
//   target: process.env.BACKEND_URL,
//   ws: true, // enable proxying WebSockets
//   pathRewrite: { "^/api/proxy": "" }, // remove `/api/proxy` prefix
// });

const proxy = createProxyMiddleware({
    // target: process.env.BACKEND_URL,
    target: process.env.CONTROLLER_URI,
    ws: true, // enable proxying WebSockets
    // pathRewrite: { "^/api/socket": "ws" }, // remove `/api/proxy` prefix
    pathRewrite: { "^/api/socket": "/streams/socket" }, // remove `/api/proxy` prefix
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //return res;
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
    bodyParser: false,
  },
};
