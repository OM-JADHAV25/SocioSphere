import { create } from 'zustand';
import { io } from 'socket.io-client';
import useAuthStore from './useAuthStore';

const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  messages: [],
  
  connectSocket: () => {
    const { user } = useAuthStore.getState();
    if (!user || get().socket?.connected) return;

    const socket = io('http://localhost:5000', {
      query: { userId: user._id }
    });

    socket.on('connect', () => {
      console.log('Socket Real-time Sync Connected ✨');
    });

    socket.on('receive_message', (msg) => {
      // Allows backend to bounce messages back
      set((state) => ({ messages: [...state.messages, msg] }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
    set({ socket: null, messages: [] });
  },

  sendMessage: (text) => {
    const { socket } = get();
    if (!socket) return;
    const msgData = { id: Date.now(), text, sender: 'me', time: new Date() };
    socket.emit('send_message', msgData);
    set((state) => ({ messages: [...state.messages, msgData] }));
  }
}));

export default useSocketStore;
