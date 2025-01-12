import React, { useState } from 'react';
import { ParserInput } from "../types";

interface Production {
  nonTerminal: string;
  productions: string[];
}

interface GrammarBuilderProps {
  onSubmit: (input: ParserInput) => void;
  onLr1SetsGenerated: (sets: any) => void;
}

export const GrammarInput: React.FC<GrammarBuilderProps> = ({ onSubmit, onLr1SetsGenerated }) => {
  const [startSymbol, setStartSymbol] = useState<string>('S');
  const [newNonTerminal, setNewNonTerminal] = useState<string>('');
  const [productions, setProductions] = useState<Production[]>([
    { nonTerminal: 'S', productions: [] },
    { nonTerminal: 'A', productions: [] }
  ]);
  const [inputString, setInputString] = useState<string>('aabb');
  const [newProduction, setNewProduction] = useState<{ [key: string]: string }>({
    'S': '',
    'A': ''
  });
  const [error, setError] = useState<string>('');

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

  const handleAddNonTerminal = () => {
    if (newNonTerminal && !productions.find(p => p.nonTerminal === newNonTerminal)) {
      setProductions([...productions, { nonTerminal: newNonTerminal, productions: [] }]);
      setNewProduction({ ...newProduction, [newNonTerminal]: '' });
      setNewNonTerminal('');
    }
  };

  const normalizeProductionString = (input: string): string => {
    // Remove extra spaces and split by spaces
    const tokens = input.trim().split(/\s+/);
    
    // Handle cases where tokens might be stuck together
    const separatedTokens = tokens.flatMap(token => {
      // If token is exactly 'AA', split it into ['A', 'A']
      if (token === 'AA') return ['A', 'A'];
      
      // If token contains 'A' followed by another character
      if (token.includes('A')) {
        return token.split('A').reduce((acc: string[], part, index, array) => {
          if (index === 0 && part === '') {
            acc.push('A');
          } else if (index < array.length - 1) {
            if (part !== '') acc.push(part);
            acc.push('A');
          } else if (part !== '') {
            acc.push(part);
          }
          return acc;
        }, []);
      }
      
      return [token];
    });

    // Join with single spaces
    return separatedTokens.join(' ');
  };

  const handleAddProduction = (nonTerminal: string) => {
    if (newProduction[nonTerminal].trim()) {
      const normalizedProduction = normalizeProductionString(newProduction[nonTerminal]);
      setProductions(productions.map(p => 
        p.nonTerminal === nonTerminal 
          ? { ...p, productions: [...p.productions, normalizedProduction] }
          : p
      ));
      setNewProduction({ ...newProduction, [nonTerminal]: '' });
    }
  };

  const handleParseInput = async (event: React.MouseEvent) => {
    event.preventDefault();
    setError('');

    // Normalize the input string before sending
    const normalizedInputString = normalizeProductionString(inputString);

    // Convert productions to the expected format
    const grammarData: ParserInput = {
      grammar: {
        productions: productions.reduce((acc, curr) => ({
          ...acc,
          [curr.nonTerminal]: curr.productions
        }), {}),
        start_symbol: startSymbol
      },
      input_string: normalizedInputString
    };

    try {
      console.log("Submitting data:", grammarData);
      
      const response = await fetch('http://localhost:5000/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grammarData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Response from backend:", result);

      const transformedSets = transformLr1Sets(result.lr1_sets);
      onLr1SetsGenerated(transformedSets);

      onSubmit({ ...result, parsing_table: result.parsing_table });
    } catch (error) {
      console.error('Error parsing input:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to parse input'}`);
    }
  };

  const handleReset = () => {
    setStartSymbol('S');
    setNewNonTerminal('');
    setProductions([
      { nonTerminal: 'S', productions: [] },
      { nonTerminal: 'A', productions: [] }
    ]);
    setInputString('aabb');
    setNewProduction({
      'S': '',
      'A': ''
    });
    setError('');
  };


  return (
    <div className="<min-h-screen mx-auto p-4">
      <div className=" text-white p-4 rounded-t-lg">
        <h1 className="text-2xl font-bold">Grammar Builder</h1>
      </div>
      
      <div className=" p-6  space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Start Symbol
          </label>
          <select
            value={startSymbol}
            onChange={(e) => setStartSymbol(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {productions.map(p => (
              <option key={p.nonTerminal} value={p.nonTerminal}>
                {p.nonTerminal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Add Non-Terminal
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNonTerminal}
              onChange={(e) => setNewNonTerminal(e.target.value)}
              placeholder="New non-terminal (e.g., B)"
              className="flex-1 p-2 border rounded-md"
            />
            <button
              onClick={handleAddNonTerminal}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg text-gray-200 font-medium mb-4">New Production:</h2>
            {productions.map(({ nonTerminal }) => (
              <div key={nonTerminal} className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            {nonTerminal}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newProduction[nonTerminal]}
              onChange={(e) => setNewProduction({
                ...newProduction,
                [nonTerminal]: e.target.value
              })}
              className="flex-1 p-2 border rounded-md"
              placeholder="Enter production rule..."
            />
            <button
              onClick={() => handleAddProduction(nonTerminal)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              →
            </button>
          </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg text-gray-200 font-medium">
          Productions
              </h2>
              <button
              onClick={handleReset}
              className="bg-red-500 ml-60 text-xs text-white px-4 rounded-md hover:bg-red-600"
              >
              X
              </button>
            </div>

            
            <div className="font-serif bg-gray-100 bg-opacity-95 min-h-40 text-center py-8 text-gray-700 rounded-md" style={{ minHeight: `${productions.length * 5}rem` }}>
              {productions.map(({ nonTerminal, productions }) => (
          <div key={nonTerminal} className="mb-2">
            {productions.length > 0 && (
              <div>
                <span className="font-medium">{nonTerminal}</span> →{' '}
                {productions.join(' | ')}
              </div>
            )}
          </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Input String
          </label>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          onClick={handleParseInput}
          className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors"
        >
          Parse Input
        </button>
      </div>
    </div>
  );
};