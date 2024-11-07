import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

class PlotState {
    plot_lengths: Record<string, number> = {};
    update_rates: Record<string, number> = {};
}

interface PlotContextInterface {
    plotContext: PlotState;
    setPlotContext: Dispatch<SetStateAction<PlotState>>;
  }

export const PlotContext = createContext<PlotContextInterface>(null);

export function PlotContextProvider(props: {
    children: ReactNode;
  }) {
    // {plotContext, setPlotContext} = createContext<PlotContext>(new PlotContext());
    const [context, setContext] = useState<PlotState>(new PlotState());
    
    return (
        <PlotContext.Provider value={{plotContext: context, setPlotContext: setContext}}>
            {props.children}
        </PlotContext.Provider>
    )
}