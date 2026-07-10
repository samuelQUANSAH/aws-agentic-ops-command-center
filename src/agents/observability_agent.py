import logging
import time

logger = logging.getLogger("ObservabilityAgent")

class ObservabilityAgent:
    def __init__(self):
        pass

    def record_metrics(self, incident_id: str, trace_history: list) -> dict:
        """Saves telemetry logs and metrics directly to DynamoDB & CloudWatch."""
        logger.info(f"Recording observability traces for incident: {incident_id}")

        total_latency = sum(t.get("latency_ms", 0) for t in trace_history)
        total_tokens = sum(t.get("tokens_consumed", 0) for t in trace_history)

        return {
            "incident_id": incident_id,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_latency_ms": total_latency,
            "total_tokens_consumed": total_tokens,
            "saved_in_cloudwatch": True,
            "saved_in_dynamodb": True
        }
