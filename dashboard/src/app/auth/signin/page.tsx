// // app/auth/signin/page.tsx
// 'use client'; // <--- Add this directive to make it a Client Component

// import { getCsrfToken, signIn } from 'next-auth/react'; // <--- Import signIn helper
// import { useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';

// export default function SignInPage() {
//     const router = useRouter();
//     const [csrfToken, setCsrfToken] = useState<string | null>(null);
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     // Fetch the CSRF token on the client-side when the component mounts
//     useEffect(() => {
//         async function fetchToken() {
//             try {
//                 const token = await getCsrfToken();
//                 setCsrfToken(token);
//             } catch (e) {
//                 console.error('Failed to fetch CSRF token:', e);
//                 setError('Failed to initialize login. Please try again.');
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//         fetchToken();
//     }, []);

//     const handleSubmit = async (event: React.FormEvent) => {
//         event.preventDefault();
//         setError(null);
//         setIsLoading(true);

//         try {
//             // Use the signIn helper function
//             const result = await signIn('credentials', {
//                 username,
//                 password,
//                 redirect: false, // Prevent automatic client-side redirect, handle it manually
//                 callbackUrl: '/', // Default callback URL if not specified otherwise
//             });

//             // if (result?.error) {
//             //     // If there's an error from Auth.js, display it
//             //     setError(result.error);
//             //     console.error('Authentication error:', result.error);
//             // } else if (result?.ok) {
//             //     // If successful, Auth.js has authenticated the user.
//             //     // Redirect to the callbackUrl or a default dashboard.
//             //     // The `callbackUrl` that Auth.js uses can be passed via the `callbackUrl` option here,
//             //     // or it defaults to the page you were trying to access.
//             //     router.push(result.url || '/'); // Redirect to result.url if provided, else home
//             // } else {
//             //     // Handle other unexpected non-error, non-ok scenarios
//             //     setError('An unexpected authentication response occurred.');
//             // }
//         } catch (e) {
//             console.error('Error during sign-in:', e);
//             setError('An unexpected error occurred during sign-in.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
//                 <p className="text-lg text-gray-700 dark:text-gray-300">
//                     Loading sign-in form...
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
//             <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
//                 <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
//                     Sign In
//                 </h1>

//                 {error && (
//                     <div
//                         className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
//                         role="alert"
//                     >
//                         <strong className="font-bold">Error!</strong>
//                         <span className="block sm:inline ml-2">{error}</span>
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit}>
//                     {' '}
//                     {/* No explicit method/action needed when using signIn() helper */}
//                     {/* CRUCIAL: Hidden CSRF token input - still needed for signIn helper */}
//                     <input
//                         name="csrfToken"
//                         type="hidden"
//                         defaultValue={csrfToken || ''}
//                     />
//                     <div className="mb-4">
//                         <label
//                             htmlFor="username"
//                             className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2"
//                         >
//                             Username
//                         </label>
//                         <input
//                             id="username"
//                             name="username"
//                             type="text"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             required
//                             className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
//                             placeholder="Enter your username"
//                             disabled={isLoading}
//                         />
//                     </div>
//                     <div className="mb-6">
//                         <label
//                             htmlFor="password"
//                             className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2"
//                         >
//                             Password
//                         </label>
//                         <input
//                             id="password"
//                             name="password"
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                             className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 transition-all duration-200"
//                             placeholder="Enter your password"
//                             disabled={isLoading}
//                         />
//                     </div>
//                     <button
//                         type="submit"
//                         className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
//                         disabled={isLoading}
//                     >
//                         {isLoading ? 'Signing In...' : 'Sign In'}
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// app/auth/signin/page.tsx
// This is a Server Component – no "use client" directive
import React from 'react';
// import { getCsrfToken } from 'next-auth/next/'; // Import server-side getCsrfToken
// import { getCsrfToken } from 'next-auth/react';
import { cookies } from 'next/headers'; // <-- Import cookies to manually read
// import { getCsrfToken } from 'next-auth/react';
import { signInAction } from './actions'; // Import the Server Action
import { redirect } from 'next/navigation'; // For manual server redirects if needed
import { auth } from '@/auth'; // Import server-side auth to check session
import { getCsrfTokenFromServer } from '@/lib/auth/csrf';
import Link from 'next/link'; // Import Link for navigation

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  // Check if the user is already logged in
  const session = await auth();
  if (session?.user) {
    // If logged in, redirect them away from the sign-in page
    // Use the callbackUrl if available, otherwise default to home
    redirect(searchParams.callbackUrl || '/');
  }

  // Fetch the CSRF token directly in the Server Component
  // This is how you would typically get the CSRF token on the server for a form.
//   const csrfToken = await getCsrfToken();

  // --- START OF MANUAL CSRF TOKEN EXTRACTION ---
  // WORKAROUND for next-auth@5.0.0-beta.18 where @auth/nextjs/server/getCsrfToken is unavailable or broken.
  // This is generally NOT recommended for stable versions of Auth.js, as it bypasses the official helper.
  const csrfToken = await getCsrfTokenFromServer();
//   let csrfToken: string | null = null;
//   try {
//     const cookieStore = cookies();
//     const csrfCookie = cookieStore.get('__Host-next-auth.csrf-token') || cookieStore.get('next-auth.csrf-token'); // Check both possible names
    
//     if (csrfCookie && csrfCookie.value) {
//       // The CSRF token is typically the first part before a '|'
//       csrfToken = csrfCookie.value.split('|')[0];
//     } else {
//       console.warn('CSRF cookie not found or empty during manual extraction.');
//     }
//   } catch (e) {
//     console.error('Error manually extracting CSRF token from cookies:', e);
//     // In a real app, you might want to show a more robust error or disable the form.
//   }
  // --- END OF MANUAL CSRF TOKEN EXTRACTION ---
  
  const errorMessage = searchParams.error
    ? decodeURIComponent(searchParams.error)
    : null;

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
              <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
                  Sign In
              </h1>

              {errorMessage && (
                  <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                      role="alert"
                  >
                      <strong className="font-bold">Error!</strong>
                      <span className="block sm:inline ml-2">
                          {errorMessage}
                      </span>
                  </div>
              )}

              {/* The `action` attribute of the form directly calls the Server Action */}
              <form action={signInAction}>
                  {/* CRUCIAL: Hidden CSRF token input */}
                  <input
                      name="csrfToken"
                      type="hidden"
                      defaultValue={csrfToken || ''}
                  />

                  <div className="mb-4">
                      <label
                          htmlFor="username"
                          className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2"
                      >
                          Username
                      </label>
                      <input
                          id="username"
                          name="username" // Name attribute MUST match your credentials provider field
                          type="text"
                          required
                          className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                          placeholder="Enter your username"
                      />
                  </div>

                  <div className="mb-6">
                      <label
                          htmlFor="password"
                          className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2"
                      >
                          Password
                      </label>
                      <input
                          id="password"
                          name="password" // Name attribute MUST match your credentials provider field
                          type="password"
                          required
                          className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 transition-all duration-200"
                          placeholder="Enter your password"
                      />
                  </div>

                  <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
                  >
                      Sign In
                  </button>
              </form>

              {/* --- New User Registration Link --- */}
              <div className="mt-6 text-center text-gray-700 dark:text-gray-300">
                  Don't have an account?{' '}
                  <Link
                      href="/auth/register"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-semibold transition-colors duration-200"
                  >
                      Register here
                  </Link>
              </div>
              {/* --- End New User Registration Link --- */}

          </div>
      </div>
  );
}
