import React, { useState } from "react";
import { GrammarInput } from "./components/GrammarInput";
import { LR1SetsView } from "./components/Lr1Sets";
import { ParsingTable } from "./components/ParsingTable";

const App: React.FC = () => {
  const [lr1Sets, setLr1Sets] = useState<any>(null);
  const [parsingTable, setParsingTable] = useState<any>(null);

  const handleParserResult = (result: any) => {
    console.log("Parsing result:", result);
    setParsingTable(result.parsing_table);
  };

  return (
    <div className="p-4 space-y-4">
      <GrammarInput
        onSubmit={handleParserResult}
        onLr1SetsGenerated={setLr1Sets}
      />
      {lr1Sets && <LR1SetsView sets={lr1Sets} />}
      {parsingTable && <ParsingTable table={parsingTable} />}
    </div>
  );
};

export default App;
