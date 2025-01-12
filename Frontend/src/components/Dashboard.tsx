import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { GrammarInput } from "./GrammarInput";
import { LR1SetsView } from "./Lr1Sets";
import { ParsingTable } from "./ParsingTable";
import ParsingVisualizer from "./ParsingVisualizer";

// Types for parser results and LR(1) sets
interface LR1Item {
  non_terminal: string;
  production: string;
  dot_position: number;
  lookahead: string;
}

interface LR1Set {
  state: number;
  items: LR1Item[];
}

interface ParserStep {
  stack: string[];
  input: string;
  action: string;
}

interface ParsingTableEntry {
  action: string;
  goto: string;
}

interface ParsingTableData {
  [state: string]: {
    [symbol: string]: ParsingTableEntry;
  };
}

interface ParserResult {
  combined_table: ParsingTableData;
  parse_steps: ParserStep[];
  lr1_sets?: LR1Set[];
}

interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
}) => (
  <section className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-6 flex justify-between items-center text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
    >
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h2>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-zinc-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-zinc-500" />
      )}
    </button>
    <div
      className={`transition-all duration-300 ease-in-out ${
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      } overflow-hidden`}
    >
      <div className="p-6 pt-0">{children}</div>
    </div>
  </section>
);

const Dashboard: React.FC = () => {
  // State with proper typing
  const [lr1Sets, setLr1Sets] = useState<LR1Set[] | null>(null);
  const [parsingTable, setParsingTable] = useState<ParsingTableData | null>(null);
  const [steps, setSteps] = useState<ParserStep[]>([]);

  // Expanded state for each section
  const [expandedSections, setExpandedSections] = useState({
    lr1Sets: false,
    parsingTable: false,
    parsingSteps: false,
  });

  // Toggle function for sections
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handler for parser results
  const handleParserResult = (result: ParserResult) => {
    setParsingTable(result.combined_table || null);
    setSteps(result.parse_steps || []);
    // Auto-expand sections when new results arrive
    setExpandedSections({
      lr1Sets: true,
      parsingTable: true,
      parsingSteps: true,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-zinc-50/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-3xl font-bold text-center bg-slate-200 bg-clip-text text-transparent">
            CLR(1) Parser Visualizer
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Grammar Input Section */}
        <section className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
          <GrammarInput
            onSubmit={handleParserResult}
            onLr1SetsGenerated={setLr1Sets}
          />
        </section>

        {/* LR(1) Sets Section */}
        {lr1Sets && (
          <CollapsibleSection
            title="LR(1) Sets"
            isExpanded={expandedSections.lr1Sets}
            onToggle={() => toggleSection('lr1Sets')}
          >
            <LR1SetsView sets={lr1Sets} />
          </CollapsibleSection>
        )}

        {/* Parsing Table Section */}
        {parsingTable && Object.keys(parsingTable).length > 0 && (
          <CollapsibleSection
            title="Parsing Table"
            isExpanded={expandedSections.parsingTable}
            onToggle={() => toggleSection('parsingTable')}
          >
            <ParsingTable table={parsingTable} />
          </CollapsibleSection>
        )}

        {/* Parsing Visualizer Section */}
        {steps.length > 0 && (
          <CollapsibleSection
            title="Parsing Steps"
            isExpanded={expandedSections.parsingSteps}
            onToggle={() => toggleSection('parsingSteps')}
          >
            <ParsingVisualizer steps={steps} />
          </CollapsibleSection>
        )}
      </main>
    </div>
  );
};

export default Dashboard;