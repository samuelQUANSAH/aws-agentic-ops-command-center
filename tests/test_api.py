import unittest
import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/src")

from api.main import app

class TestAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "online")

    def test_health_endpoint(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "HEALTHY")

    def test_simulate_endpoint(self):
        payload = {
            "event_type": "Public S3 Storage Bucket Detected",
            "details": "s3-bucket-01 open to public read"
        }
        res = self.client.post("/events/simulate", json=payload)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "INCIDENT_CREATED")
        
        incident_id = res.json()["incident_id"]
        
        # Test trace endpoint
        trace_res = self.client.get(f"/incidents/{incident_id}/trace")
        self.assertEqual(trace_res.status_code, 200)
        self.assertGreater(len(trace_res.json()), 0)

        # Test approval endpoint
        approval_payload = {"approved": True, "operator": "Samuel Quansah"}
        approve_res = self.client.post(f"/approval/{incident_id}", json=approval_payload)
        self.assertEqual(approve_res.status_code, 200)
        self.assertEqual(approve_res.json()["status"], "APPROVAL_PROCESSED")

if __name__ == '__main__':
    unittest.main()
