import logging

logger = logging.getLogger("CostAgent")

class CostAgent:
    def __init__(self, use_bedrock: bool = False):
        self.use_bedrock = use_bedrock

    def analyze_anomaly(self, cost_detail: dict) -> dict:
        """Inspects AWS Cost Explorer alerts and estimates budgets."""
        impact_usd = cost_detail.get("amount", 0.0)
        logger.info(f"Analyzing cost anomaly alert with estimated impact: ${impact_usd}")

        is_waste = impact_usd > 50.0

        return {
            "impact_usd": impact_usd,
            "cost_alert": "EC2 Billing Spike" if is_waste else "Normal fluctuation",
            "is_waste": is_waste,
            "recommended_reduction": "Halt over-provisioned instance nodes."
        }
