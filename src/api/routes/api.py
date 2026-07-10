from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import orchestration.router as router
import config

api_router = APIRouter()

class EventSimulationPayload(BaseModel):
    event_type: str = Field(..., example="Public S3 Bucket Detected")
    details: str = Field("GuardDuty alert: s3-bucket-01 open to public read access.", example="s3-bucket-01")

class ApprovalPayload(BaseModel):
    approved: bool = Field(..., example=True)
    operator: str = Field("system-admin", example="Samuel Quansah")

@api_router.post("/events/simulate")
async def simulate_event(payload: EventSimulationPayload):
    """Simulates EventBridge receiving a cost/security alert, routing to agents."""
    try:
        incident_id = router.simulate_incident_workflow(
            event_type=payload.event_type,
            details=payload.details
        )
        return {
            "status": "INCIDENT_CREATED",
            "incident_id": incident_id,
            "incident_details": router.incidents_db[incident_id],
            "message": "Orchestrator routed event through security, compliance, and cost specialists. suspended at human gate."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")

@api_router.get("/incidents")
async def get_incidents():
    """Returns the list of all registered incidents."""
    return list(router.incidents_db.values())

@api_router.get("/incidents/{id}")
async def get_incident(id: str):
    """Returns details of a single incident."""
    if id not in router.incidents_db:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return router.incidents_db[id]

@api_router.get("/incidents/{id}/trace")
async def get_incident_trace(id: str):
    """Returns the step-by-step multi-agent reasoning trace history."""
    if id not in router.traces_db:
        raise HTTPException(status_code=404, detail="Incident trace not found.")
    return router.traces_db[id]

@api_router.post("/approval/{id}")
async def submit_approval(id: str, payload: ApprovalPayload):
    """Submits manual operator approval or rejection to execute remediation."""
    if id not in router.approvals_db:
        raise HTTPException(status_code=404, detail="Incident not found in approvals queue.")
    
    try:
        updated_incident = router.process_human_approval(
            incident_id=id,
            approved=payload.approved,
            operator_name=payload.operator
        )
        return {
            "status": "APPROVAL_PROCESSED",
            "incident": updated_incident
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process approval: {e}")

@api_router.get("/metrics")
async def get_metrics():
    """Returns aggregated latency, cost savings, and token consumption statistics."""
    total_tokens = sum(
        sum(t.get("tokens_consumed", 0) for t in steps)
        for steps in router.traces_db.values()
    )
    total_incidents = len(router.incidents_db)
    active_incidents = sum(1 for inc in router.incidents_db.values() if inc["status"] == "PENDING_APPROVAL")
    remediated_incidents = sum(1 for inc in router.incidents_db.values() if inc["status"] == "REMEDIATED")

    return {
        "total_incidents": total_incidents,
        "active_incidents": active_incidents,
        "remediated_incidents": remediated_incidents,
        "total_tokens_consumed": total_tokens,
        "total_cost_saved_usd": round((total_tokens * 0.0015 / 1000.0) * 0.4, 4),
        "active_agents": 9,
        "system_status": "NORMAL"
    }

@api_router.get("/health")
async def get_health():
    return {"status": "HEALTHY", "agents": "OK", "step_functions": "MOCKED"}
