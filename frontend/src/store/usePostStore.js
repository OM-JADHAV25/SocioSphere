import { create } from 'zustand';
import api from '../lib/axios';

const usePostStore = create((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  fetchFeed: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/posts/feed');
      set({ posts: res.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch feed', loading: false });
    }
  },

  createPost: async (postData) => {
    set({ error: null }); // Do not set global loading: true to prevent UI flash
    try {
      const res = await api.post('/posts', postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Prepend the new post immediately into UI state
      set((state) => ({ posts: [res.data, ...state.posts] }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create post', loading: false });
      return false;
    }
  },

  toggleLike: async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      set((state) => ({
        posts: state.posts.map((post) => 
          post._id === postId ? { ...post, likes: res.data } : post
        )
      }));
    } catch (error) {
      console.error(error);
    }
  },

  deletePost: async (postId) => {
    // Optimistic removal
    set((state) => ({
      posts: state.posts.filter((post) => post._id !== postId)
    }));
    try {
      await api.delete(`/posts/${postId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete post:', error);
      return false;
    }
  }
}));

export default usePostStore;
