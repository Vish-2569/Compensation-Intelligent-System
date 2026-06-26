/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface SliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  id?: string;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  id,
  step = 1,
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.min(Number(e.target.value), value[1]);
    onChange([newVal, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.max(Number(e.target.value), value[0]);
    onChange([value[0], newVal]);
  };

  return (
    <div id={id} className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span>Min: {value[0]} yrs</span>
        <span>Max: {value[1]} yrs</span>
      </div>

      <div className="relative h-2 bg-slate-200 rounded-lg">
        {/* Fill track line */}
        <div
          className="absolute h-2 bg-indigo-600 rounded-lg"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none"
          style={{ zIndex: value[0] > max - 5 ? 5 : 3 }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
};
