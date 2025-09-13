import unittest
import json
from backend.app import app

class TaskApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Create a sample task for tests that require an existing task
        response = self.app.post('/api/tasks', json={
            "title": "Sample Task",
            "description": "Sample task description",
            "category": "testing",
            "due_date": "2024-12-31T23:59:59Z"
        })
        data = json.loads(response.data)
        self.sample_task_id = data['task']['id'] if 'task' in data else None

    def tearDown(self):
        # Delete the sample task if it exists
        if self.sample_task_id:
            self.app.delete(f'/api/tasks/{self.sample_task_id}')

    def test_create_task(self):
        response = self.app.post('/api/tasks', json={
            "title": "Test Task",
            "description": "Test task description",
            "category": "testing",
            "due_date": "2024-12-31T23:59:59Z"
        })
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('task', data)
        self.assertEqual(data['task']['title'], "Test Task")
        self.assertIn('id', data['task'])

    def test_create_task_invalid(self):
        # Missing title
        response = self.app.post('/api/tasks', json={
            "description": "No title task"
        })
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)

    def test_get_all_tasks(self):
        response = self.app.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('tasks', data)
        self.assertIsInstance(data['tasks'], list)

    def test_get_task_by_id(self):
        if not self.sample_task_id:
            self.skipTest("Sample task not created")
        response = self.app.get(f'/api/tasks/{self.sample_task_id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['id'], self.sample_task_id)

    def test_get_task_by_id_not_found(self):
        response = self.app.get('/api/tasks/nonexistent-id')
        self.assertEqual(response.status_code, 404)

    def test_update_task(self):
        if not self.sample_task_id:
            self.skipTest("Sample task not created")
        response = self.app.put(f'/api/tasks/{self.sample_task_id}', json={"title": "Updated Title"})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], "Updated Title")

    def test_update_task_not_found(self):
        response = self.app.put('/api/tasks/nonexistent-id', json={"title": "Updated"})
        self.assertEqual(response.status_code, 404)

    def test_delete_task(self):
        # Create a task to delete
        response = self.app.post('/api/tasks', json={
            "title": "Delete Task",
            "description": "To be deleted",
            "category": "testing"
        })
        data = json.loads(response.data)
        task_id = data['task']['id']
        del_response = self.app.delete(f'/api/tasks/{task_id}')
        self.assertEqual(del_response.status_code, 200)
        del_data = json.loads(del_response.data)
        self.assertIn('message', del_data)

    def test_delete_task_not_found(self):
        response = self.app.delete('/api/tasks/nonexistent-id')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
