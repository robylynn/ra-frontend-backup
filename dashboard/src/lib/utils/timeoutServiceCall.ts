import ROSLIB from 'roslib';

const timeoutServiceCall = (
    service: ROSLIB.Service,
    request: ROSLIB.ServiceRequest,
    timeoutDuration = 5000
) => {
    return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject('Service call timed out.');
            }, timeoutDuration);
        });

        const serviceCallPromise = new Promise((resolve, reject) => {
            service.callService(
                request,
                (result: ROSLIB.ServiceResponse) => {
                    clearTimeout(timeoutId); // Clear the timeout if the service responds
                    if ((result as any).success) {
                        resolve(result);
                    } else {
                        reject(
                            `Service call failure: ${(result as any).message ?? 'Unkown error.'}`
                        );
                    }
                },
                (error) => {
                    clearTimeout(timeoutId); // Clear the timeout if an error occurs
                    reject(error);
                }
            );
        });

        Promise.race([serviceCallPromise, timeoutPromise])
            .then(resolve)
            .catch(reject);
    });
};

export default timeoutServiceCall;
