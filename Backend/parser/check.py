if __name__ == "__main__" and __package__ is None:
    import sys
    from os import path
    sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from parser.grammar import Grammar
from parser.lr1parser import LR1Parser

def main():
    # Define the grammar
    grammar_data = {
      "productions": {
        "S": [
          "A A"
        ],
        "A": [
          "a A",
          "b"
        ]
      },
      "start_symbol": "S"
    }

    # Create Grammar object
    grammar = Grammar(**grammar_data)

    # Validate the grammar
    if not grammar.validate_grammar():
        print("Invalid grammar")
        return

    # Create LR1Parser object
    parser = LR1Parser(grammar)

    # Build LR(1) sets
    parser.build_lr1_sets()

    # Print LR(1) sets
    for i, item_set in enumerate(parser.lr1_items):
        print(f"Item set {i}:")
        for item in item_set:
            print(f"  {item}")
    
    # Print GOTO table
    print("\nGOTO Table:")
    for (state, symbol), next_state in parser.goto_table.items():
        print(f"State {state} with {symbol} -> State {next_state}")

if __name__ == "__main__":
    main()
