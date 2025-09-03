import { basicApiResponseSchema, NextAPIResponseInterface } from '@/lib/models/api_models';
import { z, ZodError } from 'zod';
import { createApiResponseSchema } from '@/lib/models/api_models';
import { FetchError } from '@/lib/models/errors';

export default async function timeoutFetch<Type>(
    path: string,
    timeout: number,
    method: string = 'GET'
): Promise<Type> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort('Timeout');
    }, timeout);

    let request_params: RequestInit = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
    };

    let ret: any;
    try {
        const fetch_response: NextAPIResponseInterface = await fetch(
            path,
            request_params
        ).then((res) => res.json());

        if (!fetch_response.authenticated) {
            console.log(`Attempted unauthenticated fetch to ${path}`);
            ret = null;
        }

        ret = fetch_response.backend_response.data;

        // if (fetch_response.error) {
        //     ret = fetch_response;
        // } else {
        //     ret = fetch_response.data.data;
        // }
    } catch (e) {
        console.log(`fetcher error getting ${path}: ` + e);
        ret = null;
    }

    clearTimeout(timeoutId);
    return ret;
}

export async function timeoutFetchWithErrors(
    path: string,
    timeout: number,
    method: string = 'GET'
): Promise<NextAPIResponseInterface | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort('Timeout');
    }, timeout);

    let request_params: RequestInit = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
    };

    let ret: any;
    try {
        const fetch_response: NextAPIResponseInterface = await fetch(
            path,
            request_params
        ).then((res) => res.json());

        if (!fetch_response.authenticated) {
            console.log(`Attempted unauthenticated fetch to ${path}`);
            ret = null;
        }

        ret = fetch_response;
    } catch (e) {
        console.log(`fetcher error getting ${path}: ` + e);
        ret = null;
    }

    clearTimeout(timeoutId);
    return ret;
}


/**
 * Retries a promise-based async function with exponential backoff.
 * @param {Function} apiCall The async function to retry.
 * @param {number} maxRetries The maximum number of retries.
 * @param {number} initialDelay The initial delay in milliseconds.
 * @returns {Promise<any>} The result of the successful API call.
 */
export const asyncExponentialBackoffRetry = async (apiCall, maxRetries = 3, initialDelay = 1000) => {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (err) {
            lastError = err;
            const delay = initialDelay * Math.pow(2, attempt);
            console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    // If all attempts fail, re-throw the last error
    throw lastError;
};


/**
 * Fetches and validates data from an API using a generic type and an optional Zod schema.
 * @param url The API endpoint URL.
 * @param schema The Zod schema to validate the 'data' field against (optional).
 * @param timeoutMs The timeout in milliseconds.
 * @returns A Promise that resolves with the validated data or rejects with an error.
 */
export async function fetchFromBackendApi<T = unknown>(
    url: string,
    method: 'GET' | 'POST' = 'GET',
    body: unknown = null,
    schema: z.ZodSchema<T> | null = null,
    timeoutMs: number = 5000
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const options: RequestInit = {
        method,
        signal: controller.signal,
    };

    // Conditionally add the body and Content-Type header for POST requests
    if (method === 'POST') {
        options.headers = {
            'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(body);
    }

    try {
        // const response = await fetch(url, {
        //     signal: controller.signal,
        // });
        const response = await fetch(url, options);

        // Clear the timeout if the request completes before the timer.
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new FetchError(`HTTP error! Status: ${response.status}`);
        }

        const rawData = await response.json();

        if (schema) {
            // Case 1: Schema is provided, so validate the data field strictly.
            const apiResponseSchema = createApiResponseSchema(schema);
            const validatedResponse = apiResponseSchema.parse(rawData);

            if (
                !validatedResponse.backend_response.success ||
                !validatedResponse.backend_response.data
            ) {
                throw new FetchError(
                    `API returned a failure: ${validatedResponse.backend_response.message}`
                );
            }

            // Return only the validated 'data' part of the response.
            return validatedResponse.backend_response.data;
        } else {
            // Case 2: No schema provided, so perform minimal validation.
            const schema = createApiResponseSchema();
            const validatedResponse =
                createApiResponseSchema().parse(rawData);

            if (!validatedResponse.backend_response.success) {
                throw new FetchError(
                    `API returned a failure: ${validatedResponse.backend_response.message}`
                );
            }

            // Return the data as-is without further validation.
            return validatedResponse.backend_response.data as T;
        }
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = error.issues
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
            throw new FetchError(`Validation Failed:\n${formattedErrors}`);
        } else if (error instanceof Error && error.name === 'AbortError') {
            throw new FetchError('Request timed out.');
        } else if (error instanceof FetchError) {
            throw error;
        } else {
            throw new FetchError(
                `An unknown error occurred: ${error instanceof Error ? error.message : 'Unknown'}`
            );
        }
    }
}
