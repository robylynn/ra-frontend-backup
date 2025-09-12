import { CameraStreamPanel } from "@/lib/tiles/CameraPanel"
import { JogPanel } from "@/lib/tiles/JogPanel"
import { PlotPanel } from "@/lib/tiles/PlotPanel"
import { TestStatisticsPanel } from "@/lib/tiles/TestInferencePanel";
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
    training: CameraStreamPanel,
    image_archive: CameraStreamPanel,
    vision_statistics: TestStatisticsPanel,
    // training: () => {},
    // image_archive: () => {},
    // vision_statistics: () => {}
};