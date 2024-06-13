// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { CommandRequestData } from "@/lib/reusable_models/api_models";
import { createAPIResponse } from "@/lib/reusable_models/api_models";

export async function POST(request: NextRequest) {
  console.log("posting STATE");

  const session = await getServerSession(authOptions);
  if (session == null) {
    console.log("Attempted state command without authentication");
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  const request_data: CommandRequestData = await request.json();

  const controller_response = await fetch(
    "http://" + process.env.CONTROLLER_URI + "/system/state",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command_type: request_data?.state,
      }),
    },
  ).then((res) => res.json());

  return createAPIResponse({
    authenticated: true,
    data: controller_response,
  });
}
