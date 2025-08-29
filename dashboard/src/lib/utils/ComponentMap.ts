import { CameraStreamPanel } from "@/lib/tiles/CameraPanel"
import { JogPanel } from "@/lib/tiles/JogPanel"
import { PlotPanel } from "@/lib/tiles/PlotPanel"

export const ComponentMap = {
    jogging: JogPanel,
    charts: PlotPanel,
    camera: CameraStreamPanel
}