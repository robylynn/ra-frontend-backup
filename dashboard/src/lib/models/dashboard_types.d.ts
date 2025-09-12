import { ReactHTMLElement } from "react";

export interface DashboardHeaderContainerProps {
    id?: string;
    title?: string
    className?: string;
    fill_tile_callback?: Dispatch<SetStateAction<string>>;
    force_expanded?: boolean;
    icon_path?: string;
    isLoading?: boolean;
    children?: React.ReactElement;
}
