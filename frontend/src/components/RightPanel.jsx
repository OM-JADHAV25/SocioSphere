import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import api from '../lib/axios';

export const RightPanel = () => {
  const [suggested, setSuggested] = useState([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
       setSearchResults([]);
       setShowDropdown(false);
       return;
    }
    
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
         const res = await api.get(`/users/search?q=${query}`);
         setSearchResults(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await api.get('/users/suggested');
        setSuggested(res.data);
      } catch (error) {
        console.error("Failed to fetch suggested users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  const handleFollow = async (id) => {
    try {
      await api.put(`/users/${id}/follow`);
      setSuggested(suggested.filter(u => u._id !== id));
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <aside className="fixed right-0 top-0 h-screen w-80 border-l border-border bg-background/50 backdrop-blur-xl hidden lg:block py-8 px-6 overflow-y-auto">
      <div className="space-y-8">
        
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center">
             <Search className="absolute left-4 text-zinc-500" size={18} />
             <input 
               type="text" 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onFocus={() => query.trim() && setShowDropdown(true)}
               placeholder="Search network..."
               className="w-full bg-secondary border border-border/50 rounded-full py-3.5 pl-11 pr-6 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-500 shadow-inner"
             />
             {isSearching && <Loader2 className="absolute right-4 w-4 h-4 animate-spin text-purple-500" />}
          </div>
          
          {/* Search Dropdown */}
          {showDropdown && (
             <div className="absolute top-14 left-0 w-full bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2">
                {searchResults.length === 0 && !isSearching ? (
                   <div className="p-4 text-center text-sm text-zinc-500 font-medium">No users found.</div>
                ) : (
                   searchResults.map(user => (
                      <Link 
                         key={user._id} 
                         to={`/profile/${user.username}`} 
                         onClick={() => setShowDropdown(false)}
                         className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors cursor-pointer group border-b border-border/50 last:border-0"
                      >
                         <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-10 h-10 rounded-full bg-zinc-800 object-cover shadow-sm group-hover:ring-2 ring-purple-500/50 transition-all" />
                         <div className="flex-1 overflow-hidden">
                            <p className="text-[15px] font-bold text-foreground truncate group-hover:text-purple-400 transition-colors">{user.username}</p>
                            <p className="text-xs text-muted-foreground truncate">@{user.username.toLowerCase().replace(/\s+/g, '')}</p>
                         </div>
                      </Link>
                   ))
                )}
             </div>
          )}
        </div>

        {/* Premium Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/20 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">Upgrade to Pro</h3>
          <p className="text-sm text-zinc-400 mb-4 relative z-10">Unlock premium badges, advanced analytics, and zero ads.</p>
          <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 relative z-10 cursor-pointer">
            Get Pro
          </button>
        </div>

        {/* Suggested Follows */}
        <div className="bg-secondary/40 rounded-3xl p-6 border border-border">
          <h3 className="text-lg font-bold text-white mb-6">Suggested for you</h3>
          <div className="space-y-5">
            {loading ? (
              // The skeleton the user disliked, now only shown briefly while loading!
              [1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col xl:flex-row items-center gap-4 justify-between animate-pulse">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0"></div>
                    <div className="flex-1 w-full space-y-2">
                       <div className="h-3 bg-secondary rounded w-20"></div>
                       <div className="h-2 bg-secondary rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : suggested.length === 0 ? (
              <p className="text-sm text-zinc-500 font-medium">You're connected to everyone!</p>
            ) : (
              suggested.map((user) => (
                <div key={user._id} className="flex flex-col xl:flex-row items-center gap-4 justify-between">
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-3 w-full group cursor-pointer">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 object-cover shadow-sm group-hover:ring-2 ring-purple-500 transition-all"
                    />
                    <div className="flex-1 w-full overflow-hidden">
                       <p className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">{user.username}</p>
                       <p className="text-xs text-zinc-500 truncate">@{user.username.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>
                  </Link>
                  <button onClick={() => handleFollow(user._id)} className="w-full xl:w-auto px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer">
                    Follow
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};
