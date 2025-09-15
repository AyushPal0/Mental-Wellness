import unittest
import json
from ..app import app

class PersonalityApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_questions(self):
        response = self.app.get('/api/personality/questions')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('questions', data)
        self.assertIsInstance(data['questions'], list)

    def test_submit_personality_valid(self):
        scores = {"I": 10, "E": 5, "N": 12, "S": 3, "T": 8, "F": 7, "J": 9, "P": 6}
        response = self.app.post('/api/personality/submit', json={
            "user_id": "test_user_123",
            "scores": scores
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertIn('personality', data)
        self.assertEqual(data['personality']['personality_type'], "INTJ")  # Based on scores

    def test_submit_personality_invalid_no_user_id(self):
        scores = {"I": 10, "E": 5, "N": 12, "S": 3, "T": 8, "F": 7, "J": 9, "P": 6}
        response = self.app.post('/api/personality/submit', json={
            "scores": scores
        })
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('success', data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_submit_personality_invalid_no_scores(self):
        response = self.app.post('/api/personality/submit', json={
            "user_id": "test_user_123"
        })
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('success', data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)

    def test_submit_personality_update_existing(self):
        # First submission
        scores1 = {"I": 10, "E": 5, "N": 12, "S": 3, "T": 8, "F": 7, "J": 9, "P": 6}
        self.app.post('/api/personality/submit', json={
            "user_id": "test_user_update",
            "scores": scores1
        })
        # Update with different scores
        scores2 = {"I": 5, "E": 10, "N": 3, "S": 12, "T": 7, "F": 8, "J": 6, "P": 9}
        response = self.app.post('/api/personality/submit', json={
            "user_id": "test_user_update",
            "scores": scores2
        })
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('success', data)
        self.assertTrue(data['success'])
        self.assertEqual(data['personality']['personality_type'], "ESFP")  # Based on new scores

if __name__ == '__main__':
    unittest.main()
