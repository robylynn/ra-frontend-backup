// // app/auth/signin/actions.ts
// 'use server'; // <--- This directive marks the file as a Server Action

// import { signIn } from '@/auth'; // Import the server-side `signIn` helper from your auth.ts
// import { redirect } from 'next/navigation'; // For server-side redirects

// // Explicitly define the SignInResponse interface for clarity,
// // though the server-side `signIn` behavior is slightly different.
// interface ServerSignInResponse {
//     error?: string;
//     ok?: boolean;
//     url?: string | null;
// }

// export async function signInAction(formData: FormData) {
//     const username = formData.get('username') as string;
//     const password = formData.get('password') as string;
//     const csrfToken = formData.get('csrfToken') as string;

//     console.log('[Server Action] Attempting sign-in for user:', username);

//     try {
//         const result = (await signIn('credentials', {
//             username,
//             password,
//             csrfToken, // CSRF token is passed directly in the server action
//             redirect: false, // Prevent Auth.js from doing an automatic redirect
//             callbackUrl: '/', // Default callback URL
//         })) as ServerSignInResponse | undefined; // Cast to our interface

//         if (!result) {
//             console.error(
//                 '[Server Action] signIn() returned undefined result.'
//             );
//             redirect('/auth/signin?error=UnknownError'); // Redirect to login with generic error
//         }

//         if (result.error) {
//             console.error(
//                 '[Server Action] Authentication failed:',
//                 result.error
//             );
//             let userFriendlyError = 'Authentication failed. Please try again.';

//             // --- IMPORTANT CHANGE: Unwrap Auth.js internal errors to get the specific message ---
//             // Auth.js often wraps errors from providers in `CallbackRouteError`
//             // or `CredentialsSignin` errors, with the original error in the `cause` field.
//             try {
//                 const errorObject = JSON.parse(result.error); // Try parsing if it's a JSON string
//                 if (
//                     errorObject.type &&
//                     errorObject.type.includes('CallbackRouteError') &&
//                     errorObject.cause?.err?.message
//                 ) {
//                     userFriendlyError = errorObject.cause.err.message;
//                 } else if (
//                     errorObject.type &&
//                     errorObject.type.includes('CredentialsSignin') &&
//                     errorObject.message
//                 ) {
//                     userFriendlyError = errorObject.message; // Sometimes CredentialsSignin directly has the message
//                 } else if (typeof result.error === 'string') {
//                     // If it's a string, Auth.js v5 error strings might contain the message
//                     // E.g., "CredentialsSignin: Read more at ... (cause: Error: Incorrect username or password.)"
//                     const match = result.error.match(/\(cause: Error: (.*?)\)/);
//                     if (match && match[1]) {
//                         userFriendlyError = match[1];
//                     } else {
//                         userFriendlyError = result.error; // Use raw error if no specific cause message found
//                     }
//                 }
//             } catch (parseError) {
//                 // If result.error is not a JSON string, treat it as a plain string
//                 const match = result.error.match(/\(cause: Error: (.*?)\)/);
//                 if (match && match[1]) {
//                     userFriendlyError = match[1];
//                 } else {
//                     userFriendlyError = result.error; // Use raw error if no specific cause message found
//                 }
//             }
//             // --- END IMPORTANT CHANGE ---

//             // Redirect back to the sign-in page with the specific error message
//             redirect(
//                 `/auth/signin?error=${encodeURIComponent(userFriendlyError)}`
//             );
//         }

//         if (result.ok && result.url) {
//             console.log(
//                 '[Server Action] Authentication successful. Redirecting to:',
//                 result.url
//             );
//             redirect(result.url);
//         } else {
//             console.error(
//                 '[Server Action] signIn() returned unexpected result:',
//                 result
//             );
//             redirect('/auth/signin?error=UnknownAuthError'); // Fallback if result.ok is false but no error message
//         }
//     } catch (error: any) {
//         if (error.digest?.startsWith('NEXT_REDIRECT')) {
//             throw error;
//         }
//         console.error(
//             '[Server Action] Error during server-side sign-in action:',
//             error
//         );
//         let userFriendlyError = 'An unexpected error occurred during sign-in.';

//         // --- NEW: Unwrap Auth.js internal errors caught by the outer catch block ---
//         if (
//             error.type &&
//             error.type.includes('CallbackRouteError') &&
//             error.cause?.err?.message
//         ) {
//             userFriendlyError = error.cause.err.message;
//         } else if (
//             error.type &&
//             error.type.includes('CredentialsSignin') &&
//             error.message
//         ) {
//             userFriendlyError = error.message;
//         } else if (typeof error.message === 'string') {
//             const match = error.message.match(/\(cause: Error: (.*?)\)/);
//             if (match && match[1]) {
//                 userFriendlyError = match[1];
//             } else {
//                 userFriendlyError = error.message;
//             }
//         }
//         // --- END NEW ---

