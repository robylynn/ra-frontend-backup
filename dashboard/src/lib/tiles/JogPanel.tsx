// Frontend Web Application for RA Products
// Developed by R2 Labs

import { DashboardHeaderContainer } from '@/lib/components/client_components/DashboardHeaderContainer';
import JogContainer from '@/lib/components/client_components/JogContainer';
import { DashboardHeaderContainerProps } from '@/lib/models/dashboard_types';

export const JogPanel: React.FC<DashboardHeaderContainerProps> = (
    props: DashboardHeaderContainerProps
) => {
    return (
        <DashboardHeaderContainer
            header_text={'Jog'}
            icon_path={'/icons/sliders.svg'}
            className={`${props.className ?? ''}`}
            fill_tile_id={props.id}
            fill_tile_callback={props.fill_tile_callback}
        >
            <JogContainer />
        </DashboardHeaderContainer>
    );
};
