import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import { IOConfigurationComponent } from '@/lib/components/client_components/IOConfigurationComponent';
import { DashboardHeaderContainerProps } from '@/lib/models/dashboard_types';

export const IOConfigurationPanel: React.FC<DashboardHeaderContainerProps> = (
    props: DashboardHeaderContainerProps
) => {
    return (
        <>
            <DashboardHeaderContainer
                header_text={'IO Configuration'}
                icon_path={'/icons/plc.svg'}
                className={`${props.className ?? ''}`}
                fill_tile_id={props.id}
                fill_tile_callback={props.fill_tile_callback}
            >
                {/* {renderedPlots()} */}
                <IOConfigurationComponent />
            </DashboardHeaderContainer>
        </>
    );
};
