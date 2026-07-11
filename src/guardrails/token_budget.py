class TokenBudgetGuardrail:
    def __init__(self, limit: int = 150):
        self.limit = limit

    def check_budget(self, current_consumption: int) -> bool:
        """Returns True if budget is safe, False if exceeded."""
        return current_consumption <= self.limit
