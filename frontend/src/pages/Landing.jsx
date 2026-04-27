import { ArrowRight, Globe, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-pink-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">SocioSphere</span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center pt-20">
        
        <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tight leading-[1.05] max-w-5xl">
          The Next Generation of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 filter drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] relative inline-block mt-2">Social Gravity.</span>
        </h1>
        
        <p className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed font-medium">
          Step into a beautifully engineered, real-time social ecosystem built for creators, thinkers, and digital pioneers. No noise, just pure networking.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-6">
          <Link to="/login" className="group flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
            Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md">
            Explore Platform
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-40 grid md:grid-cols-3 gap-8 max-w-6xl w-full pb-32">
          {/* Card 1 */}
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] backdrop-blur-md hover:bg-white/[0.05] transition-all hover:-translate-y-2 text-left group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 mb-8 group-hover:scale-110 transition-transform">
              <Globe size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Global Connectivity</h3>
            <p className="text-zinc-400/90 leading-relaxed font-medium">Connect with minds across the globe instantly. Share your thoughts in an ultra-premium, noise-free environment.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] backdrop-blur-md hover:bg-white/[0.05] transition-all hover:-translate-y-2 text-left group mt-0 md:mt-12">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-2xl flex items-center justify-center text-pink-400 mb-8 group-hover:scale-110 transition-transform">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Real-Time Engine</h3>
            <p className="text-zinc-400/90 leading-relaxed font-medium">Powered by an advanced WebSocket layer. Watch likes, comments, and direct messages arrive at the speed of light.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] backdrop-blur-md hover:bg-white/[0.05] transition-all hover:-translate-y-2 text-left group mt-0 md:mt-24">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Absolute Security</h3>
            <p className="text-zinc-400/90 leading-relaxed font-medium">Your identity is yours. Protected by robust, JWT-encrypted authentication algorithms keeping your data sealed.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
