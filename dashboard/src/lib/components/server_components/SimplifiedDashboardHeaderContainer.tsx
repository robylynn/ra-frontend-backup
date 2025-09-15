// Frontend Web Application for RA Products
// Developed by R2 Labs

import { DashboardHeaderContainerProps } from "@/lib/models/dashboard_types";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export function SimplifiedDashboardHeaderContainer({
  id = uuidv4(),
  title,
  icon_path,
  className = "",
  isLoading = false,
  children,
}: DashboardHeaderContainerProps) {
  return (
    <div
      className={`flex flex-col rounded-xl mx-2 bg-r2-dark-background-300 h-full transition-all duration-200  ${
        className ?? ""
      }`}
      id={id}
    >
      <div className="flex flex-row items-center p-2 rounded-xl group justify-between">
        <div className="flex flex-row">
          <Image
            src={icon_path}
            alt={title}
            className="dark:invert"
            width={20}
            height={20}
            priority
          />
          <p className="p-0 px-2 m-0 font-bold text-sm dark:text-white/[0.88] peer-checked/control:text-black">
            {title}
          </p>
        </div>
      </div>
      <div className="relative h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400 overflow-hidden">
        <div className="h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400">
          {/* <div className="h-full mx-2 mb-2 rounded-xl bg-r2-dark-background-400 overflow-y-scroll"></div> */}
          {children}
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
            <div className="border-[8px] border-black/[0.3] border-t-[8px] border-t-white rounded-[50%] w-[60px] h-[60px] animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
