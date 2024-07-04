// Frontend Web Application for RA Products
// Developed by R2 Labs

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth/auth_options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session == null) {
    redirect("/api/auth/signin");
  }
  redirect("/dashboard");

  // return (
  //   <>
  //     <div className="flex items-center justify-center w-full h-full">
  //       <Image
  //         src="/branding/r2_logo.png"
  //         height={50}
  //         width={50}
  //         alt="Seabound Dashboard"
  //         className="mx-5"
  //       />
  //       <Link
  //         className="px-2 py-1 text-xl border rounded outline-none border-slate-300 text-slate-300 hover:bg-slate-700 focus-within:bg-slate-700"
  //         href="/dashboard"
  //       >
  //         Dashboard
  //       </Link>
  //     </div>
  //   </>
  // );
}
