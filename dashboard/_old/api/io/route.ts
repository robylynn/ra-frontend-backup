import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import {
  BackendAPIResponseInterface,
  createAPIResponse,
} from "@/lib/models/api_models";

export async function POST(request: NextRequest) {
  // let client_id = null;
  if (!process.env.DISABLE_AUTHENTICATION) {
    const session = await getServerSession(authOptions);
    if (session == null) {
        return createAPIResponse({
        data: null,
        authenticated: false,
        });
    }
  }

  try {
    let port_name = request.nextUrl.searchParams.get("port");
    let point_index = request.nextUrl.searchParams.get("index");
    let point_type = request.nextUrl.searchParams.get("point_type");
    let point_name = request.nextUrl.searchParams.get("name");

    if (
      port_name == null ||
      point_index == null ||
      point_type == null ||
      point_name == null
    ) {
      throw Error("Missing query parameters");
    }

    const point_configuration_response = await fetch(
      "http://" +
        process.env.CONTROLLER_URI +
        `/configuration/io/configure_point?` +
        request.nextUrl.searchParams,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    )
      .then((res) => res.json())
      .then((res: BackendAPIResponseInterface) => res.data);

      return createAPIResponse({
        authenticated: true,
        data: point_configuration_response
      })
  } catch (e) {
    return createAPIResponse({
      authenticated: true,
      error: true,
      error_string: (e as any).name,
    });
  }
}
