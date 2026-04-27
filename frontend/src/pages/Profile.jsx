import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { PostCard } from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { Loader2, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/axios';

const Profile = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const idToFetch = identifier || currentUser?.username;
        if (!idToFetch) {
            setLoading(false);
            return;
        }
        const res = await api.get(`/users/${idToFetch}`);
        setProfile(res.data);
        setIsFollowing(res.data.followers?.includes(currentUser?._id));
        
        // Fetch posts
        setLoadingPosts(true);
        const postRes = await api.get(`/posts/user/${idToFetch}`);
        setPosts(postRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingPosts(false);
      }
    };
    fetchProfile();
  }, [identifier, currentUser]);

  useEffect(() => {
    if (!profile) return;
    const fetchTabContent = async () => {
      setLoadingPosts(true);
      try {
        const idToFetch = identifier || currentUser?.username;
        const endpoint = activeTab === 'posts' ? `/posts/user/${idToFetch}` : `/posts/liked/${idToFetch}`;
        const res = await api.get(endpoint);
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch tab content", error);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchTabContent();
  }, [activeTab, profile, identifier, currentUser]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await api.put(`/users/${profile._id}/follow`);
      setIsFollowing(!isFollowing);
      // Update local follower count for immediate feedback
      if (isFollowing) {
        setProfile(prev => ({...prev, followers: prev.followers.filter(id => id !== currentUser._id)}));
      } else {
        setProfile(prev => ({...prev, followers: [...prev.followers, currentUser._id]}));
      }
    } catch (error) {
      console.error(error);
    }
    setFollowLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">Profile not found</div>;

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="min-h-screen bg-background relative flex justify-center">
      <Sidebar />
      
      <main className="flex-1 min-h-screen max-w-2xl w-full md:ml-20 xl:ml-72 lg:mr-80 border-x border-border pb-32">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4 flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">{profile.username}</h1>
        </header>

        {/* Cover Photo */}
        <div className="h-48 w-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-b border-border/50 relative">
           <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-zinc-800 z-10 shadow-2xl">
              <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} className="w-full h-full object-cover" />
            </div>
            
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="border border-border text-foreground font-bold px-4 py-1.5 rounded-full hover:bg-secondary/50 transition-colors shadow-sm cursor-pointer"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                 <button 
                   onClick={() => navigate('/messages', { state: { chatWithUser: profile } })}
                   className="border border-border bg-background text-foreground font-bold px-4 py-1.5 rounded-full hover:bg-secondary/50 transition-colors shadow-sm cursor-pointer"
                 >
                   Message
                 </button>
                 <button 
                   onClick={handleFollow}
                   disabled={followLoading}
                   className={`font-bold px-6 py-1.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-sm ${
                     isFollowing ? 'border border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive' : 'bg-foreground text-background hover:bg-zinc-200'
                   }`}
                 >
                   {followLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                   {isFollowing ? 'Following' : 'Follow'}
                 </button>
              </div>
            )}
          </div>

          <div className="text-foreground">
            <h2 className="text-2xl font-bold tracking-tight">{profile.username}</h2>
            <p className="text-muted-foreground mb-4 font-medium">@{profile.username}</p>
            
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap max-w-lg">
              {profile.bio || "Digital Pioneer on SocioSphere."}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground text-sm font-medium">
              {profile.location && (
                <div className="flex items-center gap-1.5 hover:text-purple-400 transition-colors cursor-default">
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors">
                  <LinkIcon size={16} />
                  <span>{profile.website}</span>
                </a>
              )}
              <div className="flex items-center gap-1.5 cursor-default"><Calendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            </div>

            <div className="flex gap-6 mt-4">
              <div className="flex gap-1.5 text-sm hover:underline cursor-pointer"><span className="font-bold text-foreground">{profile.following?.length || 0}</span> <span className="text-muted-foreground">Following</span></div>
              <div className="flex gap-1.5 text-sm hover:underline cursor-pointer"><span className="font-bold text-foreground">{profile.followers?.length || 0}</span> <span className="text-muted-foreground">Followers</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex w-full border-b border-border mt-4">
          <button 
             onClick={() => setActiveTab('posts')}
             className={`flex-1 font-bold py-4 transition-colors relative cursor-pointer ${activeTab === 'posts' ? 'text-foreground border-b-2 border-purple-500 bg-secondary/10' : 'text-muted-foreground hover:bg-secondary/20'}`}
          >
             Posts
          </button>
          <button 
             onClick={() => setActiveTab('likes')}
             className={`flex-1 font-bold py-4 transition-colors relative cursor-pointer ${activeTab === 'likes' ? 'text-foreground border-b-2 border-purple-500 bg-secondary/10' : 'text-muted-foreground hover:bg-secondary/20'}`}
          >
             Likes
          </button>
        </div>

        {/* Feed Grid */}
        <div className="min-h-[400px]">
           {loadingPosts ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
           ) : posts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-secondary/10 m-4 rounded-3xl border border-border/50 border-dashed font-medium text-lg">
                   {activeTab === 'posts' 
                      ? (isOwnProfile ? "You haven't posted anything yet." : "This user hasn't posted anything yet.")
                      : (isOwnProfile ? "You haven't liked any posts yet." : "This user hasn't liked any posts yet.")
                   }
              </div>
           ) : (
              <div className="pb-32">
                 {posts.map(post => <PostCard key={post._id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p._id !== id))} />)}
              </div>
           )}
        </div>
      </main>

      <RightPanel />
      {isOwnProfile && <EditProfileModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); window.location.reload(); }} />}
    </div>
  );
};

export default Profile;
