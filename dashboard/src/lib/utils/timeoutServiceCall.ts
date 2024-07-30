const timeoutServiceCall = (service, request, timeoutDuration = 5000) => {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
  
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Service call timed out'));
        }, timeoutDuration);
      });
  
      const serviceCallPromise = new Promise((resolve, reject) => {
        service.callService(request, (result) => {
          clearTimeout(timeoutId); // Clear the timeout if the service responds
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error('Failed to update configuration'));
          }
        }, (error) => {
          clearTimeout(timeoutId); // Clear the timeout if an error occurs
          reject(error);
        });
      });
  
      Promise.race([serviceCallPromise, timeoutPromise])
        .then(resolve)
        .catch(reject);
    });
  };
  
  export default timeoutServiceCall;