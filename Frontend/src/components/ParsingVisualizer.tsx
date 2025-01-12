import { useState } from "react";
import { Step } from "../types";

const ParsingVisualizer = ({ steps }: { steps: Step[] }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (steps.length === 0) {
    return <div>No steps available</div>;
  }

  const step = steps[currentStep];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Previous
        </button>
        <span className="text-lg font-semibold">
          Step {currentStep + 1} of {steps.length}
        </span>
        <button
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          onClick={() =>
            setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
            
          }
          disabled={currentStep === steps.length - 1}
          
        >
          Next
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">State Stack</h3>
            <div className="flex flex-wrap gap-2">
              {step.stack.map((state, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 flex items-center justify-center border border-blue-500 rounded"
                >
                  {state}
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Symbol Stack</h3>
            <div className="flex flex-wrap gap-2">
              {step.symbol_stack.map((symbol, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 flex items-center justify-center border border-green-500 rounded"
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Input Buffer</h3>
          <div className="flex flex-wrap gap-2">
            {step.input_buffer.split("").map((char, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 flex items-center justify-center border rounded
                  ${
                    idx === 0
                      ? "bg-red-500 border-yellow-500"
                      : "border-gray-300"
                  }`}
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Current Action</h3>
          <p>{step.description}</p>
          {step.action === "reduce" && step.reduction && (
            <div className="mt-2 text-blue-600">
              Reducing: {step.reduction.non_terminal} →{" "}
              {step.reduction.production}
            </div>
          )}
          {step.goto && (
            <div className="mt-2 text-green-600">
              Goto: State {step.goto.state} with {step.goto.non_terminal} →
              State {step.goto.next_state}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParsingVisualizer;
