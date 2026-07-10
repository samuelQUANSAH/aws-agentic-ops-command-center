import aws_cdk as cdk
from aws_cdk import (
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_lambda as _lambda,
    aws_events as events,
    aws_events_targets as targets,
    aws_iam as iam,
)
from constructs import Construct

class AgenticOpsCommandCenterStack(cdk.Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. S3 Bucket for RAG policy and runbook docs
        policy_bucket = s3.Bucket(
            self, "AgenticPolicyBucket",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=cdk.RemovalPolicy.DESTROY  # For demo cleanup convenience
        )

        # 2. DynamoDB Table to log multi-agent traces and audit trails
        trace_table = dynamodb.Table(
            self, "AgenticIncidentTraceTable",
            partition_key=dynamodb.Attribute(
                name="incident_id",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="timestamp",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY
        )

        # 3. IAM Role for Agent Execution (least privilege)
        agent_exec_role = iam.Role(
            self, "AgentExecutorRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            description="Least-privilege execution role for agent remediation tasks."
        )

        # Allow reading S3 policies and writing logs to DynamoDB
        policy_bucket.grant_read(agent_exec_role)
        trace_table.grant_read_write_data(agent_exec_role)

        # 4. Lambda Function representing the Agent Remediation Worker
        remediation_worker = _lambda.Function(
            self, "AgentRemediationWorker",
            runtime=_lambda.Runtime.PYTHON_3_10,
            handler="handler.main",
            code=_lambda.Code.from_inline(
                "def main(event, context):\n"
                "    print('Agent Remediation triggered:', event)\n"
                "    return {'status': 'SUCCESS', 'message': 'Simulated action executed.'}\n"
            ),
            role=agent_exec_role
        )

        # 5. EventBridge Rule to route GuardDuty / CloudTrail signals to Step Functions
        cloud_alert_rule = events.Rule(
            self, "CloudIncidentAlertRule",
            event_pattern=events.EventPattern(
                source=["aws.guardduty", "aws.securityhub", "aws.costexplorer"],
                detail_type=["GuardDuty Finding", "Security Hub Findings - Imported", "Cost Anomaly Alert"]
            )
        )

        # Add target target (representing the Step Functions orchestrator)
        # cloud_alert_rule.add_target(targets.SfnStateMachine(state_machine))

        # Output bucket and table details for config integration
        cdk.CfnOutput(self, "PolicyBucketName", value=policy_bucket.bucket_name)
        cdk.CfnOutput(self, "TraceTableName", value=trace_table.table_name)
