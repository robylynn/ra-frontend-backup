import {
    NextAPIResponseInterface,
  } from "@/lib/models/api_models";

export default async function timeoutFetch<Type>(path: string, timeout: number): Promise<Type> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort("Timeout");
  }, timeout);

  let request_params: RequestInit = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    cache: "no-store",
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

    ret = fetch_response.data.data;
  } catch (e) {
    console.log(`fetcher error getting ${path}: ` + e);

    ret = null;
  }

  clearTimeout(timeoutId);
  return ret;
}
