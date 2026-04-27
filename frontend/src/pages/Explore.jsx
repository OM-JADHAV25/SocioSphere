import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { PostCard } from '../components/PostCard';
import { Search, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await api.get('/posts'); // Using general index logic
        setPosts(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchExplore();
  }, []);

  const filteredPosts = posts.filter(p => p.text?.toLowerCase().includes(search.toLowerCase()) || p.user?.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background relative flex justify-center">
      <Sidebar />
      <main className="flex-1 min-h-screen max-w-2xl w-full md:ml-20 xl:ml-72 lg:mr-80 border-x border-border pb-32">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4">
          <div className="relative">
             <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search SocioSphere..."
               className="w-full bg-secondary/50 border border-border text-foreground rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-muted-foreground"
             />
          </div>
        </header>

        {loading ? (
           <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : (
           <div className="flex flex-col">
             {filteredPosts.map(post => <PostCard key={post._id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p._id !== id))} />)}
           </div>
        )}
      </main>
      <RightPanel />
    </div>
  );
};

export default Explore;
