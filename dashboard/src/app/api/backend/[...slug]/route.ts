// Frontend Web Application for RA Products
// Developed by R2 Labs

import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

import authOptions from '@/lib/auth/auth_options';
import { createAPIResponse } from '@/lib/models/api_models';
import { authentication_enabled, debug_mode } from '@/lib/utils/utilities';

async function validateAuthentication(): Promise<boolean> {
    const session = await getServerSession(authOptions);
    if (session == null) {
        return false;
    }
    return true;
}

async function proxyBackendRequest(params: {
    request: NextRequest;
    slug: string[];
}) {
    let payload = null;
    try {
        payload = await params.request.json().then((res) => res);
    } catch (e) {}

    const query_params = params.request.nextUrl.searchParams;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 20000);

    let backend_path =
        'http://' + process.env.CONTROLLER_URI + `/${params.slug.join('/')}`;
    if (query_params.size > 0) backend_path += '?' + query_params.toString();

    const request_params: RequestInit = {
        method: params.request.method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
    };

    if (payload != null) {
        request_params.body = JSON.stringify(payload);
    }

    const res = await fetch(backend_path, request_params).then((res) =>
        res.json()
    );

    clearTimeout(timeoutId);

    return createAPIResponse({
        authenticated: true,
        data: res,
        error: false,
        error_string: '',
    });
}

function handleError(e: any, request: NextRequest, slug: string[]) {
    const error_message = e.toString();

    console.error(
        `${request.method} to backend ${slug.join(
            '/'
        )} failed due to: ${error_message}.`
    );
    return createAPIResponse({
        authenticated: true,
        error_string: error_message,
    });
}

async function handler(
    request: NextRequest,
    { params }: { params: { slug: string[] } }
) {
    if (debug_mode())
        console.log(
            `Received ${request.method} request to /backend/${params.slug.join('/')}`
        );

    if (authentication_enabled() && !(await validateAuthentication())) {
        console.error(
            `Unauthenicated ${request.method} request on /backend/${params.slug.join(
                '/'
            )}`
        );
        return createAPIResponse({
            authenticated: false,
        });
    }

    try {
        return await proxyBackendRequest({
            request: request,
            slug: params.slug,
        });
    } catch (e) {
        return handleError(e, request, params.slug);
    }
}

export { handler as GET, handler as POST };
