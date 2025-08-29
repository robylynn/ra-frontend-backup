// // app/auth/signout/page.tsx
// "use client"; // This is a Client Component as it uses hooks and client-side logic

// import { signOut } from 'next-auth/react'; // Import the signOut helper
// import { useRouter } from 'next/navigation'; // For potential client-side redirects
// import React, { useState, useEffect } from 'react';

// export default function SignOutPage() {
//   const router = useRouter();
//   const [isSigningOut, setIsSigningOut] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // You can automatically sign out on page load, or require a button click.
//   // For a dedicated sign-out *page*, automatically signing out is common.
//   useEffect(() => {
//     const performSignOut = async () => {
//       setIsSigningOut(true);
//       setError(null);
//       try {
//         // signOut() redirects by default. If you want to handle redirect yourself, use { redirect: false }
//         // For a dedicated sign-out page, letting it redirect is usually fine.
//         // It will redirect to the page specified by Auth.js (often '/')
//         await signOut({ callbackUrl: '/' }); // Redirect to home page after sign out
//       } catch (e) {
//         console.error("Error during sign out:", e);
//         setError("An unexpected error occurred during sign out. Please try again.");
//       } finally {
//         setIsSigningOut(false);
//       }
//     };

//     // Trigger sign out automatically when the page loads
//     performSignOut();
//   }, []); // Empty dependency array ensures this runs once on mount

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
//       <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
//         <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">Signing Out</h1>
        
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//             <strong className="font-bold">Error!</strong>
//             <span className="block sm:inline ml-2">{error}</span>
//           </div>
//         )}

//         {isSigningOut ? (
//           <p className="text-lg text-gray-700 dark:text-gray-300">
//             Please wait while we sign you out...
//             <span className="animate-pulse ml-2">👋</span>
//           </p>
//         ) : (
//           <p className="text-lg text-gray-700 dark:text-gray-300">
//             You have been signed out. Redirecting...
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }


// app/auth/signout/page.tsx
// This is a Server Component – no "use client" directive
import React from 'react';
import { signOutAction } from './actions'; // Import the Server Action

export default async function SignOutPage() {
  // In a Server Component, you can use server-side functions like `await auth()`
  // to check the session if needed, but for a pure sign-out page, it's often not.

  // The form will trigger the server action directly.
  // We provide a simple UI that gives the user a button to confirm sign out.
  // You could also auto-submit the form using client-side JavaScript in a separate
  // 'use client' wrapper if you wanted immediate sign out on page load without a button.

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">Sign Out</h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to sign out?
        </p>

        {/* This form directly calls the server action */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
          >
            Confirm Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
