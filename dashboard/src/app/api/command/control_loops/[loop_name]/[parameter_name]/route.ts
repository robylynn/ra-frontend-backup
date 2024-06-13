// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/reusable_models/api_models";

interface control_loop_path_interface {
  params: {
    loop_name: string;
    parameter_name: string;
  };
}

interface control_loop_command_interface {
  value: number | string;
}

export async function POST(
  request: NextRequest,
  path_params: control_loop_path_interface,
) {
  console.log("posting control loop command");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  let parameter_value: number | string;
  try {
    const request_json: control_loop_command_interface = await request.json();
    parameter_value = request_json.value;
  } catch (e) {
    return createAPIResponse({
      authenticated: true,
      data: "Bad request value",
    });
  }

  const controller_response = await fetch(
    "http://" +
      process.env.CONTROLLER_URI +
      `/control_loops/${path_params.params.loop_name}/${path_params.params.parameter_name}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        command_data: {
          value: parameter_value,
        },
      }),
    },
  ).then((res) => res.json());

  return createAPIResponse({
    authenticated: true,
    data: controller_response,
  });
}
