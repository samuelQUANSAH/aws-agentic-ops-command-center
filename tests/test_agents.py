import unittest
import sys
import os

# Ensure project modules are importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/src")

from agents.architect_agent import ArchitectAgent
from agents.security_agent import SecurityAgent
from agents.cost_agent import CostAgent
from agents.compliance_agent import ComplianceAgent

class TestAgents(unittest.TestCase):

    def setUp(self):
        self.architect = ArchitectAgent()
        self.security = SecurityAgent()
        self.cost = CostAgent()
        self.compliance = ComplianceAgent()

    def test_architect_classification_security(self):
        event = {"source": "aws.guardduty", "detail-type": "GuardDuty Finding"}
        result = self.architect.classify_event(event)
        self.assertEqual(result["category"], "SECURITY")
        self.assertIn("SecurityAgent", result["agents_required"])

    def test_architect_classification_cost(self):
        event = {"source": "aws.costexplorer", "detail-type": "Cost Anomaly Alert"}
        result = self.architect.classify_event(event)
        self.assertEqual(result["category"], "COST")
        self.assertIn("CostAgent", result["agents_required"])

    def test_security_threat_detection(self):
        finding = {"id": "f-123", "severity": 8.5}
        result = self.security.analyze_findings(finding)
        self.assertGreaterEqual(result["risk_score"], 0.8)
        self.assertEqual(result["finding_id"], "f-123")

    def test_cost_waste_flagging(self):
        cost_event = {"amount": 120.50}
        result = self.cost.analyze_anomaly(cost_event)
        self.assertTrue(result["is_waste"])

    def test_compliance_safeties(self):
        unsafe_plan = "delete all user permissions"
        result = self.compliance.verify_action(unsafe_plan)
        self.assertFalse(result["compliant"])
        self.assertEqual(result["governance_status"], "BLOCKED_BY_COMPLIANCE")

if __name__ == '__main__':
    unittest.main()
