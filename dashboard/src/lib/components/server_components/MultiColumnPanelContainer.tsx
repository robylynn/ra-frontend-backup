import {
    ButtonsColumn,
    ToolTipButtonProps,
} from '@/lib/components/client_components/ToolTipButtonsColumn';

interface MultiColumnPanelContainerProps {
    buttons: ToolTipButtonProps[];
    children: React.ReactNode;
}

export const MultiColumnPanelContainer: React.FC<
    MultiColumnPanelContainerProps
> = ({ buttons, children }) => {
    return (
        <div className="grid grid-cols-[93%_7%] h-full">
            <div className="h-full bg-gray-100 p-4 flex flex-col items-center font-sans overflow-y-scroll">
                <div className="w-full max-w-7xl">{children}</div>
            </div>
            <ButtonsColumn buttons={buttons} />
        </div>
    );
};
