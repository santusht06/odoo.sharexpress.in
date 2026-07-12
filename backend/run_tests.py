import sys
import os
from fastapi.testclient import TestClient

# Ensure parent directory is in path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from main import app
from core.database import get_db

client = TestClient(app)

def test_health():
    print("Testing /health...")
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    print("Health check passed!")

def test_auth_me_anonymous():
    print("Testing /auth/me anonymous...")
    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["success"] is False
    print("Anonymous auth check passed!")

if __name__ == "__main__":
    print("Starting AssetFlow ERP API unit tests...")
    try:
        test_health()
        test_auth_me_anonymous()
        print("\nAll basic API checks passed successfully!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\nAssertion failed during testing: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nError running tests: {e}")
        sys.exit(1)
