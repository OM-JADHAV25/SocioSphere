import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useSocketStore from './store/useSocketStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import ComingSoon from './pages/ComingSoon';
import PostView from './pages/PostView';
import { ChatDrawer } from './components/ChatDrawer';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, connectSocket, disconnectSocket]);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated, fetchProfile, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        await fetchProfile();
      }
      setIsInitializing(false);
    };
    initAuth();
  }, [fetchProfile, user]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
         <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-[spin_1s_ease-in-out_infinite] mb-6 shadow-[0_0_40px_rgba(168,85,247,0.4)]"></div>
         <p className="text-zinc-400 font-bold tracking-widest animate-pulse uppercase text-sm">Booting Engine</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen font-sans antialiased selection:bg-purple-500/30 overflow-x-hidden">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/feed" replace /> : <Landing />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/feed" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/feed" replace /> : <Register />} />
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:identifier?" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/post/:id" element={<ProtectedRoute><PostView /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/"} replace />} />
        </Routes>
        {isAuthenticated && <ChatDrawer />}
      </BrowserRouter>
    </div>
  );
}

export default App;
