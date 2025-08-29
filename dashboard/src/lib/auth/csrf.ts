// lib/auth/csrf.ts
import { cookies } from 'next/headers';

/**
 * Manually extracts the CSRF token from Auth.js cookies in a Server Component context.
 * This is a workaround for next-auth@5.0.0-beta.18 where @auth/nextjs/server/getCsrfToken
 * might not be functioning as expected.
 * * In stable versions of Auth.js, it's recommended to use the official `getCsrfToken` helper
 * from `@auth/nextjs/server` directly when it's fixed.
 * * @returns The CSRF token string, or null if not found or an error occurs.
 */
export async function getCsrfTokenFromServer(): Promise<string | null> {
    let csrfToken: string | null = null;
    try {
        const cookieStore = cookies();
        // Auth.js typically uses __Host-next-auth.csrf-token in production (secure contexts)
        // and next-auth.csrf-token in development. Check both.
        const csrfCookie =
            cookieStore.get('__Host-next-auth.csrf-token') ||
            cookieStore.get('next-auth.csrf-token');

        if (csrfCookie && csrfCookie.value) {
            // The CSRF token is usually the first part before a '|'
            csrfToken = csrfCookie.value.split('|')[0];
        } else {
            console.warn(
                'CSRF cookie not found or empty during manual extraction.'
            );
        }
    } catch (e) {
        console.error('Error manually extracting CSRF token from cookies:', e);
    }
    return csrfToken;
}
