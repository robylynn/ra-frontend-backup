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
                    if (!res.ok) {
                        console.error(
                            `Backend API responded with status ${res.status}`
                        );
                        const errorText = await res.text(); // Get raw error message
                        throw new Error(`Authentication failed: ${errorText}`);
                    }

                    const auth_response = await res.json();

                    // If the backend responds successfully and authenticates the user
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
                            id: auth_response.data.user.user_id, // Ensure user_id is a string or number
                            name: auth_response.data.user.username,
                            email: auth_response.data.user.username, // Using username as email for simplicity if no email field
                            accessToken: auth_response.data.access_token, // Store accessToken
                        };
                    }

                    // Return null if authentication failed
                    console.error(
                        'Backend authentication failed:',
                        auth_response.message || 'Unknown error from backend.'
                    );
                    return null;
                } catch (error) {
                    console.error(
                        'Error during backend authentication:',
                        error
                    );
                    return null;
                }
            },
        }),
    ],
});
