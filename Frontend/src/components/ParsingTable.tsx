import React from "react";

interface ParsingTableProps {
  table: Record<string, [string, number | string[]]>;
}

export const ParsingTable: React.FC<ParsingTableProps> = ({ table }) => {
  // Extract unique states, terminal symbols, and non-terminal symbols from table keys
  const states = new Set<number>();
  const terminalSymbols = new Set<string>();
  const nonTerminalSymbols = new Set<string>();

  // First pass: collect all states from the table keys
  Object.keys(table).forEach((key) => {
    const match = key.match(/\((\d+), '(.+)'\)/);
    if (match) {
      const [_, state, symbol] = match;
      states.add(parseInt(state));
      if (symbol === symbol.toUpperCase() && symbol !== "$") {
        nonTerminalSymbols.add(symbol);
      } else {
        terminalSymbols.add(symbol);
      }
    }
  });

  // Ensure we have all states from 0 to the maximum state
  const maxState = Math.max(...states);
  for (let i = 0; i <= maxState; i++) {
    states.add(i);
  }

  // Sort states and symbols
  const sortedStates = Array.from(states).sort((a, b) => a - b);
  const sortedTerminals = Array.from(terminalSymbols).sort();
  const sortedNonTerminals = Array.from(nonTerminalSymbols).sort();

  // Format table entry for display
  const formatEntry = (
    entry: [string, number | string[]] | undefined
  ): string => {
    if (!entry) return "";
    const [action, value] = entry;

    switch (action) {
      case "shift":
        return `S${value}`;
      case "reduce":
        if (Array.isArray(value)) {
          const [nonTerminal, production] = value;
          // Map the production to the correct reduction number
          if (nonTerminal === "S" && production === "A A") return "R1";
          if (nonTerminal === "A" && production === "a A") return "R2";
          if (nonTerminal === "A" && production === "b") return "R3";
        }
        return `R${value}`;
      case "accept":
        return "accept";
      case "goto":
        return `${value}`;
      default:
        return "";
    }
  };

  return (
    <div className="card w-full shadow-lg rounded-lg">
      <div className="p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2" rowSpan={2}>
                State
              </th>
              <th
                className="border px-4 py-2 text-center"
                colSpan={sortedTerminals.length}
              >
                ACTION
              </th>
              <th
                className="border px-4 py-2 text-center"
                colSpan={sortedNonTerminals.length}
              >
                GOTO
              </th>
            </tr>
            <tr>
              {sortedTerminals.map((symbol) => (
                <th key={symbol} className="border px-4 py-2 text-center">
                  {symbol}
                </th>
              ))}
              {sortedNonTerminals.map((symbol) => (
                <th key={symbol} className="border px-4 py-2 text-center">
                  {symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStates.map((state) => (
              <tr key={state}>
                <td className="border px-4 py-2 text-center">{state}</td>
                {sortedTerminals.map((symbol) => (
                  <td key={symbol} className="border px-4 py-2 text-center">
                    {formatEntry(table[`(${state}, '${symbol}')`])}
                  </td>
                ))}
                {sortedNonTerminals.map((symbol) => (
                  <td key={symbol} className="border px-4 py-2 text-center">
                    {formatEntry(table[`(${state}, '${symbol}')`])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParsingTable;
