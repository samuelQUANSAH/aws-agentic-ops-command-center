# Interview Demo Script & Execution Guide

This script guides you through demonstrating the **Enterprise Agentic Operations Command Center** during an engineering interview or technical client walkthrough.

---

## 🎬 Act I: The System Pitch
1. **Introduction**:
   > *"I built an AWS-native Operations Command Center. It coordinates nine specialized agents through Step Functions to detect, analyze, and resolve cloud infrastructure incident alerts securely."*
2. **Key Capabilities to Highlight**:
   * EventBridge-triggered ingestion.
   * RAG-grounded security policies retrieved from S3.
   * Safety guardrails (allowing only specified whitelist AWS commands).
   * Strict Human-in-the-Loop gates.

---

## 🚀 Act II: The Active Run
1. **Inject a Threat**:
   * On the dashboard, select **`Public S3 Storage Bucket Detected`** from the simulation injector.
   * Click **`Inject Signal`**.
2. **Explain the Collaborative Agent Traces**:
   * Show how **ArchitectAgent** classified the event and assigned specialized agents.
   * Point out **SecurityAgent** flagging the public read permission.
   * Highlight **RAGKnowledgeAgent** fetching policy runbook `SEC_RUNBOOK.pdf#L12-14` as grounded evidence.
   * Explain **ComplianceAgent** validating the fix against `CIS-AWS-1.4`.
3. **Trigger the Human Override**:
   * Explain why the workflow suspended: *"We never execute automated fixes without human verification."*
   * Type your operator signature (`Samuel Quansah`) and click **`Approve Execution`**.
   * Show the trace output updating as the **RemediationWorker** runs the Lambda code on AWS.
