import logging

logger = logging.getLogger("SecurityAgent")

class SecurityAgent:
    def __init__(self, use_bedrock: bool = False):
        self.use_bedrock = use_bedrock

    def analyze_findings(self, finding_detail: dict) -> dict:
        """Inspects AWS GuardDuty, Security Hub or CloudTrail data."""
        finding_id = finding_detail.get("id", "unknown-finding")
        severity = finding_detail.get("severity", 0.0)
        
        logger.info(f"Analyzing security finding {finding_id} with severity {severity}")
        
        # Risk assessment logic
        risk_score = 0.4
        if severity > 7.0:
            risk_score = 0.90
        elif severity > 4.0:
            risk_score = 0.65

        return {
            "finding_id": finding_id,
            "risk_score": risk_score,
            "threat_detected": "Public access open policy" if severity > 7.0 else "Minor configuration drift",
            "recommended_containment": "Revoke target bucket policy immediately."
        }
