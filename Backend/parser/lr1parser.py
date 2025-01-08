from typing import Dict, Set, List, Tuple
from .grammar import Grammar

class LR1Parser:
    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.lr1_items: List[Set[Tuple[str, str, int, str]]] = []  # List of sets of LR(1) items
        self.parsing_table: Dict[Tuple[int, str], Tuple[str, int]] = {}  # (state, symbol) -> (action, next_state)
        self.goto_table: Dict[Tuple[int, str], int] = {}  # (state, non-terminal) -> next_state
        self.combined_table: Dict[str, List] = {}  # Initialize combined_table

    def compute_closure(self, items: Set[Tuple[str, str, int, str]]) -> Set[Tuple[str, str, int, str]]:
        """Compute closure of a set of LR(1) items"""
        closure = items.copy()
        changed = True
        first_sets = self.grammar.get_first_sets()

        while changed:
            changed = False
            new_items = set()

            for item in sorted(closure):  # Ensure deterministic processing by sorting items
                non_terminal, production, dot_pos, lookahead = item
                if dot_pos >= len(production.split()):
                    continue

                symbols = production.split()
                next_symbol = symbols[dot_pos]

                if next_symbol in self.grammar.non_terminals:
                    # Calculate first set of remaining symbols plus lookahead
                    remaining = symbols[dot_pos + 1:] + [lookahead]
                    first = set()
                    all_nullable = True

                    for symbol in remaining:
                        symbol_first = first_sets.get(symbol, {symbol})
                        first |= {s for s in symbol_first if s != ''}
                        if '' not in symbol_first:
                            all_nullable = False
                            break

                    if all_nullable:
                        first.add(lookahead)

                    # Add items for the non-terminal
                    for prod in sorted(self.grammar.productions[next_symbol]):  # Sort productions for consistency
                        for look in sorted(first):
                            new_item = (next_symbol, prod, 0, look)
                            if new_item not in closure:
                                new_items.add(new_item)
                                changed = True

            closure |= new_items

        return closure

    def compute_goto(self, items: Set[Tuple[str, str, int, str]], symbol: str) -> Set[Tuple[str, str, int, str]]:
        """Compute GOTO for a set of items and a grammar symbol"""
        goto_items = set()

        for item in sorted(items):
            non_terminal, production, dot_pos, lookahead = item
            symbols = production.split()

            # Only process items where dot is before the symbol we're looking for
            if dot_pos < len(symbols) and symbols[dot_pos] == symbol:
                new_item = (non_terminal, production, dot_pos + 1, lookahead)
                goto_items.add(new_item)

        # Only compute closure if we found any items
        return self.compute_closure(goto_items) if goto_items else set()

    def build_lr1_sets(self):
        """Build the collection of LR1 item sets"""
        start_item = (self.grammar.start_symbol, 
                    self.grammar.productions[self.grammar.start_symbol][0],
                    0, '$')
        initial_set = self.compute_closure({start_item})
        
        self.lr1_items = [initial_set]
        processed = set()
        
        # Clear existing goto table
        self.goto_table = {}
        
        while True:
            new_sets = []
            
            for i, item_set in enumerate(self.lr1_items):
                if i in processed:
                    continue
                    
                processed.add(i)
                
                # Process non-terminals first for GOTO table
                for symbol in sorted(self.grammar.non_terminals):
                    goto_set = self.compute_goto(item_set, symbol)
                    if goto_set:
                        if goto_set not in self.lr1_items:
                            new_sets.append(goto_set)
                            next_state = len(self.lr1_items) + len(new_sets) - 1
                        else:
                            next_state = self.lr1_items.index(goto_set)
                        self.goto_table[(i, symbol)] = next_state
                
                # Process terminals for ACTION table
                for symbol in sorted(self.grammar.terminals):
                    goto_set = self.compute_goto(item_set, symbol)
                    if goto_set:
                        if goto_set not in self.lr1_items:
                            new_sets.append(goto_set)
                            next_state = len(self.lr1_items) + len(new_sets) - 1
                        else:
                            next_state = self.lr1_items.index(goto_set)
                        self.parsing_table[(i, symbol)] = ('shift', next_state)
                        
            if not new_sets:
                break
                
            self.lr1_items.extend(new_sets)

    def build_parsing_table(self) -> Dict[Tuple[int, str], Tuple[str, int]]:
        """Build the LR(1) parsing table and return it"""
        self.build_lr1_sets()
        
        # Add reduce actions
        for i, item_set in enumerate(self.lr1_items):
            for item in item_set:
                non_terminal, production, dot_pos, lookahead = item
                symbols = production.split()
                
                if dot_pos == len(symbols):  # Reduce item
                    if non_terminal == self.grammar.start_symbol and lookahead == '$':
                        self.parsing_table[(i, '$')] = ('accept', 0)
                    else:
                        self.parsing_table[(i, lookahead)] = ('reduce', 
                            (non_terminal, production))
        
        # Debugging: Print the parsing table
        print("Parsing Table:")
        for key, value in self.parsing_table.items():
            print(f"{key}: {value}")
        
        return self.parsing_table

    def combine_tables(self) -> Dict[str, List]:
        """Combine parsing and goto tables into a single table."""
        self.combined_table = {}
        
        # Add ACTION entries from parsing table
        for (state, symbol), value in self.parsing_table.items():
            key = f"({state}, '{symbol}')"
            self.combined_table[key] = value
        
        # Add GOTO entries
        for (state, non_terminal), value in self.goto_table.items():
            key = f"({state}, '{non_terminal}')"
            self.combined_table[key] = ['goto', value]
        
        # Debugging: Print the combined table
        print("\nCombined Table:")
        for key, value in self.combined_table.items():
            print(f"{key}: {value}")
        
        return self.combined_table

    def parse_input(self, input_string: str) -> bool:
        """
        Parse an input string and return a list of steps for frontend visualization.
        Each step contains the complete state of the parser at that point.
        """
        # Initialize parsing components
        stack = [0]
        input_buffer = list(input_string + '$')
        symbol_stack = []
        steps = []
        
        while True:
            current_state = stack[-1]
            current_symbol = input_buffer[0]
            action_key = f"({current_state}, '{current_symbol}')"
            
            # Record current configuration before action
            current_step = {
                'stack': stack.copy(),
                'symbol_stack': symbol_stack.copy(),
                'input_buffer': ''.join(input_buffer),
                'current_state': current_state,
                'current_symbol': current_symbol,
                'action_key': action_key,
            }
            
            if action_key not in self.combined_table:
                current_step.update({
                    'action': 'error',
                    'description': f"No action found for {action_key}",
                    'status': 'rejected'
                })
                steps.append(current_step)
                return steps
            
            action = self.combined_table[action_key]
            current_step['action'] = action[0]
            
            if action[0] == 'shift':
                next_state = action[1]
                current_step.update({
                    'description': f"Shift {current_symbol} to state {next_state}",
                    'next_state': next_state
                })
                steps.append(current_step)
                
                # Perform shift
                stack.append(next_state)
                symbol_stack.append(current_symbol)
                input_buffer.pop(0)
                
            elif action[0] == 'reduce':
                non_terminal, production = action[1]
                production_length = len(production.split())
                
                current_step.update({
                    'description': f"Reduce by {non_terminal} → {production}",
                    'reduction': {
                        'non_terminal': non_terminal,
                        'production': production,
                        'length': production_length
                    }
                })
                
                # Record state before reduction
                steps.append(current_step)
                
                # Perform reduction
                for _ in range(production_length):
                    stack.pop()
                    symbol_stack.pop()
                
                symbol_stack.append(non_terminal)
                goto_state = stack[-1]
                goto_key = f"({goto_state}, '{non_terminal}')"
                
                if goto_key not in self.combined_table:
                    current_step.update({
                        'action': 'error',
                        'description': f"No goto action found for {goto_key}",
                        'status': 'rejected'
                    })
                    steps.append(current_step)
                    return steps
                
                goto_action = self.combined_table[goto_key]
                next_state = goto_action[1]
                
                # Add goto information
                current_step.update({
                    'goto': {
                        'state': goto_state,
                        'non_terminal': non_terminal,
                        'next_state': next_state
                    }
                })
                
                stack.append(next_state)
                
            elif action[0] == 'accept':
                current_step.update({
                    'description': "Input string accepted!",
                    'status': 'accepted'
                })
                steps.append(current_step)
                return steps
                
            else:
                current_step.update({
                    'action': 'error',
                    'description': f"Invalid action {action}",
                    'status': 'rejected'
                })
                steps.append(current_step)
                return steps

