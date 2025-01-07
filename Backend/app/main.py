import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the Backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parser.grammar import Grammar
from parser.lr1parser import LR1Parser

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/parse', methods=['POST'])
def parse():
    data = request.json
    grammar_data = data.get('grammar')
    input_string = data.get('input_string')
    
    # Create Grammar object and calculate FIRST sets
    grammar = Grammar(productions=grammar_data['productions'], start_symbol=grammar_data['start_symbol'])
    first_sets = grammar.get_first_sets()
    
    # Convert sets to lists
    first_sets = {k: list(v) for k, v in first_sets.items()}
    
    # Create LR1Parser object and build LR(1) sets
    parser = LR1Parser(grammar)
    parser.build_lr1_sets()

    # Get both tables
    parsing_table = parser.build_parsing_table()
    goto_table = parser.goto_table
    
    # Convert LR(1) sets to a JSON serializable format
    lr1_sets = [list(item) for item in parser.lr1_items]
    
    # Merge GOTO table into parsing table
    # For GOTO entries, we'll use ["goto", state_number] to match the format of ACTION entries
    merged_table = {}
    
    # Add ACTION entries
    for key, value in parsing_table.items():
        merged_table[str(key)] = value
    
    # Add GOTO entries
    for key, value in goto_table.items():
        merged_table[str(key)] = ["goto", value]
    
    # Print the merged table for debugging
    print("Merged table:", merged_table)
    
    result = {
        "grammar": grammar_data,
        "input_string": input_string,
        "first_sets": first_sets,
        "lr1_sets": lr1_sets,
        "parsing_table": merged_table,  # Send only the merged table
        "message": "Parsing successful"
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)