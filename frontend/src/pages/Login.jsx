import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-10 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="z-10 text-center space-y-6 max-w-md">
          <h1 className="text-5xl font-black tracking-tight text-white">
            Welcome back to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">SocioSphere</span>.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Dive into the most premium network ever created. Connect, share, and scale your social gravity.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
            <p className="text-muted-foreground">Enter your details to pick up where you left off</p>
            {error && <p className="text-red-500 mt-2 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-muted-foreground"
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
                <>Sign In <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground pt-4">
            Don't have an account? <Link to="/register" className="text-purple-500 hover:text-purple-400 font-medium transition-colors">Create one now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
