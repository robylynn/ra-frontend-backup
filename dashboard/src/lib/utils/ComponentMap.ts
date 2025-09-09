import { CameraStreamPanel } from "@/lib/tiles/CameraPanel"
import { JogPanel } from "@/lib/tiles/JogPanel"
import { PlotPanel } from "@/lib/tiles/PlotPanel"
import React from "react"

export const ComponentMap = {
    jogging: JogPanel,
    charts: PlotPanel,
    // charts: null,//(): React.FC => {return (
    camera: CameraStreamPanel
}