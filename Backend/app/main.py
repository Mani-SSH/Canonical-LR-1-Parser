import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the Backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parser.grammar import Grammar
from parser.lr1parser import LR1Parser

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes and origins

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
    
    # Print FIRST sets in the backend terminal
    print("FIRST sets:", first_sets)
    
    # Create LR1Parser object and build LR(1) sets
    parser = LR1Parser(grammar)
    parser.build_lr1_sets()
    
    # Print LR(1) sets in the backend terminal
    print("LR(1) sets:", parser.lr1_items)
    
    # Convert LR(1) sets to a JSON serializable format
    lr1_sets = [list(item) for item in parser.lr1_items]
    
    result = {
        "grammar": grammar_data,
        "input_string": input_string,
        "first_sets": first_sets,
        "lr1_sets": lr1_sets,  # Include converted LR(1) sets in the response
        "message": "Parsing successful"
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
