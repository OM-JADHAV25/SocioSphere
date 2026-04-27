import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { Compass } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div className="min-h-screen bg-background relative flex justify-center">
      <Sidebar />
      <main className="flex-1 min-h-screen max-w-2xl w-full md:ml-20 xl:ml-72 lg:mr-80 border-x border-border flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background">
        <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
           <Compass size={40} className="text-purple-400 animate-[spin_4s_linear_infinite]" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-4">{title}</h1>
        <p className="text-muted-foreground leading-relaxed max-w-sm font-medium">
          We're currently forging this feature in the SocioSphere engineering labs. It will be dropping natively in a future rollout!
        </p>
      </main>
      <RightPanel />
    </div>
  );
};

export default ComingSoon;
