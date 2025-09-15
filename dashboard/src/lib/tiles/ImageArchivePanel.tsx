"use client";

import { DashboardHeaderContainer } from "@/lib/components/client_components/DashboardHeaderContainer";
import ImageArchiveContainer from "@/lib/components/client_components/ImageArchiveContainer";
import { Dispatch, SetStateAction } from "react";

export const ImageArchivePanel = (props: {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
  variant?: "full" | "compact" | "simple";
}) => {
  const { variant = "full" } = props;

  return (
    <DashboardHeaderContainer
      header_text="Images"
      icon_path={"/icons/gallery.svg"}
      className={props.className || ""}
      fill_tile_id={props.id}
      fill_tile_callback={props.fill_tile_callback}
    >
      <div className="w-full h-full bg-gray-900">
        {variant === "compact" && (
          <ImageArchiveContainer
            layout="compact"
            showFilters={true}
            showDetails={true}
            maxImages={8}
            refreshInterval={8000}
          />
        )}

        {variant === "simple" && (
          <ImageArchiveContainer
            layout="full"
            showFilters={false}
            showDetails={false}
            maxImages={6}
            refreshInterval={10000}
          />
        )}

        {variant === "full" && (
          <ImageArchiveContainer
            layout="full"
            showFilters={true}
            showDetails={true}
            maxImages={12}
            refreshInterval={10000}
          />
        )}
      </div>
    </DashboardHeaderContainer>
  );
}

// Export different variations
type ImageArchivePanelProps = {
  id: string;
  className?: string;
  fill_tile_callback?: Dispatch<SetStateAction<string>>;
  force_expanded?: boolean;
};

export const CompactImageArchivePanel = (props: ImageArchivePanelProps) => {
  return <ImageArchivePanel {...props} variant="compact" />;
}

export const SimpleImageArchivePanel = (props: ImageArchivePanelProps) => {
  return <ImageArchivePanel {...props} variant="simple" />;
}