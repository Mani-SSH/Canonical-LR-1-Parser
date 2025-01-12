import React from "react";
import { LR1State } from "../types";

interface LR1SetsViewProps {
  sets: LR1State[];
}

export const LR1SetsView: React.FC<LR1SetsViewProps> = ({ sets }) => {
  return (
    <div className="w-full shadow-md rounded-lg">
      <div className="p-4">
        <div className="space-y-4">
          {sets.map((stateSet) => (
            <div key={stateSet.state} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">State {stateSet.state}</h3>
              <div className="space-y-2">
                {stateSet.items.map((item, index) => (
                  <div key={index} className="font-serif font-light text-lg">
                    {item.non_terminal} →{" "}
                    {item.production
                      .split(" ")
                      .map((symbol, i) =>
                        i === item.dot_position ? "•" + symbol : symbol
                      )
                      .join(" ")}
                    , {item.lookahead}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
