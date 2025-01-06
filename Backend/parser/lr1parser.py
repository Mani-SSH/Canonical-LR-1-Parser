class LR1Parser:
    def __init__(self, grammar):
        self.grammar = grammar
        # ...existing code...
        self.action_table = {}
        self.goto_table = {}
        # ...existing code...

    def parse(self, tokens):
        stack = [0]
        index = 0
        while True:
            state = stack[-1]
            token = tokens[index] if index < len(tokens) else '$'
            action = self.action_table.get((state, token))

            if action is None:
                raise SyntaxError(f"Unexpected token: {token}")

            if action[0] == 's':
                stack.append(int(action[1:]))
                index += 1
            elif action[0] == 'r':
                production = self.grammar.productions[int(action[1:])]
                for _ in range(len(production.body)):
                    stack.pop()
                stack.append(self.goto_table[(stack[-1], production.head)])
            elif action == 'acc':
                return True
            else:
                raise SyntaxError(f"Invalid action: {action}")

# ...existing code...
