from pydantic import BaseModel
from typing import List, Dict, Set

class Grammar(BaseModel):
    productions: Dict[str, List[str]]
    start_symbol: str
    terminals: Set[str] = set()
    non_terminals: Set[str] = set()
    original_start_symbol: str = ""

    def __init__(self, **data):
        super().__init__(**data)
        self.original_start_symbol = self.start_symbol
        self._initialize_symbols()
        self._augment_grammar()

    def _initialize_symbols(self):
        """Initialize terminal and non-terminal sets from the productions"""
        self.non_terminals = set(self.productions.keys())
        self.terminals = set()
        
        for productions in self.productions.values():
            for production in productions:
                for symbol in production.split():
                    if symbol not in self.non_terminals:
                        self.terminals.add(symbol)

    def _augment_grammar(self):
        """Add augmented start symbol S' -> S$"""
        augmented_start = f"{self.original_start_symbol}'"
        if augmented_start not in self.productions:
            self.productions[augmented_start] = [self.original_start_symbol]
            self.start_symbol = augmented_start

    def validate_grammar(self) -> bool:
        """Validate if the grammar is properly formed"""
        if not self.start_symbol in self.productions:
            return False
        
        for lhs, rhs_list in self.productions.items():
            if not isinstance(rhs_list, list):
                return False
            for rhs in rhs_list:
                if not isinstance(rhs, str):
                    return False
                
        return True

    def get_first_sets(self) -> Dict[str, Set[str]]:
        """Compute FIRST sets for all symbols"""
        first: Dict[str, Set[str]] = {symbol: set() for symbol in self.non_terminals | self.terminals}
        
        # Ensure the augmented start symbol is included
        augmented_start = f"{self.original_start_symbol}'"
        if augmented_start not in first:
            first[augmented_start] = set()
        
        # Initialize FIRST sets for terminals
        for terminal in self.terminals:
            first[terminal] = {terminal}
            
        changed = True
        while changed:
            changed = False
            for non_terminal, productions in self.productions.items():
                for production in productions:
                    symbols = production.split()
                    if not symbols:  # Empty production
                        if '' not in first[non_terminal]:
                            first[non_terminal].add('')
                            changed = True
                        continue
                        
                    curr_first = set()
                    all_nullable = True
                    
                    for symbol in symbols:
                        symbol_first = first[symbol]
                        curr_first |= {s for s in symbol_first if s != ''}
                        if '' not in symbol_first:
                            all_nullable = False
                            break
                            
                    if all_nullable:
                        curr_first.add('')
                        
                    if not curr_first.issubset(first[non_terminal]):
                        first[non_terminal] |= curr_first
                        changed = True
                        
        return first