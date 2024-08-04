// Frontend Web Application for RA Products
// Developed by R2 Labs

// AnalogInputPlot.js
import React, { useContext, useState } from 'react';
import { AnalogInputContext } from '@/lib/components/client_components/AnalogInputContext';

const AnalogInputPlot = () => {
  const { inputs } = useContext(AnalogInputContext);
  const [visiblePlots, setVisiblePlots] = useState([]);

  const togglePlotVisibility = (index) => {
    if (visiblePlots.includes(index)) {
      setVisiblePlots(visiblePlots.filter((i) => i !== index));
    } else {
      setVisiblePlots([...visiblePlots, index]);
    }
  };

  return (
    <div>
      {inputs
        .filter((input) => input.enabled)
        .map((input, index) => (
          <div key={index}>
            <label>
              <input
                type="checkbox"
                checked={visiblePlots.includes(index)}
                onChange={() => togglePlotVisibility(index)}
              />
              {input.label}
            </label>
          </div>
        ))}
      <div>
        {/* Plot component here, using visiblePlots to determine which plots to show */}
      </div>
    </div>
  );
};

export default AnalogInputPlot;