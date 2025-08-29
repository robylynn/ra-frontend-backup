import NextAuth from 'next-auth';
import credentials from 'next-auth/providers/credentials';

export const { auth, handlers, signIn, signOut } = NextAuth({
    // secret: process.env.AUTH_SECRET,
    trustHost: true,
    
    pages: {
        signIn: '/auth/signin', // <-- Add this line
        // You can also define other custom pages like:
        signOut: '/auth/signout',
        // error: '/auth/error',
        // verifyRequest: '/auth/verify-request',
        // newUser: '/auth/new-user',
    },
    callbacks: {
        async session({ session, token }) {
            // Example: Add user ID to session
            if (token.sub) {
                session.user.id = token.sub;
            }
            // Ensure accessToken is available in the session for client-side use
            // This will be the raw JWT string we encoded in the jwt callback
            // if (token.rawJwt) {
            //     session.sessionToken = token.rawJwt as string;
            // }
            return session;
        },
        async jwt({ token, user, account }) {
            // For CredentialsProvider, `account` might not have `access_token` in the same way as OAuth.
            // We will rely on the `user` object returned by `authorize`.
            if (user) {
                token.sub = user.id; // Store user ID
                token.name = user.name; // Store user name
                token.email = user.email; // Store user email
            }
            return token;
        },
    },
    providers: [
        credentials({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: {
                    label: 'Username',
                    type: 'text',
                    placeholder: 'Username',
                },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(
                credentials: Record<'username' | 'password', string>,
            ) {
                try {
                    const backendApiUrl = `http://${process.env.CONTROLLER_URI}`;
                    const res = await fetch(
                        `${backendApiUrl}/auth/token`, // Assuming your backend login endpoint is /auth/token
                        {
                            method: 'POST',
                            body: new URLSearchParams(credentials).toString(), // OAuth2 token endpoint expects x-www-form-urlencoded
                            headers: {
                                'Content-Type':
                                    'application/x-www-form-urlencoded',
                            },
                        }
                    );

                    // Handle cases where the response itself is not OK or JSON parsing fails
                    // if (!res.ok) {
                    //     console.error(
                    //         `Backend API responded with status ${res.status}`
                    //     );
                    //     const errorText = await res.text(); // Get raw error message
                    //     throw new Error(`Authentication failed: ${errorText}`);
                    // }

                    // --- IMPORTANT CHANGE: Instead of returning null on !res.ok, throw an error with the backend's message.
                    // Auth.js will catch this error and set `result.error` in `signInAction` to the error message.
                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(
                            `Backend API responded with status ${res.status}. Status text: ${res.statusText}`
                        );
                        console.error(
                            `Authentication failed (backend not OK): ${errorText}`
                        );

                        let errorMessage =
                            'Authentication failed due to server error.';
                        try {
                            const backendError = JSON.parse(errorText);
                            if (backendError && backendError.message) {
                                errorMessage = backendError.message; // Use the specific message from the backend
                            }
                        } catch (parseError) {
                            console.warn(
                                'Could not parse backend error response as JSON. Using generic message.'
                            );
                        }
                        throw new Error(errorMessage); // Throw the specific message
                    }

                    const auth_response = await res.json();

                    if (
                        auth_response.success &&
                        auth_response.data &&
                        auth_response.data.user
                    ) {
                        console.log(
                            'Backend authentication successful for user:',
                            auth_response.data.user.username
                        );
                        return {
                            id: auth_response.data.user.user_id,
                            name: auth_response.data.user.username,
                            email: auth_response.data.user.username,
                            accessToken: auth_response.data.access_token,
                        };
                    }

                    // If res.ok but auth_response.success is false (backend reports login failed for other reasons)
                    console.error(
                        'Backend authentication failed:',
                        auth_response.message || 'Unknown error from backend.'
                    );
                    throw new Error(
                        auth_response.message ||
                            'Incorrect username or password.'
                    ); // Throw backend's specific message
                } catch (error) {
                    // console; // This catch block handles network errors or errors thrown above.
                    // Auth.js will catch this error and set `result.error` in `signInAction`.
                    console.error(
                        'Error during backend authentication:',
                        error.message || error
                    );
                    throw new Error(
                        error.message ||
                            'An unexpected error occurred during login.'
                    ); // Re-throw with message
                }
            },
        }),
    ],
});
