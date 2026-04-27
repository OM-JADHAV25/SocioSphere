import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import useSocketStore from '../store/useSocketStore';

export const ChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const { messages, sendMessage } = useSocketStore();

  const handleSend = () => {
    if(!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  }

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer ${isOpen ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100 translate-y-0'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Glassmorphic Drawer */}
      <div className={`fixed bottom-4 right-4 w-96 h-[32rem] bg-background/60 backdrop-blur-3xl border border-border/50 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border/40 bg-zinc-900/40">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center p-0.5">
                 <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white font-bold text-xs">AI</div>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Sphere Assistant</h3>
                <p className="text-xs text-green-400 flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span> Online via Sockets</p>
              </div>
           </div>
           <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-2 hover:bg-white/10 rounded-full">
             <X size={20} />
           </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
           <div className="flex flex-col gap-1 items-start">
              <div className="bg-secondary/60 text-foreground px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[80%] text-[15px] leading-relaxed">
                Welcome to SocioSphere! I'm your real-time assistant. We are fully connected via Socket.io now ✨
              </div>
              <span className="text-[10px] text-zinc-500 ml-1 font-medium">System</span>
           </div>

           {messages.map((msg) => (
             <div key={msg.id} className="flex flex-col gap-1 items-end animate-in slide-in-from-right-2 duration-300">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[80%] text-[15px] shadow-lg shadow-purple-500/20">
                  {msg.text}
                </div>
             </div>
           ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40 bg-background/80">
          <div className="relative flex items-center">
             <input 
               type="text" 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Send a whisper..."
               className="w-full bg-secondary/30 border border-border/50 text-foreground rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-zinc-500 text-[15px]"
             />
             <button onClick={handleSend} disabled={!inputText.trim()} className="absolute right-2 p-2 text-purple-500 hover:bg-purple-500/20 rounded-full transition-colors disabled:opacity-50 cursor-pointer">
               <Send size={18} />
             </button>
          </div>
        </div>

      </div>
    </>
  );
};
