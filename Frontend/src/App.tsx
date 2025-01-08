import React, { useState } from "react";
import { GrammarInput } from "./components/GrammarInput";
import { LR1SetsView } from "./components/Lr1Sets";
import { ParsingTable } from "./components/ParsingTable";
import ParsingVisualizer from "./components/ParsingVisualizer";

const App: React.FC = () => {
  const [lr1Sets, setLr1Sets] = useState<any>(null);
  const [parsingTable, setParsingTable] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);

  const handleParserResult = (result: any) => {
    setParsingTable(result.combined_table || null);
    setSteps(result.parse_steps || []);
  };

  return (
    <div className="p-4 space-y-4">
      <GrammarInput
        onSubmit={handleParserResult}
        onLr1SetsGenerated={setLr1Sets}
      />
      {lr1Sets && <LR1SetsView sets={lr1Sets} />}
      {parsingTable && Object.keys(parsingTable).length > 0 && (
        <ParsingTable table={parsingTable} />
      )}
      {steps.length > 0 && <ParsingVisualizer steps={steps} />}
    </div>
  );
};

export default App;
