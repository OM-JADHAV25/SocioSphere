import { useState, useEffect } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import api from '../lib/axios';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';

export const CommentsModal = ({ isOpen, onClose, post }) => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen || !post) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${post._id}/comments`);
        setComments(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [isOpen, post]);

  if (!isOpen) return null;

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    try {
      const res = await api.post(`/posts/${post._id}/comments`, { text });
      setComments(prev => [...prev, res.data]);
      setText('');

      // Emit real-time notification to post owner
      if (socket && post.user._id !== user._id) {
         socket.emit('send_notification', {
            recipient: post.user._id,
            sender: user._id,
            type: 'comment',
            post: post._id
         });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-background border border-border/50 w-full max-w-lg h-[650px] flex flex-col rounded-[2rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/20 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
             <MessageSquare className="text-purple-500" size={24} />
             <h2 className="text-xl font-bold text-foreground">Post Replies</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background">
           {loading ? (
              <div className="flex justify-center mt-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
           ) : comments.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20 font-medium">No comments yet. Be the first to reply!</div>
           ) : (
              comments.map(c => (
                <div key={c._id} className="flex gap-4 animate-in fade-in duration-300">
                   <img src={c.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.username}`} className="w-10 h-10 rounded-full bg-zinc-800 shadow-sm object-cover shrink-0" />
                   <div className="flex-1 bg-secondary/30 p-4 rounded-2xl rounded-tl-sm border border-border/50 hover:border-border transition-colors">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-foreground text-[15px]">{c.user?.username}</span>
                         <span className="text-xs text-muted-foreground font-medium">{formatDistanceToNow(new Date(c.createdAt))}</span>
                      </div>
                      <p className="text-foreground/90 text-[15px] leading-relaxed">{c.text}</p>
                   </div>
                </div>
              ))
           )}
        </div>

        <form onSubmit={handlePostComment} className="p-5 bg-background border-t border-border/50">
           <div className="relative flex items-center">
             <input 
               type="text" 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Write a lavish reply..."
               className="w-full bg-secondary/50 border border-border text-foreground rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-[15px] shadow-inner"
             />
             <button 
               type="submit" 
               disabled={sending || !text.trim()}
               className="absolute right-2 p-2.5 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95"
             >
               {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} />}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};
