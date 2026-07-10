import sys
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Inject root path to handle imports cleanly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.routes.api import api_router

# Setup logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("AgenticOpsCommandCenter")

app = FastAPI(
    title="Enterprise Agentic Operations Command Center API",
    description="AWS-native multi-agent incident detection, RAG reasoning, and remediation orchestration gateway.",
    version="1.0.0"
)

# Enable CORS for frontend dashboard queries
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount router
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AWS Agentic Operations Command Center",
        "endpoints": {
            "simulate": "/events/simulate (POST)",
            "incidents": "/incidents (GET)",
            "approval": "/approval/{id} (POST)",
            "metrics": "/metrics (GET)",
            "health": "/health (GET)"
        }
    }

@app.on_event("startup")
async def startup_event():
    logger.info("Enterprise Agentic Operations Command Center initialized successfully.")
