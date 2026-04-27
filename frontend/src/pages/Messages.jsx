import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Search, Loader2, Send, Phone, Video, Info, Trash2 } from 'lucide-react';
import api from '../lib/axios';
import useSocketStore from '../store/useSocketStore';
import useAuthStore from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Chat Hydration Hook
  useEffect(() => {
    if (location.state?.chatWithUser) {
       const targetUser = location.state.chatWithUser;
       setActiveUser(targetUser);
       setConversations(prev => {
          if (prev.find(u => u._id === targetUser._id)) return prev;
          return [targetUser, ...prev];
       });
       window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle outside click for search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
       setSearchResults([]);
       setShowSearchDropdown(false);
       return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
         const res = await api.get(`/users/search?q=${searchQuery}`);
         setSearchResults(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleStartChat = (targetUser) => {
     setActiveUser(targetUser);
     setShowSearchDropdown(false);
     setSearchQuery('');
     setConversations(prev => {
        if (prev.find(u => u._id === targetUser._id)) return prev;
        return [targetUser, ...prev];
     });
  };

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    const fetchHistory = async () => {
      setChatLoading(true);
      try {
        const res = await api.get(`/messages/${activeUser._id}`);
        setHistory(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setChatLoading(false);
      }
    };
    fetchHistory();
  }, [activeUser]);

  const handleClearChat = async () => {
    if (!activeUser) return;
    setHistory([]);
    try {
      await api.delete(`/messages/conversation/${activeUser._id}`);
    } catch (error) {
      console.error("Failed to clear chat", error);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    setHistory(prev => prev.filter(m => m._id !== msgId));
    try {
      await api.delete(`/messages/${msgId}`);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const handleSend = () => {
    if(!inputText.trim() || !activeUser) return;
    
    const tempMsg = {
       _id: Date.now().toString(),
       sender: user._id,
       receiver: activeUser._id,
       content: inputText,
       createdAt: new Date().toISOString()
    };
    setHistory(prev => [...prev, tempMsg]);
    
    if (socket) {
      socket.emit('send_message', {
         senderId: user._id,
         receiverId: activeUser._id,
         text: inputText
      });
    }

    setInputText('');
  };

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (newMsg) => {
      if (activeUser && (newMsg.sender === activeUser._id || newMsg.receiver === activeUser._id)) {
        setHistory(prev => {
           if(prev.find(m => m.content === newMsg.content && newMsg.sender === user._id)) return prev;
           return [...prev, newMsg];
        });
      }
    };
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socket, activeUser, user._id]);

  return (
    <div className="min-h-screen bg-background relative flex">
      <Sidebar />
      
      <main className="flex-1 min-h-screen md:ml-20 xl:ml-72 flex border-r border-border">
        
        {/* Conversations Column */}
        <div className="w-[350px] border-r border-border bg-background/50 backdrop-blur-xl flex flex-col hidden lg:flex relative z-20">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground tracking-wide mb-4">Messages</h1>
            <div className="relative" ref={searchRef}>
               <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                 placeholder="Search messages..."
                 className="w-full bg-secondary/50 border border-border text-foreground rounded-full pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
               />
               {isSearching && <Loader2 className="absolute right-4 top-2.5 w-4 h-4 animate-spin text-purple-500" />}
               
               {showSearchDropdown && (
                  <div className="absolute top-12 left-0 w-full bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto animate-in slide-in-from-top-2">
                     {searchResults.length === 0 && !isSearching ? (
                        <div className="p-4 text-center text-sm text-zinc-500 font-medium">No users found.</div>
                     ) : (
                        searchResults.map(sUser => (
                           <div 
                              key={sUser._id} 
                              onClick={() => handleStartChat(sUser)}
                              className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer group border-b border-border/50 last:border-0"
                           >
                              <img src={sUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sUser.username}`} className="w-8 h-8 rounded-full bg-zinc-800 object-cover shadow-sm group-hover:ring-2 ring-purple-500/50 transition-all" />
                              <div className="flex-1 overflow-hidden">
                                 <p className="text-sm font-bold text-foreground truncate group-hover:text-purple-400 transition-colors">{sUser.username}</p>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No conversations yet. Following someone creates a link!</div>
            ) : (
              conversations.map(cUser => (
                <div 
                  key={cUser._id} 
                  onClick={() => setActiveUser(cUser)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-border/30 ${activeUser?._id === cUser._id ? 'bg-secondary/40 border-l-4 border-l-purple-500' : 'hover:bg-secondary/10'}`}
                >
                  <img src={cUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cUser.username}`} className="w-12 h-12 rounded-full bg-zinc-800 object-cover shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-foreground text-[15px] truncate">{cUser.username}</h3>
                    <p className="text-xs text-muted-foreground truncate">Click to view chat history</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Chat Interface */}
        <div className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-background to-background relative z-10">
          {activeUser ? (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-8 absolute top-0 w-full z-10">
                <div className="flex items-center gap-4">
                  <img src={activeUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.username}`} className="w-10 h-10 rounded-full bg-zinc-800 object-cover shrink-0" />
                  <div>
                    <h2 className="font-bold text-foreground text-lg">{activeUser.username}</h2>
                    <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Secure connection</p>
                  </div>
                </div>
                <div className="flex gap-4 text-muted-foreground">
                  <button onClick={handleClearChat} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors cursor-pointer" title="Clear Chat"><Trash2 size={20} /></button>
                  <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer"><Phone size={20} /></button>
                  <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer"><Video size={20} /></button>
                  <button className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer"><Info size={20} /></button>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-8 pt-28 space-y-6 flex flex-col">
                 {chatLoading ? (
                    <div className="flex justify-center m-auto"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
                 ) : history.length === 0 ? (
                    <div className="m-auto text-center">
                      <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                         <span className="text-4xl">👋</span>
                      </div>
                      <p className="text-muted-foreground font-medium">Say hello to {activeUser.username}!</p>
                    </div>
                 ) : (
                   history.map((msg, i) => {
                     const isMe = msg.sender === user._id;
                     return (
                       <div key={msg._id || i} className={`group flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className="flex items-center gap-2 max-w-[75%]">
                             {isMe && (
                                <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer shrink-0">
                                   <Trash2 size={14} />
                                </button>
                             )}
                             <div className={`px-5 py-3 rounded-2xl text-[15px] shadow-sm break-words ${
                               isMe 
                               ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm' 
                               : 'bg-secondary/60 text-foreground rounded-tl-sm border border-border/50'
                             }`}>
                               {msg.content}
                             </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground/70 font-medium px-1">
                             {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt)) : 'Just now'}
                          </span>
                       </div>
                     )
                   })
                 )}
              </div>

              {/* Input Area */}
              <div className="p-6 bg-background border-t border-border/50">
                 <div className="relative flex items-center max-w-4xl mx-auto">
                   <input 
                     type="text" 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder={`Message @${activeUser.username}...`}
                     className="w-full bg-secondary/30 border border-border/50 text-foreground rounded-full pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-[15px]"
                   />
                   <button 
                     onClick={handleSend} 
                     disabled={!inputText.trim()} 
                     className="absolute right-3 p-2.5 bg-purple-500 text-white hover:bg-purple-600 rounded-full transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20"
                   >
                     <Send size={18} />
                   </button>
                 </div>
              </div>
            </>
          ) : (
            <div className="m-auto text-center flex flex-col items-center justify-center h-full">
               <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center border border-border/50 border-dashed mb-6">
                 <Send size={32} className="text-muted-foreground ml-1" />
               </div>
               <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Your Messages</h2>
               <p className="text-muted-foreground font-medium max-w-xs">Select a conversation from the sidebar or start a new connection.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Messages;
