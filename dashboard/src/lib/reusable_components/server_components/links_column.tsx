// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";

import authOptions from "@/lib/auth/auth_options";
import StateReadout from "@/lib/reusable_components/client_components/state_readout";

function PageTab(props: {
  icon_path: string;
  tab_text: string;
  href: string;
  className?: string;
  text_className?: string;
}) {
  return (
    <Link
      href={props.href}
      className={`
            grid 
            grid-cols-[30%_70%] 
            text-black 
            hover:bg-slate-400 
            hover:text-white 
            hover:no-underline 
            focus:border-0
            p-2 
            content-center 
            items-center 
            rounded-xl 
            justify-around 
            text-sm
            w-[90%]
            ${props.className ?? ""}
            `}
    >
      <Image
        src={props.icon_path}
        alt={props.tab_text}
        className="dark:invert-[.58] dark:sepia-[.8] dark:saturate-[3.85] dark:brightness-[.95] dark:contrast-[.94] dark:hue-rotate-[65deg]"
        width={35}
        height={35}
        priority
      />
      <p
        className={`font-bold dark:text-white m-0 p-0 ${
          props.text_className ?? ""
        }`}
      >
        {props.tab_text}
      </p>
    </Link>
  );
}

export default async function LinksColumn(props: {
  // user: string;
  className?: string;
}) {
  let username: string;
  const session = await getServerSession(authOptions); //.then(res => res)
  if (session == null) {
    username = "NONE";
  } else {
    username = session.user?.name ?? "UNAVAILABLE";
  }

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <div className="flex flex-col items-center">
        <div
          className={`flex flex-row items-center justify-around w-full m-2 ${
            props.className ?? ""
          }`}
        >
          <Image
            src={"/branding/r2_logo.svg"}
            alt="RA Frontend Built by R2 Labs"
            className="dark:invert"
            // width={100}
            // height={100}
            width={75}
            height={75}
            priority
          />
          <PageTab
            tab_text={username}
            icon_path={"/icons/user.svg"}
            href={session == null ? "/api/auth/signin" : "/api/auth/signout"}
            className="border rounded-full h-fit w-fit"
            text_className="text-xs text-center"
          />
        </div>
        {session != null ? (
          <div className="flex flex-col items-center w-full space-y-1">
            <PageTab
              tab_text={"Dashboard"}
              icon_path={"/icons/Dashboard.svg"}
              href={"/dashboard"}
            />
            <PageTab
              tab_text={"Devices"}
              icon_path={"/icons/device.svg"}
              href={"/devices"}
            />
            <PageTab
              tab_text={"Control"}
              icon_path={"/icons/trello.svg"}
              href={"/controls"}
            />
            <PageTab
              tab_text={"Measurement"}
              icon_path={"/icons/sliders.svg"}
              href={"/measurement"}
            />
            <PageTab
              tab_text={"Data Charts"}
              icon_path={"/icons/Diagnose.svg"}
              href={"/charts"}
            />
            <PageTab
              tab_text={"Control Loops"}
              icon_path={"/icons/Loop.svg"}
              href={"/control_loops"}
            />
            <PageTab
              tab_text={"Setup"}
              icon_path={"/icons/Control.svg"}
              href={"/setup"}
            />
            <PageTab
              tab_text={"Diagnostics"}
              icon_path={"/icons/grid.svg"}
              href={"/diagnostics"}
            />
            <PageTab
              tab_text={"Safety"}
              icon_path={"/icons/alert-circle.svg"}
              href={"/safety"}
            />
            <PageTab
              tab_text={"Administration"}
              icon_path={"/icons/user.svg"}
              href={"/administration"}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
      {session != null ? <StateReadout /> : <></>}
    </div>
  );
}
