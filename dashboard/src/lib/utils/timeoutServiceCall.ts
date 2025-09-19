import ROSLIB from 'roslib';

const timeoutServiceCall = <T>(
    service: ROSLIB.Service,
    request: ROSLIB.ServiceRequest,
    timeoutDuration = 5000
): Promise<T> => {
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

export default timeoutServiceCall;
