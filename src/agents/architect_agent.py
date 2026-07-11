import logging

logger = logging.getLogger("ArchitectAgent")

class ArchitectAgent:
    def __init__(self, use_bedrock: bool = False):
        self.use_bedrock = use_bedrock

    def classify_event(self, event_payload: dict) -> dict:
        """Classifies the inbound Cloud event signal."""
        event_source = event_payload.get("source", "unknown")
        detail_type = event_payload.get("detail-type", "unknown")
        
        logger.info(f"Classifying event from source: {event_source} ({detail_type})")
        
        if "guardduty" in event_source.lower() or "security" in event_source.lower():
            category = "SECURITY"
            agents_required = ["SecurityAgent", "RAGKnowledgeAgent", "ComplianceAgent", "RemediationAgent"]
        elif "cost" in event_source.lower():
            category = "COST"
            agents_required = ["CostAgent", "RAGKnowledgeAgent", "ComplianceAgent", "RemediationAgent"]
        else:
            category = "GENERAL_OPS"
            agents_required = ["IncidentAgent", "RAGKnowledgeAgent"]

        return {
            "category": category,
            "agents_required": agents_required,
            "severity": "HIGH" if category == "SECURITY" else "MEDIUM"
        }
