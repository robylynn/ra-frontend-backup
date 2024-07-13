// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import {
  ServerAPIResponse,
  createAPIResponse,
} from "@/lib/models/api_models";

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
      error: false,
      error_string: ""
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

    let data: ServerAPIResponse = await fetch(
      "http://" + process.env.CONTROLLER_URI + `/state/clients`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
      }
    ).then((res) => res.json());

    clearTimeout(timeoutId);

    return createAPIResponse({
      authenticated: true,
      data: {
        clients: data.data,
      },
      error: false,
      error_string: ""
    });
  } catch (e) {
    console.error("Getting clients failed");
    if ((e as any).name === "AbortError")
      return createAPIResponse({
        authenticated: true,
        data: {
          error: "AbortError",
        },
        error: true,
        error_string: (e as any).name,
      });
    else
      return createAPIResponse({
        authenticated: true,
        data: {
          clients: [],
        },
        error: true,
        error_string: (e as any).name,
      });
  }
}
