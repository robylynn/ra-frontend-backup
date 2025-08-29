// app/auth/signin/actions.ts
'use server'; // <--- This directive marks the file as a Server Action

import { signIn } from '@/auth'; // Import the server-side `signIn` helper from your auth.ts
import { redirect } from 'next/navigation'; // For server-side redirects

// Explicitly define the SignInResponse interface for clarity,
// though the server-side `signIn` behavior is slightly different.
interface ServerSignInResponse {
    error?: string;
    ok?: boolean;
    url?: string | null;
}

export async function signInAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const csrfToken = formData.get('csrfToken') as string; // CSRF token is still sent by the form

    console.log('[Server Action] Attempting sign-in for user:', username);

    try {
        // Call the server-side signIn() helper.
        // It's crucial to pass `redirect: false` here to handle redirects manually
        // via `next/navigation` for fine-grained control and error handling.
        const result = (await signIn('credentials', {
            username,
            password,
            csrfToken, // CSRF token is passed directly in the server action
            redirect: false, // Prevent Auth.js from doing an automatic redirect
            callbackUrl: '/', // Default callback URL
        })) as ServerSignInResponse | undefined; // Cast to our interface

        if (!result) {
            console.error(
                '[Server Action] signIn() returned undefined result.'
            );
            redirect('/auth/signin?error=SignInError'); // Redirect to login with generic error
        }

        if (result.error) {
            console.error(
                '[Server Action] Authentication failed:',
                result.error
            );
            // Redirect back to the sign-in page with the error message
            redirect(`/auth/signin?error=${encodeURIComponent(result.error)}`);
        }

        if (result.ok && result.url) {
            console.log(
                '[Server Action] Authentication successful. Redirecting to:',
                result.url
            );
            // On success, redirect to the URL provided by Auth.js
            redirect(result.url);
        } else {
            console.error(
                '[Server Action] signIn() returned unexpected result:',
                result
            );
            redirect('/auth/signin?error=UnknownAuthError');
        }
    } catch (error: any) {
        // The `redirect()` function from 'next/navigation' internally throws a `NEXT_REDIRECT` error.
        // We catch it here to prevent logging it as a genuine server error, then re-throw it
        // so Next.js can perform the actual HTTP redirect.
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            console.log(
                '[Server Action] Redirect initiated by Next.js. This is expected behavior.'
            );
            throw error; // Re-throw the NEXT_REDIRECT error
        }

        console.error(
            '[Server Action] Error during server-side sign-in action:',
            error
        );
        // For any other unexpected errors during the process, redirect with an error
        redirect(
            `/auth/signin?error=${encodeURIComponent('An unexpected error occurred during sign-in.')}`
        );
    }
}
