import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Check, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { CommentsModal } from './CommentsModal';

export const PostCard = ({ post, onDelete }) => {
  const { toggleLike, deletePost } = usePostStore();
  const { user } = useAuthStore();

  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  const isOwner = user?._id === post.user?._id;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    await toggleLike(post._id);
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(link);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deletePost(post._id);
    if (onDelete) onDelete(post._id);
    setShowConfirm(false);
    setDeleting(false);
  };

  return (
    <>
      <article className={`bg-background border-b border-border p-4 sm:p-6 hover:bg-secondary/10 transition-colors ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex gap-4">
          {/* Avatar */}
          <Link to={`/profile/${post.user?.username}`} className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-800 relative overflow-hidden group cursor-pointer">
             <img 
                src={post.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.username}`} 
                alt="avatar" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
             />
          </Link>

          {/* Content */}
          <div className="flex-1 w-0">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${post.user?.username}`} className="font-bold text-foreground hover:underline cursor-pointer">{post.user?.username}</Link>
                  <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                </div>
                <span className="text-sm text-muted-foreground">@{post.user?.username} • {formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>

              {/* Options Menu */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-muted-foreground hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-purple-500/10 cursor-pointer"
                >
                  <MoreHorizontal size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-10 w-56 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={handleShare}
                      className="w-full text-left px-5 py-3.5 text-sm font-medium text-foreground hover:bg-secondary/30 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <Share2 size={16} className="text-muted-foreground" />
                      Copy link to post
                    </button>
                    {isOwner && (
                      <button 
                        onClick={() => { setShowMenu(false); setShowConfirm(true); }}
                        className="w-full text-left px-5 py-3.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer border-t border-border/50"
                      >
                        <Trash2 size={16} />
                        Delete post
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-2 text-foreground leading-relaxed text-[15px] whitespace-pre-wrap">
              {post.text}
            </p>

            {post.image && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-border">
                <img src={post.image} alt="Post media" className="w-full max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500" />
              </div>
            )}

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <button 
                onClick={handleLike}
                className={`group flex items-center gap-2 transition-colors cursor-pointer ${isLiked ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-500'}`}
              >
                <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                  <Heart size={20} className={`${isLiked ? 'fill-pink-500' : ''}`} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">{likesCount}</span>
              </button>
              <button 
                onClick={() => setIsCommentsOpen(true)}
                className="group flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                  <MessageCircle size={20} strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">{post.comments?.length || 0}</span>
              </button>
              <button onClick={handleShare} className="group flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors cursor-pointer">
                <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                  <Share2 size={20} strokeWidth={1.5} />
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Premium Toast Notification */}
        {showToast && (
           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-in slide-in-from-bottom-8 fade-in duration-300">
              <div className="bg-green-500/20 p-1 rounded-full text-green-400">
                 <Check size={16} strokeWidth={3} />
              </div>
              <span className="font-bold tracking-wide text-sm">Link copied to clipboard!</span>
           </div>
        )}

        <CommentsModal isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} post={post} />
      </article>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-background border border-border/50 w-full max-w-sm rounded-[2rem] shadow-[0_0_60px_rgba(239,68,68,0.1)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            <div className="p-8 text-center space-y-5">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Delete Post?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This action is permanent and cannot be undone. The post, along with all its likes, comments, and notifications, will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-full border border-border text-foreground font-bold hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Deleting...</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
