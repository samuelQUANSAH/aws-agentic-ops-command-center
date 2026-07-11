#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.command_center_stack import AgenticOpsCommandCenterStack

app = cdk.App()

AgenticOpsCommandCenterStack(
    app, 
    "AgenticOpsCommandCenterStack",
    env=cdk.Environment(region="us-east-1")
)

app.synth()
