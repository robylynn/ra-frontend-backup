import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import { DashboardHeaderContainerProps } from '@/lib/models/dashboard_types';
import OPCUAComponent from '@/lib/components/client_components/OPCUAComponent';

export const OPCConfigurationPanel: React.FC<DashboardHeaderContainerProps> = (
    props: DashboardHeaderContainerProps
) => {
    return (
        <>
            <DashboardHeaderContainer
                header_text={'OPC Configuration'}
                icon_path={'/icons/globe.svg'}
                className={`${props.className ?? ''}`}
                fill_tile_id={props.id}
                fill_tile_callback={props.fill_tile_callback}
            >
                <OPCUAComponent/>
            </DashboardHeaderContainer>
        </>
    );
};
