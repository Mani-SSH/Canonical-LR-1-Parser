import React, { useState } from "react";
import { GrammarInput } from "./components/GrammarInput";
import { LR1SetsView } from "./components/Lr1Sets";

const App: React.FC = () => {
  const [lr1Sets, setLr1Sets] = useState<any>(null);

  const handleLr1SetsGenerated = (sets: any) => {
    setLr1Sets(sets);
  };

  return (
    <div>
      <GrammarInput
        onSubmit={(result) => console.log("Parsing result:", result)}
        onLr1SetsGenerated={handleLr1SetsGenerated} // Pass the handler here
      />
      {lr1Sets && <LR1SetsView sets={lr1Sets} />}
    </div>
  );
};

export default App;
