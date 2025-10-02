/** @type {import('next').NextConfig} */

// require('next-ws/server');//.verifyPatch();

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
                publicPath: '/_next/',
            },
        });

        // Overcome Webpack referencing `window` in chunks
        config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`;

        return config;
    },
    async headers() {
        return [
            {
                // Target the root of the proxied content specifically (to catch the redirect response)
                source: '/labelstudio_proxy',
                headers: [
                    { key: 'Content-Security-Policy', value: '' },
                    { key: 'Content-Security-Policy-Report-Only', value: '' },
                    { key: 'Cross-Origin-Opener-Policy', value: '' },
                ],
            },
            {
                // Apply these headers to the proxied Label Studio path
                source: '/labelstudio_proxy/:path*',
                // source: '/',
                headers: [
                    // 🛑 CRITICAL FIX: Explicitly remove the problematic header
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: '', // Setting it to 'unsafe-none' might override or disable it.
                    },
                    // Alternatively, try to explicitly set COEP to something safe
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: '', // This attempts to clear the CSP header
                    },
                    {
                        key: 'Content-Security-Policy-Report-Only',
                        value: '', // This attempts to clear the CSP header
                    },
                    // If the error persists, try clearing X-Content-Security-Policy as well
                    {
                        key: 'X-Content-Security-Policy',
                        value: '',
                    },
                    //   {
                    //     key: 'Content-Security-Policy',
                    //     // Note: This is an example to *loosen* the policy.
                    //     // You must ensure this value includes all sources Label Studio needs.
                    //     value: "default-src 'self' data:; " +
                    //            "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
                    //            "style-src 'self' 'unsafe-inline' https:; " + // Allow HTTPS for styles just in case
                    //            "connect-src 'self' wss: ws: http:; " + // Allow WebSockets and HTTP connections
                    //            "img-src 'self' data: http: https:; " + // Allow images from various sources
                    //            "frame-src 'self';" // If Label Studio uses an iframe itself

                    // },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            // Proxy requests starting with /api/proxy to the external server
            {
                source: '/labelstudio_proxy/:path*',
                // source: '/:path*',
                destination: 'http://localhost:8080/:path*', // <-- REPLACE with your target web server
            },
            // You can also proxy the root path, but be careful of conflicts
            // {
            //     source: '/data/:path*',
            //     destination: 'http://192.168.1.100:8080/:path*',
            // },
        ];
    },
};

module.exports = nextConfig;
