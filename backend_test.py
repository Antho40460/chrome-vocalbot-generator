import requests
import unittest
import json
from datetime import datetime

class VoiceBotAPITester(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(VoiceBotAPITester, self).__init__(*args, **kwargs)
        self.base_url = "https://47a7923a-e20e-4498-bec0-6cf91d9cd02a.preview.emergentagent.com/api"
        self.user_email = f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
        self.user_password = "TestPassword123!"
        self.user_id = None
        self.website_id = None
        self.assistant_id = None
        self.widget_id = None

    def test_01_health_check(self):
        """Test the health check endpoint"""
        print("\n🔍 Testing health check endpoint...")
        response = requests.get(f"{self.base_url}/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")
        print("✅ Health check passed")

    def test_02_create_user(self):
        """Test user creation"""
        print("\n🔍 Testing user creation...")
        data = {
            "email": self.user_email,
            "password": self.user_password
        }
        response = requests.post(f"{self.base_url}/users", json=data)
        self.assertEqual(response.status_code, 201)
        self.user_id = response.json()["id"]
        self.assertIsNotNone(self.user_id)
        print(f"✅ User created with ID: {self.user_id}")

    def test_03_crawl_website(self):
        """Test website crawling"""
        print("\n🔍 Testing website crawling...")
        data = {
            "website_url": "https://example.com"
        }
        response = requests.post(f"{self.base_url}/crawl", json=data)
        self.assertEqual(response.status_code, 200)
        self.website_id = response.json()["id"]
        self.assertIsNotNone(self.website_id)
        print(f"✅ Website crawled with ID: {self.website_id}")
        
        # Verify the crawl results structure
        crawl_results = response.json()
        self.assertIn("content", crawl_results)
        self.assertIn("pages", crawl_results["content"])
        self.assertIn("faq", crawl_results["content"])
        print("✅ Crawl results structure verified")

    def test_04_create_assistant(self):
        """Test assistant creation"""
        print("\n🔍 Testing assistant creation...")
        if not self.website_id:
            self.test_03_crawl_website()
            
        data = {
            "website_id": self.website_id,
            "config": {
                "name": "Test Assistant",
                "system_prompt": "You are a helpful assistant for this website.",
                "voice_id": "nova",
                "language": "en",
                "llm_model": "gpt-4o",
                "temperature": 0.7,
                "max_response_duration": 120
            }
        }
        response = requests.post(f"{self.base_url}/assistants", json=data)
        self.assertEqual(response.status_code, 200)
        self.assistant_id = response.json()["id"]
        self.assertIsNotNone(self.assistant_id)
        print(f"✅ Assistant created with ID: {self.assistant_id}")
        
        # Verify the assistant structure
        assistant = response.json()
        self.assertEqual(assistant["website_id"], self.website_id)
        self.assertEqual(assistant["config"]["name"], "Test Assistant")
        self.assertEqual(assistant["config"]["voice_id"], "nova")
        self.assertTrue(assistant["test_mode"])
        print("✅ Assistant structure verified")

    def test_05_create_widget(self):
        """Test widget creation"""
        print("\n🔍 Testing widget creation...")
        if not self.assistant_id:
            self.test_04_create_assistant()
            
        data = {
            "assistant_id": self.assistant_id,
            "config": {
                "color": "#4F46E5",
                "position": "bottom-right",
                "cta_text": "Chat with me",
                "avatar_url": None
            }
        }
        response = requests.post(f"{self.base_url}/widgets", json=data)
        self.assertEqual(response.status_code, 200)
        self.widget_id = response.json()["id"]
        self.assertIsNotNone(self.widget_id)
        print(f"✅ Widget created with ID: {self.widget_id}")
        
        # Verify the widget structure
        widget = response.json()
        self.assertEqual(widget["assistant_id"], self.assistant_id)
        self.assertEqual(widget["config"]["color"], "#4F46E5")
        self.assertEqual(widget["config"]["position"], "bottom-right")
        self.assertIn("iframe_code", widget)
        print("✅ Widget structure verified")

    def test_06_record_usage(self):
        """Test usage recording"""
        print("\n🔍 Testing usage recording...")
        if not self.user_id or not self.assistant_id:
            self.test_02_create_user()
            self.test_04_create_assistant()
            
        params = {
            "user_id": self.user_id,
            "assistant_id": self.assistant_id,
            "duration": 60.0  # 1 minute
        }
        response = requests.post(f"{self.base_url}/usage", params=params)
        self.assertEqual(response.status_code, 200)
        
        # Verify the usage record structure
        usage = response.json()
        self.assertEqual(usage["user_id"], self.user_id)
        self.assertEqual(usage["assistant_id"], self.assistant_id)
        self.assertEqual(usage["duration"], 60.0)
        self.assertAlmostEqual(usage["cost"], 0.49, delta=0.01)  # $0.49 per minute
        print("✅ Usage recording verified")

    def run_all_tests(self):
        """Run all tests in sequence"""
        try:
            self.test_01_health_check()
            self.test_02_create_user()
            self.test_03_crawl_website()
            self.test_04_create_assistant()
            self.test_05_create_widget()
            self.test_06_record_usage()
            print("\n✅ All API tests passed successfully!")
        except AssertionError as e:
            print(f"\n❌ Test failed: {str(e)}")
        except Exception as e:
            print(f"\n❌ Error during testing: {str(e)}")

if __name__ == "__main__":
    tester = VoiceBotAPITester()
    tester.run_all_tests()