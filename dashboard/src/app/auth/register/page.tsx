// app/auth/register/page.tsx
// This is a Server Component – no "use client" directive
import { auth } from '@/auth';
import { getCsrfTokenFromServer } from '@/lib/auth/csrf'; // <-- Import the reusable function
import { redirect } from 'next/navigation';
import { registerAction } from './actions';

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: { error?: string; callbackUrl?: string };
}) {
    // Check if the user is already logged in
    const session = await auth();
    if (session?.user) {
        redirect(searchParams.callbackUrl || '/');
    }

    // --- Use the reusable CSRF token extraction function ---
    const csrfToken = await getCsrfTokenFromServer();
    // --- END OF CSRF TOKEN EXTRACTION ---

    const errorMessage = searchParams.error
        ? decodeURIComponent(searchParams.error)
        : null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">
                    Register
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

                <form action={registerAction}>
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
                            name="username"
                            type="text"
                            required
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                            placeholder="Choose a username"
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
                            name="password"
                            type="password"
                            required
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 transition-all duration-200"
                            placeholder="Choose a strong password"
                        />
                    </div>
                    {/* Add other registration fields like email, confirm password, etc. here */}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}
