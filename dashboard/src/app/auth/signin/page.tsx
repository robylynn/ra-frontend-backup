// app/auth/signin/page.tsx
import React from 'react';
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
