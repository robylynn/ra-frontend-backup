// Frontend Web Application for RA Products
// Developed by R2 Labs

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import authOptions from '@/lib/auth/auth_options';

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (session == null) {
        redirect('/api/auth/signin');
    }
    redirect('/dashboard');
}
