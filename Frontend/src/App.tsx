import { GrammarInput } from "./components/GrammarInput";

export default function App() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <GrammarInput onSubmit={console.log} />
      <h1 className="bg-blue-700 text-3xl font-bold underline">Hello world!</h1>
    </div>
  );
}
