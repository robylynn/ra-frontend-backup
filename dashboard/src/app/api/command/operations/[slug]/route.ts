// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/reusable_models/api_models";

interface operations_path_interface {
  params: {
    slug: string;
  };
}

export async function POST(
  request: NextRequest,
  path_params: operations_path_interface,
) {
  console.log("posting operations command");

  const session = await getServerSession(authOptions);
  if (session == null) {
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  if (!request.nextUrl.searchParams.has("value")) {
    return createAPIResponse({
      authenticated: true,
      data: `Invalid operations query for '${path_params.params.slug}'`,
    });
  }

  let query_value: string | null;
  switch (path_params.params.slug) {
    case "plan_id":
    case "experiment_id": {
      try {
        query_value = request.nextUrl.searchParams.get("value");

        const controller_response = await fetch(
          "http://" +
            process.env.CONTROLLER_URI +
            `/system/operations/${path_params.params.slug}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command_data: {
                value: query_value,
              },
            }),
          },
        ).then((res) => res.json());

        return createAPIResponse({
          authenticated: true,
          data: controller_response,
        });
      } catch (e) {
        return createAPIResponse({
          authenticated: true,
          data: `Invalid operations query for '${path_params.params.slug}'`,
        });
      }
    }
    case "operator_note": {
      try {
        query_value = request.nextUrl.searchParams.get("value");

        const controller_response = await fetch(
          "http://" +
            process.env.CONTROLLER_URI +
            `/system/events/${path_params.params.slug}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              command_data: {
                value: query_value,
              },
            }),
          },
        ).then((res) => res.json());

        return createAPIResponse({
          authenticated: true,
          data: controller_response,
        });
      } catch (e) {
        return createAPIResponse({
          authenticated: true,
          data: "Invalid operations query for 'operator_note'",
        });
      }
    }
  }
}
