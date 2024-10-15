import timeoutFetch from "@/lib/utils/timeoutFetch";
// useEffect(() => {

self.onmessage = (m: MessageEvent<string>) => {
    heartbeat().then(() => {console.log("Worker got heartbeat")})
}

const heartbeat = async () => {
  let heartbeat = await timeoutFetch<string>(
    "/api/backend/state/heartbeat",
    750
  );
  
  let heartbeat_valid = heartbeat == "ACK" ? true : false;

  if (!heartbeat_valid) {
    console.log("Error getting heartbeat");
  }

  self.postMessage(heartbeat_valid);

  // setContext((c) => {
  // return { ...c, heartbeat: heartbeat_valid, heartbeat_counter: c.heartbeat_counter + 1 };
  // });
};

// heartbeat();
//   }, [updateCounter]);
