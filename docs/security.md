# Security & IAM Governance Playbook

The **Enterprise Agentic Operations Command Center** applies a **security-first** model to prevent runaway AI agent actions on AWS.

---

## 🔒 1. Control Before Autonomy (Human-in-the-Loop)
No destructive, billing-intensive, or policy-changing actions are allowed to execute automatically. The **Human Approval Agent** acts as an explicit gate:
* Workflow execution state pauses.
* An override token is minted and saved in DynamoDB.
* The API requires a valid operator credentials signature to resume step functions execution.

---

## 🛡️ 2. Least Privilege IAM Execution Role
Lambda remediation workers run under narrow execution roles (`infra/cdk/stacks/command_center_stack.py`):
* **S3 Permissions**: Read-only access restricted strictly to the RAG policy buckets.
* **DynamoDB Permissions**: Read and write capabilities restricted to the specific trace logs table.
* **Remediation Commands**: Explicitly whitelisted resource targets (e.g. S3 Public Block, EC2 Instance Stop).

---

## 🚫 3. Secrets & Key Isolation
* No Access Keys, API keys, or system details are stored in plain text.
* Environment configurations use `.env` files locally and AWS Systems Manager Parameter Store or AWS Secrets Manager in production.
