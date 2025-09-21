// lib/backend-api.ts
// Backend API client for the Mental Wellness application

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success?: boolean;
  status?: string;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar?: string;
  friends?: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  _id: string;
  user_id: string;
  user_message: string;
  bot_response: string;
  conversation_id: string;
  timestamp: string;
}

export interface CommunityPost {
  _id: string;
  user_id: string;
  content: string;
  media_url?: string;
  likes: string[];
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  _id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  session_id: string;
  user_id: string;
  level: number;
  score: number;
  completed: boolean;
  created_at: string;
}

export interface PersonalityResult {
  personality_type: string;
  scores: {
    I: number;
    E: number;
    N: number;
    S: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  description: string;
}

class BackendAPI {
  private baseURL: string;

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async signup(userData: {
    email: string;
    password: string;
    firstname?: string;
    lastname?: string;
  }) {
    return this.request<{ message: string; userId: string }>('/api/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ message: string; userId: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getUserProfile(userId: string) {
    return this.request<User>(`/api/user/${userId}`);
  }

  async searchUsers(query: string) {
    return this.request<{ users: User[] }>(`/api/users/search?q=${encodeURIComponent(query)}`);
  }

  // Chat
  async sendChatMessage(message: string, userId: string, conversationId?: string) {
    return this.request<ChatMessage>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, user_id: userId, conversation_id: conversationId }),
    });
  }

  async getChatHistory(userId: string) {
    return this.request<ChatMessage[]>(`/api/chat/history/${userId}`);
  }

  // Community
  async getCommunityPosts() {
    return this.request<{ posts: CommunityPost[] }>('/api/community/posts');
  }

  async createCommunityPost(userId: string, content: string, mediaFile?: File) {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('content', content);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    const response = await fetch(`${this.baseURL}/api/community/posts`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create post');
    }

    return data;
  }

  async likePost(postId: string, userId: string) {
    return this.request<CommunityPost>(`/api/community/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async commentOnPost(postId: string, userId: string, text: string) {
    return this.request<CommunityPost>(`/api/community/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, text }),
    });
  }

  // Friends
  async searchFriends(query: string, userId: string) {
    return this.request<{ users: User[] }>(`/api/friends/search?q=${encodeURIComponent(query)}&userId=${userId}`);
  }

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    return this.request<{ message: string }>('/api/friends/friend-request', {
      method: 'POST',
      body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId }),
    });
  }

  async getFriends(userId: string) {
    return this.request<{ friends: User[] }>(`/api/friends/friends/${userId}`);
  }

  async getFriendRequests(userId: string) {
    return this.request<{ requests: any[] }>(`/api/friends/friend-requests/${userId}`);
  }

  async respondToFriendRequest(recipientId: string, senderId: string, action: 'accept' | 'decline') {
    return this.request<{ message: string }>('/api/friends/friend-request/respond', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId, sender_id: senderId, action }),
    });
  }

  // Tasks
  async createTask(taskData: {
    title: string;
    description?: string;
    user_id: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    due_date?: string;
  }) {
    return this.request<{ task_id: string; task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getUserTasks(userId: string) {
    return this.request<{ tasks: Task[] }>(`/api/tasks/user/${userId}`);
  }

  async getTask(taskId: string) {
    return this.request<Task>(`/api/tasks/${taskId}`);
  }

  async updateTask(taskId: string, updates: Partial<Task>, userId: string) {
    return this.request<Task>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, user_id: userId }),
    });
  }

  async deleteTask(taskId: string, userId: string) {
    return this.request<{ message: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getAITaskSuggestion(userId: string) {
    return this.request<{ title: string }>(`/api/tasks/ai-suggestion/${userId}`);
  }

  // Games
  async startGameSession(level: number) {
    return this.request<{ session_id: string }>('/api/game/start', {
      method: 'POST',
      body: JSON.stringify({ level }),
    });
  }

  async recordGameAction(actionData: {
    session_id: string;
    item_id: string;
    action_type: string;
    start_position: { x: number; y: number };
    end_position: { x: number; y: number };
    time_taken: number;
    timestamp: number;
  }) {
    return this.request('/api/game/action', {
      method: 'POST',
      body: JSON.stringify(actionData),
    });
  }

  async checkGamePlacement(placementData: {
    id: string;
    x: number;
    y: number;
    rotation: number;
  }) {
    return this.request('/api/game/check-placement', {
      method: 'POST',
      body: JSON.stringify(placementData),
    });
  }

  async completeGameLevel(completionData: {
    session_id: string;
    level: number;
    items: any[];
    completion_time: number;
    corrections: number;
  }) {
    return this.request('/api/game/complete', {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async getGameLeaderboard() {
    return this.request<{ leaderboard: any[] }>('/api/game/leaderboard');
  }

  // Personality Test
  async getPersonalityQuestions() {
    return this.request<{ questions: any[] }>('/api/personality/questions');
  }

  async submitPersonalityTest(userId: string, scores: {
    I: number; E: number; N: number; S: number;
    T: number; F: number; J: number; P: number;
  }) {
    return this.request<PersonalityResult>('/api/personality/submit', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, scores }),
    });
  }

  // Home/Dashboard
  async getHomeData(userId: string) {
    return this.request('/api/home/' + userId);
  }

  // Safety
  async reportRiskEvent(riskData: {
    user_id: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }) {
    return this.request('/api/safety/risk-event', {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
  }
}

// Export singleton instance
export const backendAPI = new BackendAPI();

// Export types for use in components
export type { User, ChatMessage, CommunityPost, Comment, Task, GameSession, PersonalityResult };
