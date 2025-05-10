import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface Comment {
  _id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface Post {
  _id: string;
  category: string;
  author: string;
  avatar: string;
  timestamp: string;
  title: string;
  content: string;
  image: string | null;
  likes: number;
  comments: Comment[];
  likedBy: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CreatePostData {
  category: string;
  title: string;
  content: string;
  image?: string | null;
}

interface CommentData {
  author: string;
  content: string;
  timestamp: string;
}

export const postService = {
  // Get all posts
  getAllPosts: async (): Promise<Post[]> => {
    const response = await api.get('/posts');
    return response.data;
  },

  // Create a new post
  createPost: async (postData: CreatePostData): Promise<Post> => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Like/Unlike a post
  toggleLike: async (postId: string, userId: string): Promise<Post> => {
    const response = await api.patch(`/posts/${postId}/like`, { userId });
    return response.data;
  },

  // Add a comment
  addComment: async (postId: string, commentData: CommentData): Promise<Post> => {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Delete a post
  deletePost: async (postId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Delete a comment
  deleteComment: async (postId: string, commentId: string): Promise<Post> => {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
}; 