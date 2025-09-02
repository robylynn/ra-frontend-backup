'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
    return (
        <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105"
            onClick={() => signOut({redirect: false})}
        >
            Confirm Sign Out
        </button>
    );
}
