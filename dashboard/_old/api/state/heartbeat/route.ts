// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/models/api_models";

export async function GET() {
  // export async function GET(request: NextRequest) {
  console.log("getting heartbeat");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      authenticated: false,
      // data: {
      //   heartbeat: false,
      // },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 1000);

    await fetch("http://" + process.env.CONTROLLER_URI + `/state/heartbeat`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    }).then((res) => res.json());

    clearTimeout(timeoutId);

    return createAPIResponse({
      authenticated: true,
      data: {
        heartbeat: true,
      },
      error: false,
      error_string: ""
    });
  } catch (e) {
    console.error("Getting heartbeat failed");
    if ((e as any).name === "AbortError")
      return createAPIResponse({
        authenticated: true,
        data: {
          error: "AbortError",
          heartbeat: false,
        },
      });
    else
      return createAPIResponse({
        authenticated: true,
        data: {
          error: (e as any).name,
          heartbeat: false,
        },
      });
  }
}
