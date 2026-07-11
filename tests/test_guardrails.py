import unittest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/src")

from guardrails.token_budget import TokenBudgetGuardrail
from guardrails.remediation_allowlist import RemediationAllowlist

class TestGuardrails(unittest.TestCase):

    def test_token_budget_allowed(self):
        budget = TokenBudgetGuardrail(limit=100)
        self.assertTrue(budget.check_budget(80))
        self.assertFalse(budget.check_budget(120))

    def test_remediation_whitelist_match(self):
        allowlist = RemediationAllowlist()
        self.assertTrue(allowlist.is_action_safe("aws s3api put-public-access-block --bucket test"))
        self.assertFalse(allowlist.is_action_safe("aws s3api delete-bucket --bucket test"))

if __name__ == '__main__':
    unittest.main()
