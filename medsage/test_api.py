"""
MedSage API Test Script
Test signup, login, and other API endpoints
"""

import requests
import json

API_BASE_URL = "http://localhost:5000/api"

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print('='*60)
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except:
        print(response.text)
    print(f"Status Code: {response.status_code}\n")

def test_health_check():
    """Test API health check"""
    print("\n[TEST] Health Check")
    response = requests.get(f"{API_BASE_URL}/health")
    print_response("API Health Check Response", response)
    return response.status_code == 200

def test_signup(email, password, full_name, age, gender):
    """Test user signup"""
    print("\n[TEST] User Signup")
    payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "age": age,
        "gender": gender
    }
    response = requests.post(f"{API_BASE_URL}/auth/signup", json=payload)
    print_response("Signup Response", response)
    
    if response.status_code == 201:
        data = response.json()
        return {
            "success": True,
            "user_id": data.get("user_id"),
            "token": data.get("token"),
            "email": data.get("email")
        }
    return {"success": False}

def test_login(email, password):
    """Test user login"""
    print("\n[TEST] User Login")
    payload = {
        "email": email,
        "password": password
    }
    response = requests.post(f"{API_BASE_URL}/auth/login", json=payload)
    print_response("Login Response", response)
    
    if response.status_code == 200:
        data = response.json()
        return {
            "success": True,
            "user_id": data.get("user_id"),
            "token": data.get("token"),
            "email": data.get("email")
        }
    return {"success": False}

def test_get_profile(token, user_id):
    """Test getting user profile"""
    print("\n[TEST] Get User Profile")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE_URL}/user/profile", headers=headers)
    print_response("Get Profile Response", response)
    return response.status_code == 200

def test_lifestyle_log(token, user_id):
    """Test logging lifestyle data"""
    print("\n[TEST] Log Lifestyle Data")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "date": "2024-12-29",
        "sleep_hours": 8,
        "exercise_minutes": 30,
        "mood": "happy",
        "stress_level": 3
    }
    response = requests.post(f"{API_BASE_URL}/lifestyle/log", json=payload, headers=headers)
    print_response("Lifestyle Log Response", response)
    return response.status_code == 201

def test_lifestyle_summary(token, user_id):
    """Test getting lifestyle summary"""
    print("\n[TEST] Get Lifestyle Summary")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_BASE_URL}/lifestyle/summary?days=7", headers=headers)
    print_response("Lifestyle Summary Response", response)
    return response.status_code == 200

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("MedSage API Test Suite")
    print("="*60)
    
    # Test data
    test_email = "testuser@medsage.com"
    test_password = "TestPassword123456"
    test_name = "Test User"
    test_age = 30
    test_gender = "male"
    
    # Test 1: Health Check
    print("\n[1] Testing API Health Check...")
    if not test_health_check():
        print("✗ API is not responding. Make sure the server is running on port 5000")
        return
    print("✓ API is healthy")
    
    # Test 2: Signup
    print("\n[2] Testing User Signup...")
    signup_result = test_signup(test_email, test_password, test_name, test_age, test_gender)
    if not signup_result["success"]:
        print("✗ Signup failed")
        return
    print("✓ Signup successful")
    
    token = signup_result["token"]
    user_id = signup_result["user_id"]
    
    # Test 3: Login
    print("\n[3] Testing User Login...")
    login_result = test_login(test_email, test_password)
    if not login_result["success"]:
        print("✗ Login failed")
        return
    print("✓ Login successful")
    
    token = login_result["token"]
    
    # Test 4: Get Profile
    print("\n[4] Testing Get User Profile...")
    if not test_get_profile(token, user_id):
        print("✗ Get profile failed")
        return
    print("✓ Get profile successful")
    
    # Test 5: Log Lifestyle Data
    print("\n[5] Testing Log Lifestyle Data...")
    if not test_lifestyle_log(token, user_id):
        print("✗ Lifestyle log failed")
        return
    print("✓ Lifestyle log successful")
    
    # Test 6: Get Lifestyle Summary
    print("\n[6] Testing Get Lifestyle Summary...")
    if not test_lifestyle_summary(token, user_id):
        print("✗ Lifestyle summary failed")
        return
    print("✓ Lifestyle summary successful")
    
    # All tests passed
    print("\n" + "="*60)
    print("✓ ALL TESTS PASSED!")
    print("="*60)
    print("\nThe MedSage API is working correctly.")
    print("You can now use the web application at http://localhost:3000")
    print("\n")

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n" + "="*60)
        print("✗ CONNECTION ERROR")
        print("="*60)
        print("\nThe API server is not running.")
        print("Make sure to start the Flask API server first:")
        print("  python api_server.py")
        print("\n")
    except Exception as e:
        print(f"\n✗ Error: {e}\n")
