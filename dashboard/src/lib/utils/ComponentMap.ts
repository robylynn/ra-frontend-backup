import { CameraStreamPanel } from '@/lib/tiles/CameraPanel';
import { JogPanel } from '@/lib/tiles/JogPanel';
import { PlotPanel } from '@/lib/tiles/PlotPanel';
import { AITrainingPanel } from '@/lib/tiles/AITrainingPanel';
// import { TestStatisticsPanel } from '@/lib/tiles/TestInferencePanel';
import { AIModelStatisticsPanel } from '../tiles/AIStatsPanels';
import { ImageArchivePanel } from '../tiles/ImageArchivePanel';
// import React from "react"
// import { useState } from "react"

// const blankComponent: React.FC = (props: {label: string}) => {
//     const [state, setState] = useState('');

//     return (
//         <div>
//         </div>
//     )
// }

export const ComponentMap = {
    jogging: JogPanel,
    charts: PlotPanel,
    // charts: null,//(): React.FC => {return (
    camera: CameraStreamPanel,
    training: AITrainingPanel,
    image_archive: ImageArchivePanel,
    vision_statistics: AIModelStatisticsPanel,

    // vision_statistics: TestStatisticsPanel,

    // training: () => {},
    // image_archive: () => {},
    // vision_statistics: () => {}
};
