// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { BackendAPIResponse, createAPIResponse } from "@/lib/reusable_models/api_models";

export async function GET() {
  // export async function GET(request: NextRequest) {
  console.log("getting clients");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      authenticated: false,
      data: {
        clients: [],
      },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000);

    // let z = await fetch("http://" + process.env.CONTROLLER_URI + `/state/clients`, {
    //     method: "GET",
    //     //signal: controller.signal,
    //   }).then((res) => res.json());
    
    let data: BackendAPIResponse = await fetch("http://" + process.env.CONTROLLER_URI + `/state/clients`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      cache: "no-store",
    }).then((res) => res.json());

    clearTimeout(timeoutId);

    return createAPIResponse({
      authenticated: true,
      data: {
        clients: data.data,
      },
    });
  } catch (e) {
    console.error("Getting clients failed");
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
          clients: []
        },
      });
  }
}
