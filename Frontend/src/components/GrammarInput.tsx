import React, { useState } from "react";
import { Grammar, ParserInput } from "../types";

interface GrammarInputProps {
  onSubmit: (input: ParserInput) => void;
  onLr1SetsGenerated: (sets: any) => void; // Callback for LR(1) sets
}

const defaultGrammar: Grammar = {
  productions: {
    S: ["A A"],
    A: ["a A", "b"],
  },
  start_symbol: "S",
};

export const GrammarInput: React.FC<GrammarInputProps> = ({
  onSubmit,
  onLr1SetsGenerated,
}) => {
  const [grammar, setGrammar] = useState<Grammar | string>(
    JSON.stringify(defaultGrammar, null, 2)
  );
  const [inputString, setInputString] = useState<string>("a a b");
  const [error, setError] = useState<string>("");

  // Transform raw LR(1) sets into the expected format
  const transformLr1Sets = (rawSets: any[]): any[] => {
    return rawSets.map((set, index) => ({
      state: index,
      items: set.map((item: any[]) => ({
        non_terminal: item[0],
        production: item[1],
        dot_position: item[2],
        lookahead: item[3],
      })),
    }));
  };

  const handleGrammarChange = (value: string) => {
    setGrammar(value);
  };

  const handleGrammarSubmit = () => {
    try {
      const parsed = JSON.parse(grammar as string);
      if (parsed.productions && parsed.start_symbol) {
        setGrammar(JSON.stringify(parsed, null, 2));
        setError("");
      } else {
        throw new Error("Invalid grammar format");
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      setError(
        "Invalid JSON format: " + (e instanceof Error ? e.message : String(e))
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let parsedGrammar: Grammar;

    try {
      parsedGrammar =
        typeof grammar === "string" ? JSON.parse(grammar) : grammar;
    } catch (e) {
      setError("Invalid JSON format");
      return;
    }

    const data: ParserInput = {
      grammar: parsedGrammar,
      input_string: inputString,
    };

    console.log("Submitting data:", data); // Log the request data

    try {
      const response = await fetch("http://localhost:5000/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Response from backend:", result);

      // Transform the raw data
      const transformedSets = transformLr1Sets(result.lr1_sets);
      onLr1SetsGenerated(transformedSets); // Pass transformed data
      onSubmit(result);
    } catch (error) {
      console.error("Error submitting data to backend:", error);
      setError("Error submitting data to backend");
    }
  };

  return (
    <div className="card w-full shadow-lg rounded-lg">
      <div className="card-header bg-red-500 text-white p-4 rounded-t-lg">
        <h2 className="card-title text-xl font-bold">Grammar Input</h2>
      </div>
      <div className="card-content p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Grammar (JSON format)
          </label>
          <textarea
            value={
              typeof grammar === "string"
                ? grammar
                : JSON.stringify(grammar, null, 2)
            }
            onChange={(e) => handleGrammarChange(e.target.value)}
            className="h-64 font-mono w-full p-2 border rounded-lg shadow-inner"
            placeholder="Enter grammar in JSON format..."
          />
          <button
            onClick={handleGrammarSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 mt-2"
          >
            Submit Grammar
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Input String</label>
          <input
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            className="w-full p-2 border rounded-lg shadow-inner"
            placeholder="Enter input string..."
          />
        </div>
        {error && (
          <div className="alert alert-destructive bg-red-100 text-red-700 p-2 rounded-lg mt-4">
            <div className="alert-description">{error}</div>
          </div>
        )}
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={!!error}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 disabled:opacity-50"
          >
            Parse Input
          </button>
        </div>
      </div>
    </div>
  );
};
