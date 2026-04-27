import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { PostCard } from '../components/PostCard';
import { Image, AlignLeft, Loader2 } from 'lucide-react';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';

const Home = () => {
  const { posts, loading, fetchFeed, createPost } = usePostStore();
  const { user } = useAuthStore();
  
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!text.trim() && !imageFile) return;
    
    setIsPosting(true);
    const formData = new FormData();
    if (text) formData.append('text', text);
    if (imageFile) formData.append('image', imageFile);

    const success = await createPost(formData);
    if (success) {
      setText('');
      setImageFile(null);
      setPreview(null);
    }
    setIsPosting(false);
  };

  return (
    <div className="min-h-screen bg-background relative flex justify-center">
      <Sidebar />
      
      {/* Main Feed Container */}
      <main className="flex-1 min-h-screen max-w-2xl w-full md:ml-20 xl:ml-72 lg:mr-80 border-x border-border">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4">
          <h1 className="text-xl font-bold text-foreground tracking-wide">For you</h1>
        </header>

        {/* Input area */}
        <div className="p-6 border-b border-border flex gap-4 bg-background">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 w-full relative">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's sparking your gravity?"
              className="w-full bg-transparent border-none text-foreground text-xl placeholder:text-zinc-600 focus:outline-none resize-none pt-2"
              rows={text.split('\n').length > 1 ? text.split('\n').length : 2}
            ></textarea>

            {preview && (
              <div className="relative mt-4 rounded-2xl overflow-hidden border border-border">
                <button 
                  onClick={() => { setImageFile(null); setPreview(null); }} 
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 hover:bg-black transition-colors"
                >✕</button>
                <img src={preview} alt="Upload preview" className="w-full h-auto max-h-80 object-cover" />
              </div>
            )}

            <div className="flex justify-between items-center mt-4 border-t border-border/50 pt-4">
               <div className="flex gap-2">
                 <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleImageChange} />
                 <button onClick={() => fileInputRef.current?.click()} className="text-purple-500 hover:bg-purple-500/10 p-2 rounded-full transition-colors cursor-pointer">
                    <Image size={20} />
                 </button>
                 <button className="text-purple-500 hover:bg-purple-500/10 p-2 rounded-full transition-colors cursor-pointer">
                    <AlignLeft size={20} />
                 </button>
               </div>
               <button 
                  onClick={handlePost} 
                  disabled={isPosting || (!text.trim() && !imageFile)}
                  className="bg-foreground text-background font-bold px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2 cursor-pointer"
               >
                 {isPosting && <Loader2 className="w-4 h-4 animate-spin" />}
                 Post
               </button>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="pb-32">
          {loading && posts.length === 0 ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center p-12 text-zinc-500 font-medium text-lg">No posts yet. Start following people!</div>
          ) : (
            posts.map(post => <PostCard key={post._id} post={post} />)
          )}
        </div>
      </main>

      <RightPanel />
    </div>
  );
};

export default Home;
