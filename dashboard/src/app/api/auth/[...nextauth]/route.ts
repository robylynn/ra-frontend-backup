// Frontend Web Application for RA Products
// Developed by R2 Labs

import NextAuth from 'next-auth';

import authOptions from '@/lib/auth/auth_options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
