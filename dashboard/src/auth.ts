import NextAuth from 'next-auth';
import credentials from 'next-auth/providers/credentials';
import { encode } from "@auth/core/jwt"; // Import encode from @auth/core/jwt

export const { auth, handlers, signIn, signOut } = NextAuth({
    // secret: process.env.AUTH_SECRET,
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
                credentials: Record<'username' | 'password', string>
            ) {
                // async authorize(credentials: Record<"username" | "pasword", string>) {
                // You need to provide your own logic here that takes the credentials
                // submitted and returns either a object representing a user or value
                // that is false/null if the credentials are invalid.
                // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
                // You can also use the `req` object to obtain additional parameters
                // (i.e., the request IP address)
                console.log('LOGGING IN');

                const res = await fetch(
                    'http://' + process.env.CONTROLLER_URI + `/user/login`,
                    {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                const auth_response = await res.json();

                // If no error and we have user data, return it
                if (res.ok && auth_response.authenticated) {
                    return {
                        id: '1',
                        name: credentials?.username,
                        email: null,
                    }; // as User;
                }

                // Return null if user data could not be retrieved
                return null;
            },
        }),
    ],
});
