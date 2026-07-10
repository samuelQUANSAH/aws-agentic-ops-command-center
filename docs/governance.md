# Governance, Token Containment & Cost Control

Multi-agent environments can scale calls exponentially, causing runaway API billing cycles. This playbook documents cost containment boundaries.

---

## 🚦 1. Budget Restrictions
* **Token Budget Limit**: Truncates workflows exceeding 150 prompt tokens per session.
* **Context Window Guardrail**: Restricts RAG retrieval chunk expansion (`top_k`) to a maximum of 5 matching nodes.
* **Parallel Execution Capping**: Step function loops are capped at a maximum of 2 agent reasoning iterations.

---

## 🗄️ 2. Retrieval Caching Directive
Repeat queries are mapped directly to memory caches, completely bypassing Bedrock inference layers. This saves context tokens and reduces operational latency.

---

## 📊 3. Audit Logging
Every action, tool input, resource match, risk percentage, and output text is recorded in DynamoDB under a single composite trace schema, ensuring audit readiness for corporate review.
