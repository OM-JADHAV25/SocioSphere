import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Camera } from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'unset';
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      if (username !== user.username) formData.append('username', username);
      if (bio !== user.bio) formData.append('bio', bio);
      if (location !== user.location) formData.append('location', location);
      if (website !== user.website) formData.append('website', website);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser({ ...user, ...res.data });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-background border border-border/50 w-full max-w-md rounded-[2rem] shadow-[0_0_60px_rgba(168,85,247,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/20 shrink-0">
          <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="p-2 bg-secondary/50 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 overflow-y-auto scrollbar-hide">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-sm font-medium text-center">
              {error}
            </div>
          )}
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                   src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                   className="w-28 h-28 rounded-full bg-secondary object-cover border-4 border-purple-500/30 group-hover:border-purple-500 transition-colors shadow-xl"
                />
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={28} className="text-white" />
                </div>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
             <p className="text-xs text-muted-foreground mt-4 font-bold tracking-wide uppercase">Upload New Avatar</p>
          </div>

          <div className="space-y-5">
            <div>
               <label className="block text-sm font-bold text-muted-foreground mb-2 ml-1">Username</label>
               <input 
                 type="text" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-foreground font-medium"
               />
            </div>

            <div>
               <label className="block text-sm font-bold text-muted-foreground mb-2 ml-1">Bio</label>
               <textarea 
                 value={bio}
                 onChange={(e) => setBio(e.target.value)}
                 rows={3}
                 placeholder="Write something about yourself..."
                 className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-foreground resize-none font-medium"
               ></textarea>
            </div>

            <div>
               <label className="block text-sm font-bold text-muted-foreground mb-2 ml-1">Location</label>
               <input 
                 type="text" 
                 value={location}
                 onChange={(e) => setLocation(e.target.value)}
                 placeholder="e.g. Silicon Valley"
                 className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-foreground font-medium"
               />
            </div>

            <div>
               <label className="block text-sm font-bold text-muted-foreground mb-2 ml-1">Website</label>
               <input 
                 type="text" 
                 value={website}
                 onChange={(e) => setWebsite(e.target.value)}
                 placeholder="e.g. sociosphere.network"
                 className="w-full bg-secondary/30 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-foreground font-medium"
               />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Profile Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};
