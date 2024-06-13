// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { notFound } from "next/navigation";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";
import { createAPIResponse } from "@/lib/reusable_models/api_models";
import {
  getDatabaseDocuments,
  getDatabaseIOState,
  getDatabaseMessages,
} from "@/lib/utils/database_queries";

export async function GET(
  req: NextRequest,
  { params }: { params: { stream_name: string; count: string } },
) {
  const session = await getServerSession(authOptions);

  if (session == null) {
    console.log(
      `Attempted ${params.stream_name} stream access without authentication`,
    );
    return createAPIResponse({
      data: null,
      authenticated: false,
    });
  }

  let db_data;
  switch (params.stream_name) {
    case "data": {
      console.log("STREAMING DATA");
      db_data = await getDatabaseDocuments(parseInt(params.count));
      break;
    }
    case "messages": {
      console.log("STREAMING MESSAGES");
      db_data = await getDatabaseMessages(parseInt(params.count));
      break;
    }
    case "io": {
      console.log("STREAMING IO");
      db_data = await getDatabaseIOState(parseInt(params.count));
      break;
    }
    default: {
      return notFound();
    }
  }

  return createAPIResponse({
    data: db_data,
    authenticated: true,
  });
}
