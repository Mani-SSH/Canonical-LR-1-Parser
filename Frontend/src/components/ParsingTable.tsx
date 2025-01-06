import React from "react";
import { ParsingTableEntry } from "../types";

interface ParsingTableProps {
  table: Record<string, ParsingTableEntry>;
}

export const ParsingTable: React.FC<ParsingTableProps> = ({ table }) => {
  // Extract unique states, terminal symbols, and non-terminal symbols from table keys
  const states = new Set<number>();
  const terminalSymbols = new Set<string>();
  const nonTerminalSymbols = new Set<string>();

  Object.keys(table).forEach((key) => {
    const match = key.match(/\((\d+), '(.+)'\)/);
    if (match) {
      const [_, state, symbol] = match;
      states.add(parseInt(state));
      if (symbol === symbol.toUpperCase()) {
        nonTerminalSymbols.add(symbol);
      } else {
        terminalSymbols.add(symbol);
      }
    }
  });

  // Ensure `$` is included in terminal symbols
  terminalSymbols.add("$");

  // Sort states in ascending order
  const sortedStates = Array.from(states).sort((a, b) => a - b);

  console.log("States:", sortedStates);
  console.log("Terminal Symbols:", Array.from(terminalSymbols));
  console.log("Non-Terminal Symbols:", Array.from(nonTerminalSymbols));
  console.log("Table:", table);

  return (
    <div className="card w-full shadow-lg rounded-lg">
      <div className="card-header bg-blue-500 text-white p-4 rounded-t-lg">
        <h2 className="card-title text-xl font-bold">Parsing Table</h2>
      </div>
      <div className="card-content p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th
                  colSpan={Array.from(terminalSymbols).length}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ACTION
                </th>
                <th
                  colSpan={Array.from(nonTerminalSymbols).length}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GOTO
                </th>
              </tr>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                {Array.from(terminalSymbols).map((symbol) => (
                  <th
                    key={symbol}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {symbol}
                  </th>
                ))}
                {Array.from(nonTerminalSymbols).map((symbol) => (
                  <th
                    key={symbol}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStates.map((state) => (
                <tr key={state}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {state}
                  </td>
                  {Array.from(terminalSymbols).map((symbol) => {
                    const entry = table[`(${state}, '${symbol}')`];
                    return (
                      <td
                        key={symbol}
                        className="px-4 py-2 text-sm text-gray-500"
                      >
                        {entry ? `${entry.action} ${entry.value}` : "-"}
                      </td>
                    );
                  })}
                  {Array.from(nonTerminalSymbols).map((symbol) => {
                    const entry = table[`(${state}, '${symbol}')`];
                    return (
                      <td
                        key={symbol}
                        className="px-4 py-2 text-sm text-gray-500"
                      >
                        {entry ? `${entry.action} ${entry.value}` : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
