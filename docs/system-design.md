# Enterprise System Design & Threat Modeling Playbook

This document details the scaling calculations, database indexing trade-offs, failure recovery modes, and STRIDE security threat modeling for the **Agentic Operations Command Center**.

---

## 📈 1. Scale & Cost Estimation Math

Estimating monthly Bedrock API costs for an enterprise deploying this system with an average of **1,000 security/cost alerts per day**:

### Assumptions
* **LLM Input Model**: Claude 3.5 Sonnet / Gemini 1.5 Pro ($3.00 / million tokens input)
* **LLM Output Model**: ($15.00 / million tokens output)
* **Average Tokens per Event Run**:
  * Input (Event context + RAG policies context + agent templates): **3,500 tokens**
  * Output (Incident analysis summary + remediation plan script): **500 tokens**

### Calculations
1. **Daily Input Cost**:
   $$\text{Daily Input} = 1,000 \text{ alerts} \times 3,500 \text{ tokens} = 3.5 \text{ million tokens}$$
   $$\text{Cost} = 3.5 \times \$3.00 = \$10.50 / \text{day}$$

2. **Daily Output Cost**:
   $$\text{Daily Output} = 1,000 \text{ alerts} \times 500 \text{ tokens} = 0.5 \text{ million tokens}$$
   $$\text{Cost} = 0.5 \times \$15.00 = \$7.50 / \text{day}$$

3. **Total Cost (Uncached)**:
   $$\text{Daily Total} = \$10.50 + \$7.50 = \$18.00 / \text{day}$$
   $$\text{Monthly Total (30 days)} = \$18.00 \times 30 = \$540.00 / \text{month}$$

4. **With RAG Caching Enabled (40% cache hit rate)**:
   * 40% of queries bypass the LLM entirely, saving both input and output costs.
   * **Adjusted Monthly Cost**: 
     $$\$540.00 \times (1 - 0.40) = \$324.00 / \text{month} \quad (\text{Savings of } \$216.00)$$

---

## 🛡️ 2. STRIDE Security Threat Modeling

| Threat Category | Potential System Risk | Mitigation Strategy | AWS Implementation |
| :--- | :--- | :--- | :--- |
| **S**poofing | Attacker simulates alerts to trigger unauthorized remediations. | Digitally sign alerts and authenticate command calls via OAuth2. | Amazon Cognito User Pools + API Gateway authorizers. |
| **T**ampering | Attacker intercepts and modifies agent execution logs. | Cryptographically enforce log immutability and encrypt storage. | AWS CloudTrail log file integrity validation + KMS encryption. |
| **R**epudiation | Operator denies approving a destructive resource shutdown. | Log absolute operator credentials alongside approval tokens. | DynamoDB trace schema containing Operator IAM identity + audit trail. |
| **I**nformation Disclosure | policy documents containing database keys are leaked. | Enforce server-side encryption and strict access rules. | S3 Bucket default SSE-KMS encryption + Block Public Access. |
| **D**enial of Service | Recursive agent loops trigger API threshold exhausts. | Enforce token budgets and strict execution rate-limits. | Step Functions execution timeout limits + FastAPI API Gateway rate-limiters. |
| **E**levation of Privilege | Remediation Lambda is exploited to delete root infra resources. | Restrict Lambda execution roles strictly to allowed actions. | AWS IAM least-privilege policies with Resource ARNs whitelists. |

---

## 🔄 3. Failure Modes & State Recovery

### Problem A: Bedrock / LLM Gateway Timeout
* **Impact**: Incident evaluation stalls; Step Functions thread hangs.
* **Recovery**: Step Functions JSON contains a fallback catch block (`TaskFailed` rule). It retries twice with exponential backoff, failing over to a lightweight local model or notifying the Operator via Amazon SNS.

### Problem B: DynamoDB Write Throttle
* **Impact**: Observability traces are lost; audit trail becomes incomplete.
* **Recovery**: We implement an **Amazon SQS** buffer queue between the Observability Agent and the DynamoDB writer. This guarantees that trace records are safely stored even under database throttling events.
