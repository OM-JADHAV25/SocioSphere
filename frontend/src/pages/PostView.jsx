import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { PostCard } from '../components/PostCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '../lib/axios';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error("Failed to fetch post", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-background relative flex justify-center">
      <Sidebar />
      
      <main className="flex-1 min-h-screen max-w-2xl w-full md:ml-20 xl:ml-72 lg:mr-80 border-x border-border">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-full transition-colors cursor-pointer">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Post</h1>
        </header>

        <div className="pb-32">
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
          ) : !post ? (
             <div className="text-center p-12 text-zinc-500 font-medium text-lg">Post not found. It may have been deleted.</div>
          ) : (
             <div className="animate-in fade-in duration-500">
               <PostCard post={post} />
               <div className="p-4 border-b border-border bg-secondary/5">
                 <h2 className="font-bold text-lg text-foreground px-2">Thread Replies</h2>
               </div>
               {/* Note: In a deeper implementation, we could render standalone comments here, but for now PostCard handles them via its Modal */}
             </div>
          )}
        </div>
      </main>

      <RightPanel />
    </div>
  );
};

export default PostView;
