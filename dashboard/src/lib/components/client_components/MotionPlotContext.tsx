import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

class PlotContext {
    plot_lengths: Record<string, number> = {};
    update_rates: Record<string, number> = {};
}

interface MotionPlotContextInterface {
    motionPlotContext: PlotContext;
    setMotionPlotContext: Dispatch<SetStateAction<PlotContext>>;
  }

export const MotionPlotContext = createContext<MotionPlotContextInterface>(null);

export function MotionPlotContextProvider(props: {
    children: ReactNode;
  }) {
    // {plotContext, setPlotContext} = createContext<PlotContext>(new PlotContext());
    const [context, setContext] = useState<PlotContext>(new PlotContext());
    
    return (
        <MotionPlotContext.Provider value={{motionPlotContext: context, setMotionPlotContext: setContext}}>
            {props.children}
        </MotionPlotContext.Provider>
    )
}