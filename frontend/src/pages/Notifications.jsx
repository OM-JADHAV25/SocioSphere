import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { Heart, UserPlus, MessageCircle, Mail, Loader2, Trash2 } from 'lucide-react';
import api from '../lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        // Automatically mark as read simply by viewing
        await api.put('/notifications/read');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleClearAll = async () => {
    setNotifications([]);
    try {
      await api.delete('/notifications/clear');
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  const handleDeleteOne = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const getIcon = (type) => {
    if(type === 'like') return <Heart className="text-pink-500 fill-pink-500" size={24} />;
    if(type === 'follow') return <UserPlus className="text-blue-500" size={24} />;
    if(type === 'message') return <Mail className="text-purple-500" size={24} />;
    return <MessageCircle className="text-green-500 fill-green-500/20" size={24} />;
  }

  return (
    <div className="min-h-screen bg-background relative flex justify-center">
      <Sidebar />
      <main className="flex-1 min-h-screen max-w-2xl w-full md:ml-20 xl:ml-72 lg:mr-80 border-x border-border pb-32">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground tracking-wide">Notifications</h1>
          {notifications.length > 0 && (
            <button onClick={handleClearAll} className="text-muted-foreground hover:text-red-500 flex items-center gap-2 text-sm transition-colors font-medium px-4 py-2 rounded-full hover:bg-red-500/10 cursor-pointer">
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </header>

        {loading ? (
           <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : notifications.length === 0 ? (
           <div className="p-12 text-center text-muted-foreground font-medium text-lg bg-secondary/10 m-4 rounded-3xl border border-border border-dashed">
             You're all caught up! No recent activity.
           </div>
        ) : (
           <div className="divide-y divide-border">
             {notifications.map(n => (
               <div key={n._id} className={`group p-6 flex gap-5 hover:bg-secondary/10 transition-colors relative ${!n.isRead ? 'bg-purple-500/5' : ''}`}>
                 
                 <button onClick={() => handleDeleteOne(n._id)} className="absolute top-6 right-6 p-2 bg-background/80 backdrop-blur border border-border/50 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer z-10">
                   <Trash2 size={16} />
                 </button>

                 <div className="pt-1">{getIcon(n.type)}</div>
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <img src={n.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender?.username}`} className="w-10 h-10 rounded-full bg-zinc-800 shadow-md object-cover shrink-0" />
                       <p className="text-foreground text-[16px]">
                         <span 
                           onClick={() => navigate(`/profile/${n.sender?.username}`)}
                           className="font-bold cursor-pointer hover:underline hover:text-purple-400 transition-colors"
                         >
                           {n.sender?.username}
                         </span> 
                         {n.type === 'like' && ' liked your post'}
                         {n.type === 'follow' && ' started following you'}
                         {n.type === 'comment' && ' replied to your post'}
                         {n.type === 'message' && ' sent you a private message'}
                       </p>
                   </div>
                   {n.post && <p className="text-muted-foreground text-sm line-clamp-2 mt-3 pl-4 border-l-2 border-border/50 bg-secondary/20 p-3 rounded-r-xl">{n.post.text}</p>}
                   <p className="text-xs text-muted-foreground mt-3 font-medium">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                 </div>
               </div>
             ))}
           </div>
        )}
      </main>
      <RightPanel />
    </div>
  );
};

export default Notifications;
