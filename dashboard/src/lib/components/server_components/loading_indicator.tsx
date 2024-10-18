// Frontend Web Application for RA Products
// Developed by R2 Labs

import Image from "next/image";

export default function LoadingIndicator(props: { className?: string }) {
  return (
    <div
      className={`flex flex-row items-center h-full w-full justify-center content-center ${
        props.className ?? ""
      }`}
    >
      <p className="font-bold dark:text-r2-white">LOADING</p>
      <div className="border-[4px] border-black/[0.1] border-t-[4px] border-t-white rounded-[50%] w-[25px] h-[25px] animate-spin mx-[10px] my-[20px]"></div>
      {/* <Image
        src={"/icons/loading.svg"}
        alt="Waiting for server..."
        className="fill-r2-white stroke-[5px]"
        width={50}
        height={50}
        priority
      /> */}
    </div>
  );
}
