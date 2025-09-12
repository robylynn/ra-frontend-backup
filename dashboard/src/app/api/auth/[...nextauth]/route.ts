// Frontend Web Application for RA Products
// Developed by R2 Labs

import { handlers } from '@/auth';
import { NextRequest } from 'next/server';
// export const { GET, POST } = handlers;

// Function to dynamically set AUTH_URL based on incoming request headers
function setDynamicAuthUrl(req: NextRequest) {
    // Only set if AUTH_URL is not already explicitly defined (e.g., in .env.local)
    // This prioritizes explicit environment variables, then dynamic inference.
    if (!process.env.AUTH_URL) {
        const protocol = req.headers.get('x-forwarded-proto') || 'http'; // Default to http
        const host =
            req.headers.get('x-forwarded-host') || req.headers.get('host');

        if (host) {
            process.env.AUTH_URL = `${protocol}://${host}`;
            console.log(`[Dynamic AUTH_URL Set] to: ${process.env.AUTH_URL}`);
        } else {
            // Fallback if host headers are also missing (shouldn't happen for direct access)
            process.env.AUTH_URL = `http://localhost:${process.env.PORT || 3000}`;
            console.log(
                `[Dynamic AUTH_URL Fallback] to: ${process.env.AUTH_URL}`
            );
        }
    }
}

// Re-export the GET and POST handlers directly
export const { GET, POST } = {
    GET: async (req: NextRequest, res) => {
        setDynamicAuthUrl(req); // Set AUTH_URL before handlers process the request
        console.log('--- Incoming Request to Auth.js GET Handler ---');
        console.log('Request URL:', req.url);
        console.log('Headers Host:', req.headers.get('host'));
        console.log(
            'Headers X-Forwarded-Host:',
            req.headers.get('x-forwarded-host')
        );
        console.log(
            'Headers X-Forwarded-Proto:',
            req.headers.get('x-forwarded-proto')
        );
        console.log('--------------------------------------------------');
        return handlers.GET(req);
    },
    POST: async (req: NextRequest, res) => {
        setDynamicAuthUrl(req); // Set AUTH_URL before handlers process the request
        console.log('--- Incoming Request to Auth.js POST Handler ---');
        console.log('Request URL:', req.url);
        console.log('Headers Host:', req.headers.get('host'));
        console.log(
            'Headers X-Forwarded-Host:',
            req.headers.get('x-forwarded-host')
        );
        console.log(
            'Headers X-Forwarded-Proto:',
            req.headers.get('x-forwarded-proto')
        );
        console.log('---------------------------------------------------');
        return handlers.POST(req);
    },
};
