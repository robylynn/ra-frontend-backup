import ROSLIB from 'roslib';
import { logMessage } from '@/lib/utils/utilities';

const timeoutServiceCall = async <T>(
    service: ROSLIB.Service,
    request: ROSLIB.ServiceRequest,
    timeoutDuration = 5000,
    maxRetries: number = 1,
    retryDelayMs: number = 0
): Promise<T> => {
    const attemptCall = (): Promise<T> => {
        let timeoutId: NodeJS.Timeout;

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Service call timed out.'));
            }, timeoutDuration);
        });

        const serviceCallPromise = new Promise<T>((resolve, reject) => {
            service.callService(
                request,
                (result: T) => {
                    clearTimeout(timeoutId); // Clear the timeout if the service responds
                    if (
                        result &&
                        typeof result === 'object' &&
                        'success' in result &&
                        !(result as any).success
                    ) {
                        reject(
                            new Error(
                                `Service call failure: ${(result as any).message ?? 'Unknown error.'}`
                            )
                        );
                    } else {
                        resolve(result);
                    }
                },
                (error) => {
                    clearTimeout(timeoutId); // Clear the timeout if an error occurs
                    if (typeof error === 'string') {
                        reject(new Error(error));
                    } else {
                        reject(error);
                    }
                }
            );
        });

        return Promise.race([serviceCallPromise, timeoutPromise]);
    };

    // --- Retry Wrapper Logic ---
    let lastError: Error | unknown = new Error('No attempt made.');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await attemptCall();
            return result; // Success! Return the result immediately.
        } catch (error) {
            lastError = error;

            // Log the failure and attempt number
            logMessage(
                `Attempt ${attempt}/${maxRetries} failed for service ${service.name}. Retrying in ${retryDelayMs}ms... Error: ${error}`, 'error'
            );

            // If it's the last attempt, break and let the function reject
            if (attempt === maxRetries) {
                break;
            }

            // Wait before the next retry
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
    }

    // If the loop finishes (all attempts failed), reject with the last error
    throw lastError;
};

export default timeoutServiceCall;
