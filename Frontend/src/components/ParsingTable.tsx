import React from "react";

interface ParsingTableProps {
  table: Record<string, [string, number | [string, string]]>;
}

export const ParsingTable: React.FC<ParsingTableProps> = ({ table }) => {
  const states = new Set<number>();
  const terminalSymbols = new Set<string>();
  const nonTerminalSymbols = new Set<string>();

  Object.keys(table).forEach((key) => {
    const match = key.match(/\((\d+),\s*'(.+)'\)/);
    if (match) {
      const [_, state, symbol] = match;
      states.add(parseInt(state));

      // Identify terminals and non-terminals
      if (symbol === symbol.toUpperCase() && symbol !== "$") {
        nonTerminalSymbols.add(symbol);
      } else {
        terminalSymbols.add(symbol);
      }
    }
  });

  const maxState = Math.max(...states);
  for (let i = 0; i <= maxState; i++) {
    states.add(i);
  }

  const sortedStates = Array.from(states).sort((a, b) => a - b);
  const sortedTerminals = Array.from(terminalSymbols).sort();
  const sortedNonTerminals = Array.from(nonTerminalSymbols).sort();

  const formatEntry = (
    entry: [string, number | [string, string]] | undefined
  ): string => {
    if (!entry) return "";
    const [action, value] = entry;

    switch (action) {
      case "shift":
        return `S${value}`;
      case "reduce":
        if (Array.isArray(value)) {
          const [nonTerminal, production] = value;
          return `Reduce:${nonTerminal}→${production}`;
        }
        return `Reduce:${value}`;
      case "accept":
        return "Accept";
      case "goto":
        return `${value}`;
      default:
        return "";
    }
  };

  return (
    <div className="card w-full shadow-lg rounded-lg overflow-x-auto">
      <div className="p-4">
        <table className="min-w-full border-collapse">
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
                <td className="border px-4 py-2 text-center font-medium">
                  {state}
                </td>
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
