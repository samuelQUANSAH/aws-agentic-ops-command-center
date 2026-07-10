import time
import uuid
import logging
from typing import Dict, List

logger = logging.getLogger("AgenticOpsRouter")

# Simulated database/state store
incidents_db: Dict[str, dict] = {}
approvals_db: Dict[str, dict] = {}
traces_db: Dict[str, List[dict]] = {}

def add_trace(incident_id: str, agent_name: str, action: str, output: str, latency_ms: int, tokens: int = 15):
    if incident_id not in traces_db:
        traces_db[incident_id] = []
    
    traces_db[incident_id].append({
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "agent": agent_name,
        "action": action,
        "output": output,
        "latency_ms": latency_ms,
        "tokens_consumed": tokens
    })

def simulate_incident_workflow(event_type: str, details: str) -> str:
    incident_id = f"inc-{uuid.uuid4().hex[:8]}"
    
    # 1. Initialize Incident Record
    incidents_db[incident_id] = {
        "id": incident_id,
        "event_type": event_type,
        "details": details,
        "status": "INVESTIGATING",
        "risk_score": 0.0,
        "cost_estimate": 0.0,
        "remediation_plan": "Awaiting generation...",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # 2. Architect Agent
    start = time.time()
    add_trace(incident_id, "ArchitectAgent", "Classified event signal", f"Routed incident type: '{event_type}' to security and cost specialists.", 35, 12)
    
    # 3. Security Agent / Cost Agent (Parallel)
    if "s3" in event_type.lower() or "iam" in event_type.lower() or "security" in event_type.lower():
        risk_score = 0.85
        remediation_plan = "Revoke public policy on S3 bucket. Apply default block public access configuration."
        add_trace(incident_id, "SecurityAgent", "Checked AWS IAM & S3 configs", "Detected public read policy open to all principals on S3 bucket.", 110, 18)
        cost_estimate = 0.0
    else:
        risk_score = 0.40
        remediation_plan = "Halt over-provisioned instance. Auto-scale down cluster node capacity."
        add_trace(incident_id, "CostAgent", "Queried Cost Explorer metrics", "Detected daily EC2 billing spikes exceeding 300% of standard baseline.", 90, 15)
        cost_estimate = 125.50

    # 4. RAG Knowledge Agent
    add_trace(incident_id, "RAGKnowledgeAgent", "Queried S3 runbooks vector db", "Retrieved reference policy: 'SEC-04 Block S3 Public Access Directive'. Grounding citation found in SEC_RUNBOOK.pdf#L12-14.", 145, 24)

    # 5. Compliance Agent
    add_trace(incident_id, "ComplianceAgent", "Evaluated governance compliance", f"Validated remediation plan. Confirmed aligned with CIS AWS Foundations Benchmark 1.4.", 65, 14)

    # 6. Remediation Agent
    add_trace(incident_id, "RemediationAgent", "Generated AWS CLI command payload", f"Command generated: '{remediation_plan}'", 80, 16)

    # Update incident fields
    incidents_db[incident_id].update({
        "status": "PENDING_APPROVAL",
        "risk_score": risk_score,
        "cost_estimate": cost_estimate,
        "remediation_plan": remediation_plan
    })

    # 7. Human Approval Agent (Pauses execution)
    approvals_db[incident_id] = {
        "incident_id": incident_id,
        "approved": None,
        "operator": None,
        "decided_at": None
    }
    add_trace(incident_id, "HumanApprovalAgent", "Held execution for verification", "Workflow suspended. Posted verification card to Operator queue.", 15, 5)

    return incident_id

def process_human_approval(incident_id: str, approved: bool, operator_name: str) -> dict:
    if incident_id not in approvals_db:
        raise ValueError("Incident ID not found in approvals queue.")

    approvals_db[incident_id].update({
        "approved": approved,
        "operator": operator_name,
        "decided_at": time.strftime("%Y-%m-%d %H:%M:%S")
    })

    if approved:
        # 8. Executing Remediation
        add_trace(incident_id, "RemediationWorker", "Executing Lambda API command", "Remediation command successfully executed on target cluster node.", 120, 20)
        
        # 9. Observability Agent
        add_trace(incident_id, "ObservabilityAgent", "Completed trace telemetry", "Compiled all step tokens, latencies, and output hashes. Audit logs saved.", 45, 10)
        
        incidents_db[incident_id]["status"] = "REMEDIATED"
    else:
        # Aborting
        add_trace(incident_id, "RemediationWorker", "Aborted remediation action", "Command execution canceled by operator override.", 10, 5)
        add_trace(incident_id, "ObservabilityAgent", "Completed trace telemetry", "Workflow closed as rejected.", 30, 8)
        
        incidents_db[incident_id]["status"] = "ABORTED"

    return incidents_db[incident_id]
