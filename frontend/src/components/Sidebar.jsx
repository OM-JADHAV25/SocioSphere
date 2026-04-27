import { useState, useEffect } from 'react';
import { Home as HomeIcon, Compass, Bell, Mail, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';

const navItems = [
  { icon: HomeIcon, label: 'Home', href: '/feed' },
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Mail, label: 'Messages', href: '/messages' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export const Sidebar = () => {
  const { logout } = useAuthStore();
  const { socket } = useSocketStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [hasUnread, setHasUnread] = useState(false);
  const [liveToast, setLiveToast] = useState(null);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notif) => {
      setHasUnread(true);
      let msg = "New notification!";
      if (notif.type === 'message') msg = `${notif.sender?.username} sent you a private message`;
      if (notif.type === 'like') msg = `${notif.sender?.username} liked your post`;
      if (notif.type === 'follow') msg = `${notif.sender?.username} started following you`;
      if (notif.type === 'comment') msg = `${notif.sender?.username} replied to your post`;
      
      setLiveToast(msg);
      setTimeout(() => setLiveToast(null), 4000);
    };
    socket.on('receive_notification', handleNotification);
    return () => socket.off('receive_notification', handleNotification);
  }, [socket]);

  useEffect(() => {
    if (location.pathname === '/notifications') setHasUnread(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 xl:w-72 border-r border-border bg-background/50 backdrop-blur-xl hidden md:flex flex-col justify-between py-8 px-4 xl:px-8 z-50">
      <div className="space-y-12">
        <div className="flex items-center justify-center xl:justify-start">
          <span className="hidden xl:block ml-4 text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">SocioSphere</span>
        </div>

        <nav className="space-y-4 w-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href === '/profile' && location.pathname.startsWith('/profile'));
            return (
              <Link 
                key={item.label} 
                to={item.href}
                className={`group flex items-center p-3 rounded-2xl transition-all duration-300 w-full relative ${isActive ? 'bg-secondary/40 font-bold' : 'hover:bg-secondary/20'}`}
              >
                <div className="relative mx-auto xl:mx-0">
                  <item.icon className={`h-6 w-6 transition-colors ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-purple-300'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label === 'Notifications' && hasUnread && (
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                  )}
                </div>
                <span className={`hidden xl:block ml-5 text-lg transition-colors ${isActive ? 'text-white' : 'text-zinc-400 font-medium group-hover:text-zinc-200'}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <button onClick={handleLogout} className="group flex items-center p-3 rounded-2xl hover:bg-destructive/10 transition-all duration-300 w-full text-zinc-500 hover:text-red-500 cursor-pointer">
        <LogOut className="h-6 w-6 mx-auto xl:mx-0" strokeWidth={2} />
        <span className="hidden xl:block ml-5 text-lg font-medium">Log out</span>
      </button>

      {/* Global Live Notification Toast */}
      {liveToast && (
         <div className="fixed top-10 right-10 z-[100] bg-background border border-purple-500/30 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(168,85,247,0.15)] flex items-center gap-4 animate-in slide-in-from-top-8 fade-in duration-300">
            <div className="bg-purple-500/20 p-2 rounded-full text-purple-400">
               <Bell size={18} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <span className="font-bold tracking-wide text-[15px]">{liveToast}</span>
         </div>
      )}
    </aside>
  );
};
