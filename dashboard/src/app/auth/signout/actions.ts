// // app/auth/signout/actions.ts
// 'use server'; // <--- This directive marks the file as a Server Action

// import { signOut } from '@/auth'; // Import the server-side `signOut` helper from your auth.ts
// import { redirect } from 'next/navigation'; // For server-side redirects

// // Define the server action for signing out
// export async function signOutAction() {
//     console.log('[Server Action] Attempting to sign out...');
//     try {
//         // The server-side signOut() function will clear the session and cookies.
//         // By default, it redirects to the callbackUrl (which you set to '/' in auth.ts).
//         await signOut(); // This will perform the server-side sign out and trigger the redirect

//         // If signOut() doesn't automatically redirect (e.g., in some edge cases or specific configurations),
//         // you can explicitly redirect here. However, `signOut()` typically handles this.
//         // If you need more control, you could pass `{ redirect: false }` to `signOut()`
//         // and then call `redirect('/some-other-page')` yourself.

//         // For this implementation, we expect signOut() to handle the redirect.
//         // If it falls through for some reason, we can add a fallback redirect here.
//         redirect('/'); // Fallback redirect to home page
//     } catch (error) {
//         console.error(
//             '[Server Action] Error during server-side sign out:',
//             error
//         );
//         // You might want to redirect to an error page or the sign-in page with an error parameter
//         redirect(`/auth/signin?error=SignOutError`);
//     }
// }


// app/auth/signout/actions.ts
'use server'; // <--- This directive marks the file as a Server Action

import { auth, signOut } from '@/auth'; // Import the server-side `signOut` helper from your auth.ts
import { redirect } from 'next/navigation'; // For server-side redirects

// Define the server action for signing out
export async function signOutAction() {
  console.log('[Server Action] Attempting to sign out...');
  try {
    // 1. Call signOut to clear the session, but prevent it from issuing its own redirect.
    // This try-block specifically handles errors that occur during the *session clearing* process.
    await signOut({ redirect: false }); 
    // await signOut({ redirect: true }); 

    console.log('[Server Action] Session cleared successfully.');
    
  } catch (error: any) {
    // This catch block will only execute if `signOut({ redirect: false })` itself fails
    // (e.g., a network issue contacting the Auth.js API, or an internal Auth.js error).
    // It will NOT catch the NEXT_REDIRECT thrown by the subsequent `redirect()` call.
    console.error('[Server Action] Error clearing session during sign out:', error);
    // For actual errors during session clearing, redirect to sign-in with an error message.
    redirect(`/auth/signin?error=SignOutSessionError`);
  }

  // 2. Explicitly redirect the user using next/navigation's redirect.
  // This call will *throw* NEXT_REDIRECT. Next.js is designed to catch this internal error
  // and process it as an HTTP redirect to the browser. It should NOT be caught by your app code.
  console.log('[Server Action] Initiating explicit redirect to /auth/signin.');
  redirect('/auth/signin'); 
}
