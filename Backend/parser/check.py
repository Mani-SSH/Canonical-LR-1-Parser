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

    input_string = "aabb"

    # Create Grammar object
    grammar = Grammar(**grammar_data)

    # Validate the grammar
    if not grammar.validate_grammar():
        print("Invalid grammar")
        return

    parser = LR1Parser(grammar)
    parser.build_parsing_table()
    parser.combine_tables()
    result = parser.parse_input(input_string)
    for i in result:
        print(i)

if __name__ == "__main__":
    main()