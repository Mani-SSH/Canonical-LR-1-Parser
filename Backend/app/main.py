import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the Backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parser.grammar import Grammar

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/parse', methods=['POST'])
def parse():
    data = request.json
    grammar_data = data.get('grammar')
    input_string = data.get('input_string')
    
    # Create Grammar object and calculate FIRST sets
    grammar = Grammar(productions=grammar_data['productions'], start_symbol=grammar_data['start_symbol'])
    first_sets = grammar.get_first_sets()
    
    # Print FIRST sets in the backend terminal
    print("FIRST sets:", first_sets)
    
    result = {
        "grammar": grammar_data,
        "input_string": input_string,
        "message": "Parsing successful"
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
