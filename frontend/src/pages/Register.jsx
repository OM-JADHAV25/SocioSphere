import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ username, email, password });
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden bg-zinc-950 order-2">
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        
        <div className="z-10 text-center space-y-6 max-w-md">
          <h1 className="text-5xl font-black tracking-tight text-white">
            Join the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Revolution</span>.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            The next generation of social networking is here. Claim your unique identity today.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 bg-background relative order-1">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="text-muted-foreground">Welcome! Please fill in the details to get started.</p>
            {error && <p className="text-red-500 mt-2 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-pink-500 transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-pink-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-pink-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-medium py-3 rounded-xl hover:opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>Sign Up <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground pt-4">
            Already have an account? <Link to="/login" className="text-pink-500 hover:text-pink-400 font-medium transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
