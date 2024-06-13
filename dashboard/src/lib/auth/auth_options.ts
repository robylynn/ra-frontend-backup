// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Username",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        console.log("LOGGING IN");
        // return {
        //   "user": credentials?.username
        // };
        // return credentials?.username;

        // Short circuit backend auth for now

        const res = await fetch(
          "http://" + process.env.CONTROLLER_URI + `/user/login/`,
          {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          },
        );

        const auth_response = await res.json();

        // If no error and we have user data, return it
        if (res.ok && auth_response.authenticated) {
          // return auth_response.user;
          return credentials?.username;
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
};

export default authOptions;
