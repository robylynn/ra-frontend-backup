// app/auth/register/actions.ts
'use server'; // Marks this file as containing Server Actions

import { signIn } from '@/auth'; // Import the server-side signIn helper (to auto-login after registration)
import { cookies } from 'next/headers'; // To manually get the CSRF token if needed by the backend
import { redirect } from 'next/navigation'; // For server-side redirects

interface RegisterResponse {
    success: boolean;
    message: string;
    data?: any;
}

export async function registerAction(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    // Note: For registration, the backend might also expect a CSRF token,
    // but it's typically handled by the Auth.js /api/auth/csrf route.
    // If your custom backend registration endpoint requires a specific CSRF token,
    // you might need to extract it from `formData` and include it in the backend request headers/body.
    // For this example, we assume the backend handles its own CSRF or it's not required for a direct API call.
    // const csrfToken = formData.get('csrfToken') as string;

    console.log('[Server Action] Attempting user registration for:', username);

    try {
        let backendApiHost = process.env.CONTROLLER_URI;
        if (!backendApiHost) {
            // Dynamically infer backend host if CONTROLLER_URI isn't set
            const cookieStore = cookies(); // Access cookies to get request headers info
            const hostHeader =
                cookieStore.get('x-forwarded-host')?.value ||
                cookieStore.get('host')?.value;
            backendApiHost = hostHeader ? hostHeader : `localhost:8000`;
        }
        const backendApiUrl = `http://${backendApiHost}`; // Assuming HTTP for backend

        const res = await fetch(`${backendApiUrl}/auth/register`, {
            // Assuming a /auth/register endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Assuming your registration endpoint expects JSON
            },
            body: JSON.stringify({
                username,
                password,
                // Include other registration fields as needed
            }),
        });

        const register_response: RegisterResponse = await res.json();

        if (!res.ok || !register_response.success) {
            console.error(
                '[Server Action] Backend registration failed:',
                register_response.message
            );
            // Redirect back to the registration page with the error message
            redirect(
                `/auth/register?error=${encodeURIComponent(register_response.message || 'Registration failed.')}`
            );
        }

        console.log(
            '[Server Action] User registered successfully. Attempting to sign in...'
        );

        // If registration is successful, automatically sign in the user
        // We reuse the signIn helper, similar to your login action
        const signInResult = (await signIn('credentials', {
            username,
            password,
            redirect: false, // Prevent automatic redirect from signIn()
            callbackUrl: '/', // Default redirect after successful registration and login
        })) as { error?: string; url?: string | null } | undefined;

        if (signInResult?.error) {
            console.error(
                '[Server Action] Auto-login failed after registration:',
                signInResult.error
            );
            redirect(
                `/auth/signin?error=${encodeURIComponent(signInResult.error)}`
            ); // Redirect to sign-in on auto-login failure
        } else if (signInResult?.url) {
            console.log(
                '[Server Action] Auto-login successful. Redirecting to:',
                signInResult.url
            );
            redirect(signInResult.url); // Redirect to the intended page after login
        } else {
            console.error(
                '[Server Action] Auto-login returned an unexpected result after registration.'
            );
            redirect('/auth/signin?error=AutoLoginFailed'); // Fallback if auto-login gives weird result
        }
    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            // This is the expected behavior when `redirect()` is called
            console.log(
                '[Server Action] Redirect initiated by Next.js during registration process.'
            );
            throw error; // Re-throw to allow Next.js to handle the redirect
        }
        console.error(
            '[Server Action] Unexpected error during registration:',
            error
        );
        redirect(
            `/auth/register?error=${encodeURIComponent('An unexpected error occurred.')}`
        );
    }
}
