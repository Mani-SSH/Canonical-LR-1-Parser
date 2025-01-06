import { GrammarInput } from "./components/GrammarInput";

export default function App() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <GrammarInput onSubmit={console.log} />
    </div>
  );
}
