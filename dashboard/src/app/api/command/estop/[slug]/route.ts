// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/models/api_models";

interface estop_path_interface {
  params: {
    slug: string;
  };
}

export async function POST(
  request: NextRequest,
  path_params: estop_path_interface,
) {
  console.log("posting estop command");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  if (path_params.params.slug == "set" || path_params.params.slug == "reset") {
    const controller_response = await fetch(
      "http://" +
        process.env.CONTROLLER_URI +
        `/system/estop/${path_params.params.slug}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    ).then((res) => res.json());

    return createAPIResponse({
      authenticated: true,
      data: controller_response,
    });
  } else {
    return createAPIResponse({
      authenticated: true,
      data: "Bad EStop request",
    });
  }
}
