from typing import Dict, Set, List, Tuple
from .grammar import Grammar

class LR1Parser:
    def __init__(self, grammar: Grammar):
        self.grammar = grammar
        self.lr1_items: List[Set[Tuple[str, str, int, str]]] = []  # List of sets of LR(1) items
        self.parsing_table: Dict[Tuple[int, str], Tuple[str, int]] = {}  # (state, symbol) -> (action, next_state)
        self.goto_table: Dict[Tuple[int, str], int] = {}  # (state, non-terminal) -> next_state

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
        
        return self.parsing_table

    def parse_string(self, input_string: str) -> List[dict]:
        """Parse an input string and return the steps of the parsing process"""
        if not self.parsing_table:
            self.build_parsing_table()

        steps = []
        stack = [(0, '$')]  # (state, symbol)
        symbols = input_string.split() + ['$']
        cursor = 0

        while True:
            current_state = stack[-1][0]
            current_symbol = symbols[cursor]

            if (current_state, current_symbol) not in self.parsing_table:
                raise ValueError(f"Parsing error at symbol {current_symbol}")

            action, value = self.parsing_table[(current_state, current_symbol)]
            steps.append({
                'stack': [(s, sym) for s, sym in stack],
                'input': symbols[cursor:],
                'action': action,
                'value': str(value)
            })

            if action == 'shift':
                stack.append((value, current_symbol))
                cursor += 1
            elif action == 'reduce':
                non_terminal, production = value
                num_symbols = len(production.split())
                for _ in range(num_symbols):
                    stack.pop()
                prev_state = stack[-1][0]
                next_state = self.goto_table[(prev_state, non_terminal)]
                stack.append((next_state, non_terminal))
            elif action == 'accept':
                break
            else:
                raise ValueError('Invalid action')

        return steps
