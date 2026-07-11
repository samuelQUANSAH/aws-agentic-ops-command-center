from typing import List

class RemediationAllowlist:
    def __init__(self):
        # A strict whitelist of safe, allowed commands for automatic/approved execution
        self.allowed_commands: List[str] = [
            "aws s3api put-public-access-block",
            "aws ec2 stop-instances",
            "aws iam update-assume-role-policy",
            "aws ec2 revoke-security-group-ingress"
        ]

    def is_action_safe(self, command: str) -> bool:
        """Checks if a given AWS CLI command is in the safety whitelist."""
        return any(cmd in command for cmd in self.allowed_commands)