//         redirect(`/auth/signin?error=${encodeURIComponent(userFriendlyError)}`);
//     }
// }

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
    const csrfToken = formData.get('csrfToken') as string;

    console.log('[Server Action] Attempting sign-in for user:', username);

    try {
        // const result = await signIn('credentials', {
        //   username,
        //   password,
        //   csrfToken, // CSRF token is passed directly in the server action
        //   redirect: false, // Prevent Auth.js from doing an automatic redirect
        //   callbackUrl: '/', // Explicitly set callbackUrl to '/' as a default for Auth.js
        // }) as ServerSignInResponse | undefined; // Cast to our interface

        const signInResultRaw = await signIn('credentials', {
            username,
            password,
            csrfToken, // CSRF token is passed directly in the server action
            redirect: false, // Prevent Auth.js from doing an automatic redirect
            callbackUrl: '/', // Explicitly set callbackUrl to '/' as a default for Auth.js
        });

        // New Debugging: Log the raw result directly from signIn()
        console.log(
            '[Server Action] Raw result from Auth.js signIn():',
            JSON.stringify(signInResultRaw, null, 2)
        );

        // --- IMPORTANT FIX: Handle `signInResultRaw` being a string (bug in beta.18) ---
        // If signIn() unexpectedly returns a string (the URL) on success,
        // we assume success and redirect to it, applying our safeguard.
        if (typeof signInResultRaw === 'string') {
            console.warn(
                '[Server Action] signIn() unexpectedly returned a string URL. Assuming success and redirecting.'
            );
            const isSelfRedirecting =
                signInResultRaw.includes('/auth/signin') ||
                signInResultRaw.includes('/auth/signout');
            const resolvedRedirectUrl = isSelfRedirecting
                ? '/'
                : signInResultRaw;
            redirect(resolvedRedirectUrl); // This will throw NEXT_REDIRECT
        }
        // --- END IMPORTANT FIX ---

        // If it's not a string, we expect it to be the ServerSignInResponse object
        const result = signInResultRaw as ServerSignInResponse | undefined;

        if (!result) {
            console.error(
                '[Server Action] signIn() returned undefined result.'
            );
            redirect('/auth/signin?error=UnknownError'); // Redirect to login with generic error
        }

        // New Debugging: Log the full result object for every outcome
        console.log(
            '[Server Action] Full signIn result:',
            JSON.stringify(result, null, 2)
        );

        if (result.error) {
            console.error(
                '[Server Action] Authentication failed:',
                result.error
            );
            let userFriendlyError = 'Authentication failed. Please try again.';

            // Unwrap Auth.js internal errors to get the specific message
            try {
                const errorObject = JSON.parse(result.error);
                if (
                    errorObject.type &&
                    errorObject.type.includes('CallbackRouteError') &&
                    errorObject.cause?.err?.message
                ) {
                    userFriendlyError = errorObject.cause.err.message;
                } else if (
                    errorObject.type &&
                    errorObject.type.includes('CredentialsSignin') &&
                    errorObject.message
                ) {
                    userFriendlyError = errorObject.message;
                } else if (typeof result.error === 'string') {
                    const match = result.error.match(/\(cause: Error: (.*?)\)/);
                    if (match && match[1]) {
                        userFriendlyError = match[1];
                    } else {
                        userFriendlyError = result.error;
                    }
                }
            } catch (parseError) {
                // If result.error is not a JSON string, treat it as a plain string
                const match = result.error.match(/\(cause: Error: (.*?)\)/);
                if (match && match[1]) {
                    userFriendlyError = match[1];
                } else {
                    userFriendlyError = result.error;
                }
            }

            // Redirect back to the sign-in page with the specific error message
            redirect(
                `/auth/signin?error=${encodeURIComponent(userFriendlyError)}`
            );
        }

        if (result.ok && result.url) {
            // --- IMPORTANT MODIFICATION ---
            // Safeguard: If Auth.js somehow gives a redirect URL that points back to the login/logout pages,
            // override it to always go to the home page or a dashboard.
            const isSelfRedirecting =
                result.url.includes('/auth/signin') ||
                result.url.includes('/auth/signout');
            const resolvedRedirectUrl = isSelfRedirecting ? '/' : result.url;

            console.log(
                `[Server Action] Authentication successful. Redirecting to: ${resolvedRedirectUrl} (Auth.js provided: ${result.url})`
            );
            redirect(resolvedRedirectUrl);
        } else {
            // This block is hit if result.ok is false and result.error is not set.
            // This is still an unexpected state for a sign-in attempt.
            console.error(
                '[Server Action] signIn() returned unexpected result. Details:',
                JSON.stringify(result, null, 2)
            );
            redirect('/auth/signin?error=UnknownAuthError'); // Redirect with a generic error
        }
    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error; // Re-throw NEXT_REDIRECT to ensure Next.js handles the HTTP redirect
        }

        console.error(
            '[Server Action] Error during server-side sign-in action:',
            error
        );
        let userFriendlyError = 'An unexpected error occurred during sign-in.';

        // Unwrap Auth.js internal errors caught by the outer catch block
        if (
            error.type &&
            error.type.includes('CallbackRouteError') &&
            error.cause?.err?.message
        ) {
            userFriendlyError = error.cause.err.message;
        } else if (
            error.type &&
            error.type.includes('CredentialsSignin') &&
            error.message
        ) {
            userFriendlyError = error.message;
        } else if (typeof error.message === 'string') {
            const match = error.message.match(/\(cause: Error: (.*?)\)/);
            if (match && match[1]) {
                userFriendlyError = match[1];
            } else {
                userFriendlyError = error.message;
            }
        }

        redirect(`/auth/signin?error=${encodeURIComponent(userFriendlyError)}`);
    }
}
