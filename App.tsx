
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SnapChartLogo } from './components/SnapChartLogo';
import { AnimatedSplash } from './components/AnimatedSplash';
import { analyzeChartImage, chatWithChart, ChartAnalysis } from './services/gemini';
import { Loader2, X, TrendingUp, AlertCircle, ChevronRight, ArrowRight, Upload, Mail, Camera, User, Lock, ArrowLeft, Bell, Clock, Home, Crown, ScanLine, LogOut, Pencil, CheckCircle2, Sparkles, CreditCard, Activity, Shield, Target, Zap, AlertTriangle, Lightbulb, Flame, Waves, Timer, BarChart3, Search, Share2, Download, Rocket, Smile, Triangle, Star, Heart, RefreshCw, BarChart, Check, Twitter, Linkedin, Newspaper, Infinity, Settings, HelpCircle, FileText, Info, Moon, Sun, KeyRound, Globe, Phone, ShieldCheck, Crosshair, ArrowDown, ArrowUp, MessageSquare, Send, Bot, Trash2, BrainCircuit, MousePointer2, Presentation, Layers, Gauge, Cpu, Eye, UserCircle, Briefcase, BarChart4, TrendingDown, Medal, Trophy, Coins, Bitcoin, GraduationCap, Wallet, PieChart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- NOTIFICATION TYPES & UTILS ---
type NotificationType = 'login' | 'logout' | 'scan' | 'subscription' | 'profile' | 'system' | 'delete';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: NotificationType;
  read: boolean;
}

const formatTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
};

// --- REUSABLE COMPONENTS ---

const NotificationBell = ({ onClick, unreadCount }: { onClick: () => void, unreadCount: number }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }} 
    className="relative w-10 h-10 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-lg z-30"
  >
      <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1A1A1A] animate-pulse" />
      )}
  </button>
);

const UserAvatar = ({ isPro, currentPlan, onClick, imageUrl, name }: { isPro: boolean, currentPlan?: string, onClick?: () => void, imageUrl?: string | null, name: string }) => {
    return (
    <div 
        onClick={onClick}
        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 relative overflow-visible shadow-lg cursor-pointer bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]`}
    >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.2),transparent)] animate-pulse-slow rounded-full" />
        
        {imageUrl ? (
            <img src={imageUrl} alt="User" className="w-full h-full object-cover rounded-full" />
        ) : (
            <Crown className="w-5 h-5 text-[#FFD700] relative z-10" />
        )}
    </div>
    );
};

const NotificationPanel = ({ notifications, onClose, onClear }: { notifications: AppNotification[], onClose: () => void, onClear: () => void }) => (
  <div className="absolute top-20 right-4 w-80 max-h-[60vh] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60] flex flex-col animate-scale-in origin-top-right">
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Activity Log</h3>
          </div>
          {notifications.length > 0 && (
            <button onClick={onClear} className="text-xs text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
              Clear All
            </button>
          )}
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-white/30">
               <Bell className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-xs">No recent activity</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3 mb-1 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group relative border border-transparent hover:border-black/5 dark:hover:border-white/5">
                  <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                        ${notif.type === 'scan' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 
                          notif.type === 'subscription' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                          notif.type === 'profile' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                          notif.type === 'login' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                          notif.type === 'delete' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                          'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {notif.type === 'scan' && <ScanLine className="w-4 h-4" />}
                          {notif.type === 'subscription' && <Crown className="w-4 h-4" />}
                          {notif.type === 'profile' && <User className="w-4 h-4" />}
                          {notif.type === 'login' && <LogOut className="w-4 h-4 rotate-180" />}
                          {notif.type === 'delete' && <Trash2 className="w-4 h-4" />}
                          {notif.type === 'system' && <Sparkles className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                             <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate pr-2">{notif.title}</p>
                             <span className="text-[10px] text-gray-500 dark:text-white/30 whitespace-nowrap">{formatTimeAgo(notif.timestamp)}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-white/60 leading-snug line-clamp-2">{notif.message}</p>
                      </div>
                  </div>
                  {!notif.read && <div className="absolute top-4 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />}
              </div>
            ))
          )}
      </div>
  </div>
);

const StatusModal = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  message, 
  actionLabel 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  type: 'success' | 'error'; 
  title: string; 
  message: string; 
  actionLabel: string; 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-8 w-full max-sm text-center animate-scale-in shadow-2xl">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
          type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed whitespace-pre-line">{message}</p>
        <button 
          onClick={onClose} 
          className="w-full h-14 bg-white text-black rounded-2xl font-bold transition-transform active:scale-95 hover:bg-gray-100"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

// --- CANDLE JUMP GAME COMPONENT ---
const CandleJumpGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef<number>(0);
  
  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -10;
  const GAME_SPEED = 5;
  const OBSTACLE_SPAWN_RATE = 100;

  const playerRef = useRef({ x: 50, y: 150, width: 20, height: 20, dy: 0, grounded: true });
  const obstaclesRef = useRef<{x: number, y: number, width: number, height: number, type: 'red'}[]>([]);
  const frameRef = useRef(0);
  const scoreRef = useRef(0);

  const jump = useCallback(() => {
    if (gameOver) {
        setGameOver(false);
        setScore(0);
        scoreRef.current = 0;
        playerRef.current = { x: 50, y: 150, width: 20, height: 20, dy: 0, grounded: true };
        obstaclesRef.current = [];
        frameRef.current = 0;
        loop();
        return;
    }
    if (playerRef.current.grounded) {
      playerRef.current.dy = JUMP_STRENGTH;
      playerRef.current.grounded = false;
    }
  }, [gameOver]);

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const p = playerRef.current;
    p.dy += GRAVITY;
    p.y += p.dy;

    if (p.y + p.height >= canvas.height - 10) {
      p.y = canvas.height - 10 - p.height;
      p.dy = 0;
      p.grounded = true;
    }

    if (frameRef.current % OBSTACLE_SPAWN_RATE === 0) {
       const height = 30 + Math.random() * 20;
       obstaclesRef.current.push({
         x: canvas.width,
         y: canvas.height - 10 - height,
         width: 15,
         height: height,
         type: 'red'
       });
    }

    for (let i = 0; i < obstaclesRef.current.length; i++) {
        let obs = obstaclesRef.current[i];
        obs.x -= GAME_SPEED;

        if (
            p.x < obs.x + obs.width &&
            p.x + p.width > obs.x &&
            p.y < obs.y + obs.height &&
            p.y + p.height > obs.y
        ) {
            setGameOver(true);
            cancelAnimationFrame(requestRef.current);
            return;
        }
    }

    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x + obs.width > 0);

    ctx.beginPath();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.moveTo(p.x + p.width/2, p.y - 5);
    ctx.lineTo(p.x + p.width/2, p.y + p.height + 5);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    obstaclesRef.current.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.moveTo(obs.x + obs.width/2, obs.y - 5);
        ctx.lineTo(obs.x + obs.width/2, obs.y + obs.height + 5);
        ctx.stroke();
    });

    if (frameRef.current % 10 === 0) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
    }

    frameRef.current++;
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div 
        className="absolute inset-0 flex flex-col items-center justify-center z-30 cursor-pointer" 
        onClick={jump}
    >
        <canvas ref={canvasRef} width={280} height={150} className="rounded-xl" />
        <div className="absolute top-2 right-4 text-white font-mono text-xs font-bold opacity-80">Score: {score}</div>
        {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
                <div className="text-center">
                    <p className="text-white font-bold mb-2">Game Over</p>
                    <p className="text-xs text-white/70">Tap to Restart</p>
                </div>
            </div>
        )}
        {!gameOver && score === 0 && (
             <div className="absolute bottom-4 text-xs text-white/50 font-medium animate-pulse">Tap to Jump</div>
        )}
    </div>
  );
};

// --- CHAT INTERFACE ---
const ChatInterface = ({ base64Image, mimeType }: { base64Image: string, mimeType: string }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithChart(base64Image, mimeType, userMsg, historyForApi);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all active:scale-95 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30"
      >
        <MessageSquare className="w-5 h-5" />
        <span>Chat with Chart AI</span>
        <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white">PRO</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-[#1A1A1D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-4 flex flex-col animate-scale-in" style={{ height: '400px' }}>
      <div className="h-12 bg-white/5 border-b border-white/5 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
           <Bot className="w-5 h-5 text-blue-400" />
           <span className="font-bold text-white text-sm">Chart Assistant</span>
         </div>
         <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Ask me anything about this chart setup!</p>
            <p className="text-xs mt-2 opacity-60">e.g., "Where should I set my stop loss?"</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-[#252529] text-gray-200 border border-white/5 rounded-tl-sm'
            }`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-[#252529] rounded-2xl px-4 py-3 border border-white/5 flex gap-1">
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-black/20 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about risk, entry, etc..."
          className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENTS ---
const CryptoCard = ({ symbol, name, pattern, score, color, graphPath, onClick }: any) => (
    <div onClick={onClick} className={`relative overflow-hidden rounded-3xl p-5 min-w-[180px] flex flex-col justify-between h-48 border ${color === 'green' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'} cursor-pointer hover:scale-[1.02] transition-transform`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${color === 'green' ? 'from-green-500/10' : 'from-red-500/10'} to-transparent opacity-50`} />
        
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color === 'green' ? 'bg-[#F7931A]' : 'bg-[#627EEA]'}`}>
                     <span className="text-white font-bold text-xs">{symbol.substring(0,3)}</span>
                </div>
                <div>
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-none">{symbol}</h3>
                    <p className="text-gray-500 dark:text-white/50 text-xs truncate w-20">{name}</p>
                </div>
            </div>
            
            <div className="space-y-1 mb-4">
                <p className="text-gray-700 dark:text-white text-sm font-medium truncate">{pattern}</p>
                <p className={`text-2xl font-bold ${color === 'green' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{score}</p>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16">
             <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                 <path 
                    d={graphPath} 
                    fill="none" 
                    stroke={color === 'green' ? '#22c55e' : '#ef4444'} 
                    strokeWidth="3" 
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-lg"
                 />
                 <path 
                    d={`${graphPath} V 40 H 0 Z`} 
                    fill={color === 'green' ? 'url(#gradGreen)' : 'url(#gradRed)'} 
                    opacity="0.2" 
                 />
                 <defs>
                    <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                    </linearGradient>
                 </defs>
             </svg>
        </div>
    </div>
);

// --- HISTORY VIEW COMPONENTS ---
const HistoryItem = ({ symbol, name, time, pattern, trend, graphPath, image, onClick, onDelete }: any) => {
  const isBullish = trend === 'Bullish' || trend === 'Up';
  const bgGradient = isBullish 
    ? 'from-green-500/10 via-transparent to-transparent' 
    : 'from-red-500/10 via-transparent to-transparent';
  const strokeColor = isBullish ? '#22c55e' : '#ef4444';
  const fillColor = isBullish ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <div 
        onClick={onClick}
        className="group relative w-full h-24 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 rounded-[24px] overflow-hidden mb-3 flex items-center shrink-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors active:scale-[0.99] shadow-sm"
    >
       <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${bgGradient} opacity-60 z-10`} />
       
       <div className="absolute left-0 bottom-0 h-full w-32 opacity-40">
          {image ? (
            <div className="w-full h-full relative">
                <img src={image} alt="Chart" className="w-full h-full object-cover grayscale opacity-50 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white dark:to-[#1A1A1A]" />
            </div>
          ) : (
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
               <path d={graphPath} fill="none" stroke={strokeColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
               <path d={`${graphPath} V 50 H 0 Z`} fill={fillColor} />
            </svg>
          )}
       </div>

       <div className="relative z-20 flex items-center justify-between w-full px-5">
          <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ${isBullish ? 'bg-[#F7931A]' : 'bg-[#627EEA]'}`}>
                 <span className="text-white font-bold text-xs">{symbol.substring(0,3)}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-white font-bold text-xl tracking-tight leading-none">{symbol}</span>
                  <span className="text-gray-500 dark:text-white/40 text-xs font-medium mt-1 truncate max-w-[100px]">{name}</span>
              </div>
          </div>
          <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 dark:text-white/40 text-[10px] font-medium">{time}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
              </div>
              <span className="text-gray-800 dark:text-white font-semibold text-base tracking-wide truncate max-w-[120px]">{pattern}</span>
          </div>
       </div>
    </div>
  );
};

interface ViewProps {
  onNotificationClick: () => void;
  unreadCount: number;
  isPro?: boolean;
}

const HistoryView = ({ history, onNotificationClick, unreadCount, onHistoryItemClick, onDeleteItem, isPro = true, userImage, currentPlan, name }: { history: any[], onHistoryItemClick: (item: any) => void, onDeleteItem: (id: string) => void, userImage?: string | null, currentPlan?: string, name: string } & ViewProps) => {
   return (
     <div className="h-full relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex justify-between items-center z-50 pointer-events-none">
           <div className="pointer-events-auto"><UserAvatar isPro={isPro} currentPlan={currentPlan} imageUrl={userImage} name={name} /></div>
           <div className="pointer-events-auto"><NotificationBell onClick={onNotificationClick} unreadCount={unreadCount} /></div>
        </div>

        <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 z-20">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Scan History</h1>

            <div className="flex flex-col">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-white/30">
                        <ScanLine className="w-12 h-12 mb-3 opacity-50" />
                        <p>No scans yet</p>
                    </div>
                ) : (
                    history.map((item, idx) => (
                        <HistoryItem 
                            key={item.id || idx} 
                            {...item} 
                            onClick={() => onHistoryItemClick(item)} 
                            onDelete={() => onDeleteItem(item.id || idx)}
                        />
                    ))
                )}
            </div>
        </div>
     </div>
   )
}

const SubscriptionView = ({ onNotificationClick, unreadCount, isPro, userImage, currentPlan, name }: ViewProps & { userImage?: string | null, currentPlan: string, name: string }) => {
  return (
    <div className="h-full relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex justify-between items-center z-50 pointer-events-none">
         <div className="pointer-events-auto"><UserAvatar isPro={true} currentPlan="lifetime" imageUrl={userImage} name={name} /></div>
         <div className="pointer-events-auto"><NotificationBell onClick={onNotificationClick} unreadCount={unreadCount} /></div>
      </div>

      <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 z-20">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Account Tier</h1>
            <p className="text-gray-500 dark:text-white/60 text-sm font-light">Enjoy your unlimited premium access.</p>
          </div>
          
          <div className="space-y-5 pb-8">
            <div className="relative bg-[#050505] border border-[#FFD700] rounded-3xl p-8 overflow-hidden transition-all shadow-[0_0_30px_rgba(255,215,0,0.15)]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 blur-[50px] rounded-full pointer-events-none" />
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Premium Lifetime</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><Crown className="w-2.5 h-2.5 fill-current" /> ACTIVE</span>
                            <span className="text-[#FFD700]/70 text-xs font-bold uppercase tracking-widest">VIP Member</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-baseline gap-1 mt-8 mb-8">
                    <h2 className="text-5xl font-black text-[#FFD700]">$99</h2>
                    <span className="text-gray-500 text-sm font-medium">unlocked forever</span>
                </div>
                <ul className="space-y-4 mb-10 relative z-10">
                    {[
                      { label: 'Unlimited Scans', icon: ScanLine },
                      { label: 'Deep Analysis', icon: BrainCircuit },
                      { label: 'Risk Management', icon: Shield },
                      { label: 'AI Chat Access', icon: MessageSquare },
                      { label: 'VIP Badge', icon: Crown }
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center border border-[#FFD700]/30">
                                <item.icon className="w-4 h-4 text-[#FFD700]" />
                            </div>
                            <span className="text-gray-200 text-base font-semibold">{item.label}</span>
                        </li>
                    ))}
                </ul>

                <div className="w-full h-16 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] font-bold tracking-widest uppercase text-sm relative z-20">
                    <CheckCircle2 className="w-5 h-5 mr-3" /> Plan is Fully Active
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

const ScanView = ({ onUploadClick, onCameraClick, onNotificationClick, unreadCount, isPro, userImage, currentPlan, name }: { onUploadClick: () => void, onCameraClick: () => void, userImage?: string | null, currentPlan?: string, name: string } & ViewProps) => (
  <div className="h-full relative overflow-hidden animate-fade-in">
    <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex justify-between items-center z-50 pointer-events-none">
       <div className="pointer-events-auto"><UserAvatar isPro={true} currentPlan="lifetime" imageUrl={userImage} name={name} /></div>
       <div className="pointer-events-auto"><NotificationBell onClick={onNotificationClick} unreadCount={unreadCount} /></div>
    </div>

    <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 z-20 flex flex-col">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Scan Chart</h1>
          <p className="text-gray-500 dark:text-white/60 text-lg font-light">Upload or Capture Chart</p>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center mb-8 w-full">
           <div 
            onClick={onCameraClick}
            className="relative w-full max-w-[260px] aspect-square bg-white dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[40px] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center z-10 overflow-hidden cursor-pointer group transition-all hover:scale-105 hover:border-blue-500/30 hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] mb-8"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-black/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-gray-200 dark:border-white/5 group-hover:bg-blue-500/20 transition-colors">
                   <Camera className="w-10 h-10 text-gray-400 dark:text-white/70 group-hover:text-blue-500 dark:group-hover:text-white transition-colors" />
                </div>
                <span className="text-gray-500 dark:text-white/60 text-xs font-medium group-hover:text-blue-500 dark:group-hover:text-white transition-colors">Tap to Open Camera</span>
              </div>
           </div>

           <button 
             onClick={onUploadClick}
             className="w-full max-w-[260px] h-14 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/20 rounded-2xl flex items-center justify-center gap-3 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all shadow-lg z-20"
           >
              <Upload className="w-5 h-5" />
              Upload Screenshot
           </button>
        </div>
    </div>
  </div>
);

const SettingsView = ({ onBack, theme, toggleTheme, userEmail }: { onBack: () => void, theme: 'dark' | 'light', toggleTheme: () => void, userEmail?: string }) => {
    const [subPage, setSubPage] = useState<'main' | 'security' | 'faq' | 'privacy' | 'terms' | 'about'>('main');

    const PageHeader = ({ title, onBackLocal }: { title: string, onBackLocal: () => void }) => (
        <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex items-center gap-3 z-50 pointer-events-none">
            <button onClick={onBackLocal} className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg">
                <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
        </div>
    );

    const MenuItem = ({ icon: Icon, label, onClick, value }: any) => (
        <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl mb-3 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-white" />
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-sm text-gray-500 dark:text-white/50">{value}</span>}
                <ChevronRight className="w-5 h-5 text-gray-400 dark:text-white/30" />
            </div>
        </button>
    );

    const StaticContentPage = ({ title, children }: any) => (
        <div className="h-full relative overflow-hidden animate-fade-in">
            <PageHeader title={title} onBackLocal={() => setSubPage('main')} />
            <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 z-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-gray-600 dark:text-gray-300 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );

    if (subPage === 'main') {
        return (
            <div className="h-full relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex items-center gap-3 z-50 pointer-events-none">
                     <button onClick={onBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                     </button>
                </div>

                <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-3 ml-1">Appearance</h3>
                        <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-600 dark:text-white" /> : <Sun className="w-5 h-5 text-blue-500" />}
                                </div>
                                <span className="text-gray-900 dark:text-white font-medium">App Theme</span>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 dark:bg-white/20 rounded-full">
                                <span className="text-xs font-bold text-gray-600 dark:text-white capitalize">{theme}</span>
                            </div>
                        </button>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider mb-3 ml-1">Help & Support</h3>
                        <MenuItem icon={HelpCircle} label="FAQ" onClick={() => setSubPage('faq')} />
                        <MenuItem icon={Mail} label="Contact Support" onClick={() => window.location.href = 'mailto:chartxo.official@gmail.com'} />
                        <MenuItem icon={ShieldCheck} label="Privacy Policy" onClick={() => setSubPage('privacy')} />
                        <MenuItem icon={FileText} label="Terms of Service" onClick={() => setSubPage('terms')} />
                        <MenuItem icon={Info} label="About Us" onClick={() => setSubPage('about')} />
                    </div>
                </div>
            </div>
        );
    }
    
    if (subPage === 'faq') { return (<StaticContentPage title="FAQ"> <div className="space-y-4"> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q1. What does Chartxo do?</h3> <p className="text-sm mt-1">Chartxo scans any trading chart image and instantly identifies patterns, psychology, levels, risk zones, sentiment, and actionable insights.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q2. Is this financial advice?</h3> <p className="text-sm mt-1">No. Chartxo provides educational insights, not investment advice.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q3. What charts can I scan?</h3> <p className="text-sm mt-1">You can scan screenshots or photos of:</p> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>Crypto charts</li> <li>Forex charts</li> <li>Stock charts</li> <li>Indices</li> <li>TradingView screenshots</li> <li>Trading app charts</li> </ul> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q4. What data do you store?</h3> <p className="text-sm mt-1">We temporarily process chart images to generate analysis. Nothing is stored permanently unless saved manually.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q5. Why should I trust the results?</h3> <p className="text-sm mt-1">Our AI detects:</p> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>High-probability patterns</li> <li>Market psychology</li> <li>Support/resistance levels</li> <li>Risk signals</li> <li>Sentiment snapshots</li> </ul> <p className="text-sm mt-1">But trading always involves risk — use responsibly.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q6. Can I use Chartxo for free?</h3> <p className="text-sm mt-1">Yes, all users currently enjoy Premium Lifetime access with unlimited scans.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q7. Why is my scan accuracy different?</h3> <p className="text-sm mt-1">Image clarity, chart type, zoom level, and noise affect AI performance.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">Q8. How do I contact support?</h3> <p className="text-sm mt-1">Email: <a href="mailto:chartxo.official@gmail.com" className="text-blue-500 hover:underline">chartxo.official@gmail.com</a></p> </div> </div> </StaticContentPage>); }
    if (subPage === 'privacy') { return (<StaticContentPage title="Privacy Policy"> <p className="text-sm font-medium mb-4">Last Updated: October 2023</p> <h3 className="font-bold text-gray-900 dark:text-white mt-4">Introduction</h3> <p className="text-sm mt-1">Chartxo (“we”, “our”, “us”) provides AI-powered chart scanning and trading analysis. This Privacy Policy explains how we collect, use, store, and protect your information when you use the Chartxo mobile app.</p> <p className="text-sm mt-1">By using the app, you agree to this policy.</p> <h3 className="font-bold text-gray-900 dark:text-white mt-4">Information We Collect</h3> <h4 className="font-semibold text-gray-800 dark:text-white/90 text-sm mt-2">1. Image & Chart Data</h4> <p className="text-sm mt-1">When you upload or capture a chart image, the image is processed by our AI model to provide analysis.</p> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>We do not use your images to train external models unless you explicitly allow it.</li> <li>Images are automatically deleted after analysis unless you save them manually.</li> </ul> <h4 className="font-semibold text-gray-800 dark:text-white/90 text-sm mt-2">2. Device & Usage Data</h4> <p className="text-sm mt-1">We may collect:</p> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>Device type, operating system, app version</li> <li>Crash logs, performance metrics</li> <li>Basic usage interactions (e.g., button taps, scan count)</li> </ul> <p className="text-sm mt-1">This helps improve app functionality—not for advertising.</p> <h4 className="font-semibold text-gray-800 dark:text-white/90 text-sm mt-2">3. User Profile Information</h4> <p className="text-sm mt-1">We store your name and trading preferences locally on your device to personalize the experience.</p> <h3 className="font-bold text-gray-900 dark:text-white mt-4">How We Use Your Information</h3> <p className="text-sm mt-1">We use your data to:</p> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>Provide accurate AI chart analysis</li> <li>Improve accuracy, speed, and performance</li> <li>Prevent misuse, abuse, or fraud</li> <li>Offer user support</li> <li>Ensure app security</li> </ul> <p className="text-sm mt-1">We do not sell, rent, or trade your data.</p> <h3 className="font-bold text-gray-900 dark:text-white mt-4">Data Storage & Security</h3> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>All data is encrypted in transit (HTTPS/TLS)</li> <li>Sensitive details are encrypted at rest</li> <li>Images are deleted after processing unless saved</li> <li>We restrict internal access to authorized personnel only</li> </ul> <h3 className="font-bold text-gray-900 dark:text-white mt-4">Your Rights</h3> <p className="text-sm mt-1">You may:</p> <ul className="list-disc pl-5 text-sm space-y-1 mt-1"> <li>Request deletion of your data</li> <li>Request a copy of your data</li> <li>Disable account or cancel services</li> <li>Opt-out of analytics collection</li> </ul> <p className="text-sm mt-1">To request, email: <a href="mailto:chartxo.official@gmail.com" className="text-blue-500 hover:underline">chartxo.official@gmail.com</a></p> <h3 className="font-bold text-gray-900 dark:text-white mt-4">Children's Privacy</h3> <p className="text-sm mt-1">Our app is not intended for children under 13. We do not knowingly collect child data.</p> <h3 className="font-bold text-gray-900 dark:text-white mt-4">Changes to This Policy</h3> <p className="text-sm mt-1">We may update this notice occasionally. Continued use of the app indicates acceptance of the updated policy.</p> </StaticContentPage>); }
    if (subPage === 'terms') { return (<StaticContentPage title="Terms of Service"> <div className="space-y-4"> <p className="text-sm">Welcome to Chartxo. By using our application, you agree to the following terms and conditions.</p> <div> <h3 className="font-bold text-gray-900 dark:text-white">1. Service Description</h3> <p className="text-sm mt-1">Chartxo provides AI-powered analysis of financial charts. This tool is intended for educational and informational purposes only.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">2. No Financial Advice</h3> <p className="text-sm mt-1">The insights provided by Chartxo do not constitute financial, investment, or trading advice. Trading involves significant risk. You are solely responsible for your own trading decisions.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">3. User Conduct</h3> <p className="text-sm mt-1">You agree not to use the app for any illegal purposes or to attempt to reverse engineer the underlying AI models.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">4. Subscriptions</h3> <p className="text-sm mt-1">Account tiers and features are managed by Chartxo AI Labs.</p> </div> <div> <h3 className="font-bold text-gray-900 dark:text-white">5. Limitation of Liability</h3> <p className="text-sm mt-1">Chartxo shall not be held liable for any financial losses or damages resulting from the use of our services.</p> </div> </div> </StaticContentPage>); }
    if (subPage === 'about') {
        return (
            <StaticContentPage title="About Us">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Our Mission</h3>
                        <p className="text-sm leading-relaxed">
                            Chartxo was built with a single mission: to empower traders with institutional-grade AI analysis in the palm of their hand.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">The Technology</h3>
                        <p className="text-sm leading-relaxed">
                            Our proprietary models analyze thousands of data points within your chart images—from candlestick patterns and support zones to volume sentiment and price psychology—all in a matter of seconds.
                        </p>
                    </div>
                    <div className="pt-6 border-t border-black/5 dark:border-white/5">
                        <p className="text-xs text-gray-500 dark:text-white/40">Version 3.1.0 (Stable)</p>
                        <p className="text-xs text-gray-500 dark:text-white/40 mt-1">© 2024 Chartxo AI Labs</p>
                    </div>
                </div>
            </StaticContentPage>
        );
    }

    return null;
};

const ProfileView = ({ user, onBack, onUpdateName, onUpdateImage, onRemoveImage, onNotificationClick, unreadCount, onSettingsClick }: { user: any, onBack: () => void, onUpdateName: (name: string) => void, onUpdateImage: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemoveImage: () => void, onSettingsClick: () => void, currentPlan?: string } & ViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.fullName || "");
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const getInitials = (name: string) => { return name ? name.charAt(0).toUpperCase() : 'U'; };
  const saveName = () => { if (tempName.trim() !== "") { onUpdateName(tempName); setIsEditingName(false); } };

  const handleCameraClick = () => {
    if (user.profileImage) {
        setShowPhotoOptions(true);
    } else {
        fileInputRef.current?.click();
    }
  };

  return (
    <div className="h-full relative overflow-hidden animate-fade-in">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { onUpdateImage(e); if(fileInputRef.current) fileInputRef.current.value = ''; }} />
      
      <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex justify-between items-center z-50 pointer-events-none">
         <button onClick={onBack} className="pointer-events-auto w-12 h-12 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors shadow-lg">
            <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
         </button>
         <div className="pointer-events-auto"><NotificationBell onClick={onNotificationClick} unreadCount={unreadCount} /></div>
      </div>

      <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 z-20">
          <div className="flex flex-col items-center mb-4">
             <div className="relative mb-6">
                 <div className="absolute -inset-[3px] rounded-full opacity-80 blur-[2px] bg-[conic-gradient(from_0deg,#FFD700,#000000,#FFD700,#000000,#FFD700)]" />
                 <div className="relative w-32 h-32 rounded-full border-[3px] border-[#050505] bg-[#0F0F0F] flex items-center justify-center overflow-hidden shadow-2xl z-10">
                     {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover opacity-90" />
                     ) : (
                        <div className="w-full h-full bg-[#0F0F0F] flex items-center justify-center">
                            <span className="text-5xl font-bold text-white drop-shadow-md opacity-90">{getInitials(user?.fullName)}</span>
                        </div>
                     )}
                 </div>
                 <div className="absolute -top-2 -right-2 bg-[#0A0A0A] text-[#E5E5E5] text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-xl backdrop-blur-md flex items-center gap-1 z-20"><Crown className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> VIP</div>
                 
                 <button onClick={handleCameraClick} className="absolute bottom-1 right-1 bg-[#1A1A1A] w-10 h-10 rounded-full flex items-center justify-center border border-white/20 shadow-lg z-20 hover:bg-[#252525] transition-colors active:scale-95 group">
                    <Camera className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                 </button>
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wide drop-shadow-lg flex items-center gap-2">Profile Details</h2>
          </div>
          <div className="w-full px-1">
             <div className="space-y-4 pb-4">
                 <div className="group relative w-full h-[72px] rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-xl flex items-center px-5 transition-all hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm">
                     <User className="w-6 h-6 text-gray-400 dark:text-white/70 mr-4 transition-colors" />
                     <div className="flex-1 flex flex-col justify-center">
                         {isEditingName ? (
                            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="bg-transparent border-b border-blue-500 text-gray-900 dark:text-white text-lg font-medium focus:outline-none w-full" autoFocus />
                         ) : (
                            <span className="text-gray-900 dark:text-white text-lg font-medium tracking-wide">{user?.fullName || "Trader"}</span>
                         )}
                     </div>
                     {isEditingName ? (<CheckCircle2 className="w-5 h-5 text-green-500 cursor-pointer hover:scale-110 transition-transform" onClick={saveName} />) : (<Pencil className="w-5 h-5 text-gray-400 dark:text-white/40 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { setTempName(user?.fullName || "Trader"); setIsEditingName(true); }} />)}
                 </div>
                 <button onClick={onSettingsClick} className="group relative w-full h-[72px] rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-xl flex items-center px-5 transition-all hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm cursor-pointer">
                     <Settings className="w-6 h-6 text-gray-400 dark:text-white/70 mr-4 transition-colors group-hover:text-gray-600 dark:group-hover:text-white" />
                     <div className="flex-1 flex flex-col justify-center text-left">
                          <span className="text-gray-900 dark:text-white text-lg font-medium tracking-wide">Settings</span>
                          <span className="text-xs text-gray-500 dark:text-white/40">Security, Theme, Support</span>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-300 dark:text-white/20" />
                 </button>
             </div>
          </div>
      </div>

      {showPhotoOptions && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowPhotoOptions(false)}>
            <div className="w-full max-sm bg-[#1A1A1A] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up sm:animate-scale-in m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6 text-center">Edit Profile Photo</h3>
                <div className="space-y-3">
                    <button onClick={() => { fileInputRef.current?.click(); setShowPhotoOptions(false); }} className="w-full h-14 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors active:scale-95"> <Camera className="w-5 h-5" /> Change Photo </button>
                    <button onClick={() => { onRemoveImage(); setShowPhotoOptions(false); }} className="w-full h-14 bg-red-500/10 text-red-500 font-bold border border-red-500/20 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors active:scale-95"> <Trash2 className="w-5 h-5" /> Remove Photo </button>
                    <button onClick={() => setShowPhotoOptions(false)} className="w-full h-14 bg-transparent text-gray-500 font-medium rounded-xl hover:text-white transition-colors mt-2"> Cancel </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ChartAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: Splash, 1: Survey, 2: Scan Info, 3: App
  const [surveyStep, setSurveyStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'history' | 'subscription' | 'profile'>('home');
  const [profileSubView, setProfileSubView] = useState<'main' | 'settings'>('main');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [credits, setCredits] = useState(Infinity);
  const [isPro, setIsPro] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'starter' | 'lifetime'>('lifetime'); 
  const [totalScans, setTotalScans] = useState(0);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string; actionLabel: string; onAction?: () => void; }>({ isOpen: false, type: 'success', title: '', message: '', actionLabel: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tooltip State
  const [hoverData, setHoverData] = useState<{o:string, h:string, l:string, c:string, v:string} | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Survey Data
  const [userName, setUserName] = useState("");
  const [tradingExp, setTradingExp] = useState("");
  const [primaryMarket, setPrimaryMarket] = useState("");
  const [tradingGoal, setTradingGoal] = useState("");
  const [tradingStrategy, setTradingStrategy] = useState("");

  const addNotification = (title: string, message: string, type: NotificationType) => { const newNotif: AppNotification = { id: Date.now().toString() + Math.random().toString().slice(2, 5), title, message, timestamp: Date.now(), type, read: false }; setNotifications(prev => [newNotif, ...prev]); };
  const toggleTheme = () => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); };
  const handleNotificationClick = () => { setIsNotificationOpen(!isNotificationOpen); if (!isNotificationOpen) { setNotifications(prev => prev.map(n => ({...n, read: true}))); } };
  const handleStatusModalClose = () => { if (statusModal.onAction) { statusModal.onAction(); } setStatusModal(prev => ({ ...prev, isOpen: false, onAction: undefined })); };
  const handleSplashEnd = () => { setLoadingApp(false); };

  useEffect(() => { 
      const profile = localStorage.getItem('snapchart_user_profile');
      if (profile) {
          const parsed = JSON.parse(profile);
          setCurrentUser(parsed);
          setUserName(parsed.fullName);
          setIsAuthenticated(true);
          setOnboardingStep(3);
      } else {
          setOnboardingStep(1);
      }
      
      const savedHistory = localStorage.getItem('scan_history');
      if (savedHistory) {
          setScanHistory(JSON.parse(savedHistory));
      }
  }, []);

  useEffect(() => { if (error) { setStatusModal({ isOpen: true, type: 'error', title: 'Error', message: error, actionLabel: 'Dismiss', onAction: () => setError(null) }); } }, [error]);
  
  const triggerFileInput = () => { fileInputRef.current?.click(); };
  
  const startCamera = async () => { 
    setShowCamera(true); 
    try { 
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
      if (videoRef.current) videoRef.current.srcObject = stream; 
    } catch (err) { 
      setError("Camera access denied."); 
      setShowCamera(false); 
    } 
  };
  
  const stopCamera = () => { if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); setShowCamera(false); };
  
  const captureImage = () => { 
    if (videoRef.current && canvasRef.current) { 
      const ctx = canvasRef.current.getContext('2d'); 
      if (ctx) { 
        canvasRef.current.width = videoRef.current.videoWidth; 
        canvasRef.current.height = videoRef.current.videoHeight; 
        ctx.drawImage(videoRef.current, 0, 0); 
        const img = canvasRef.current.toDataURL('image/jpeg'); 
        stopCamera(); 
        handleImageProcessing(img, 'image/jpeg'); 
      } 
    } 
  };

  const playCheckSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio blocked', e));
  };
  
  const handleSurveyComplete = () => {
    const profile = {
        fullName: userName,
        experience: tradingExp,
        market: primaryMarket,
        goal: tradingGoal,
        strategy: tradingStrategy,
        profileImage: null,
        totalScans: 0
    };
    setCurrentUser(profile);
    localStorage.setItem('snapchart_user_profile', JSON.stringify(profile));
    setOnboardingStep(2);
  };

  const handleSlideComplete = () => { 
    setIsAuthenticated(true);
    setOnboardingStep(3); 
  };
  
  const handleUpdateName = (n: string) => { 
      const updated = { ...currentUser, fullName: n };
      setCurrentUser(updated); 
      localStorage.setItem('snapchart_user_profile', JSON.stringify(updated));
  };
  
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updated = { ...currentUser, profileImage: base64 };
        setCurrentUser(updated);
        localStorage.setItem('snapchart_user_profile', JSON.stringify(updated));
        addNotification("Profile Updated", "Your profile photo has been updated.", "profile");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveProfileImage = () => {
    const updated = { ...currentUser, profileImage: null };
    setCurrentUser(updated);
    localStorage.setItem('snapchart_user_profile', JSON.stringify(updated));
    addNotification("Profile Updated", "Your profile photo has been removed.", "profile");
  };

  const handleImageProcessing = async (base64: string, type: string) => { 
      setSelectedImage(base64); 
      setAnalyzing(true); 
      setResult(null);
      setError(null);
      
      try { 
          const cleanedBase64 = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
          const res = await analyzeChartImage(cleanedBase64, type); 
          
          if (res) { 
              setResult(res); 
              setTotalScans(prev => prev + 1);
              const newScan = { 
                id: Date.now().toString(),
                symbol: "SCAN", 
                name: res.detected_pattern, 
                pattern: res.detected_pattern, 
                score: res.confidence_score, 
                trend: res.direction, 
                time: 'Just now', 
                image: base64, 
                fullAnalysis: res,
                graphPath: res.direction === 'Bullish' ? "M 0 35 L 20 30 L 40 25 L 60 15 L 80 10 L 100 0" : "M 0 5 L 20 10 L 40 15 L 60 25 L 80 30 L 100 35"
              };
              const updatedHistory = [newScan, ...scanHistory];
              setScanHistory(updatedHistory); 
              localStorage.setItem('scan_history', JSON.stringify(updatedHistory));
              addNotification("Scan Complete", `Successfully analyzed ${res.detected_pattern}`, "scan");
          } else {
              setError("Analysis failed. Please try a clearer image.");
          }
      } catch (err: any) { 
          console.error("Processing Error:", err);
          setError(err.message || "Analysis error. Please check your connection."); 
      } finally { 
          setAnalyzing(false); 
      } 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleImageProcessing(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!result) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Simulate reading data based on cursor X position
    const seed = Math.floor(x / 12);
    const base = 50000 + (Math.sin(seed * 0.2) * 800);
    setHoverData({
        o: (base).toFixed(2),
        h: (base + Math.random() * 50).toFixed(2),
        l: (base - Math.random() * 50).toFixed(2),
        c: (base + (Math.random() - 0.5) * 30).toFixed(2),
        v: (Math.abs(Math.cos(seed) * 2000) + 1000).toFixed(0) + ' BTC'
    });
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleHistoryItemClick = (item: any) => { if (item.fullAnalysis) { setResult(item.fullAnalysis); setSelectedImage(item.image); } };
  
  const handleDeleteHistoryItem = (id: string) => {
    const updated = scanHistory.filter(item => item.id !== id);
    setScanHistory(updated);
    localStorage.setItem('scan_history', JSON.stringify(updated));
    addNotification("Scan Deleted", "The scan has been removed from your history.", "delete");
  };

  const resetApp = () => { setSelectedImage(null); setResult(null); setAnalyzing(false); };
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`relative w-full h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'dark bg-[#050505] text-white' : 'bg-[#F2F2F7] text-gray-900'}`} onClick={() => setIsNotificationOpen(false)}>
      {loadingApp && <AnimatedSplash onComplete={handleSplashEnd} />}
      <StatusModal isOpen={statusModal.isOpen} onClose={handleStatusModalClose} type={statusModal.type} title={statusModal.title} message={statusModal.message} actionLabel={statusModal.actionLabel} />
      {isNotificationOpen && isAuthenticated && <NotificationPanel notifications={notifications} onClose={() => setIsNotificationOpen(false)} onClear={() => setNotifications([])} />}
      
      {/* GLOBAL HIDDEN FILE INPUT */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      <canvas ref={canvasRef} className="hidden" />

      <main className="relative z-10 flex-1 flex flex-col w-full max-sm mx-auto h-full">
        {!selectedImage ? (
          <div className="flex flex-col h-full w-full">
            
            {/* 5-STEP SURVEY SCREEN */}
            {onboardingStep === 1 && (
                <div className="flex flex-col h-full animate-fade-in relative overflow-hidden bg-[#050505] text-white">
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-15%] left-[-15%] w-[120%] h-[50%] bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)] blur-[100px] opacity-60" />
                        <div className="absolute bottom-[5%] right-[-10%] w-[100%] h-[40%] bg-[radial-gradient(circle,rgba(0,183,255,0.06)_0%,transparent_70%)] blur-[100px] opacity-40" />
                        <div className="absolute top-[20%] right-[-10%] w-64 h-64 bg-blue-600/5 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-[20%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
                    </div>
                    
                    <div className="relative z-10 flex-1 flex flex-col px-8 pt-12 pb-10">
                        <div className="mb-12 text-center">
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.4em] mb-3 block opacity-80">Phase {surveyStep} of 5</span>
                            <div className="w-full h-[3px] bg-white/5 rounded-full relative overflow-hidden">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-[600ms] cubic-bezier(0.25, 0.1, 0.25, 1) shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                                    style={{ width: `${(surveyStep/5)*100}%` }} 
                                />
                            </div>
                        </div>

                        <div className="flex-1">
                            {surveyStep === 1 && (
                                <div className="space-y-8 animate-slide-up">
                                    <h2 className="text-[34px] font-bold leading-[1.15] tracking-tight">
                                        What's your <span className="text-blue-500">trading name</span>?
                                    </h2>
                                    <p className="text-gray-400 text-[15px] leading-relaxed font-medium">We'll use this to personalize your dashboard.</p>
                                    
                                    <div className="relative group mt-4">
                                        <div className={`w-full h-[72px] bg-white/5 border border-blue-500/80 rounded-[28px] flex items-center px-6 transition-all duration-300 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.05)]`}>
                                            <UserCircle className="w-6 h-6 text-blue-500 mr-4" />
                                            <input 
                                                type="text" 
                                                placeholder="Enter your name" 
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="flex-1 bg-transparent border-none text-xl font-semibold text-white placeholder-white/20 focus:outline-none"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {surveyStep === 2 && (
                                <div className="space-y-8 animate-slide-up">
                                    <h2 className="text-[34px] font-bold leading-[1.15] tracking-tight">
                                        Your <span className="text-blue-500">Experience</span> level?
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3.5">
                                        {[
                                          { id: 'Novice', icon: GraduationCap },
                                          { id: 'Intermediate', icon: Medal },
                                          { id: 'Professional', icon: Trophy },
                                          { id: 'Institutional', icon: Crown }
                                        ].map((level) => (
                                            <button 
                                                key={level.id} 
                                                onClick={() => { setTradingExp(level.id); playCheckSound(); setTimeout(() => setSurveyStep(3), 300); }}
                                                className={`w-full h-[68px] rounded-[24px] border transition-all duration-300 flex items-center justify-between px-6 backdrop-blur-md ${tradingExp === level.id ? 'bg-blue-500/15 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <level.icon className={`w-5 h-5 ${tradingExp === level.id ? 'text-blue-400' : 'text-white/30'}`} />
                                                    <span className={`text-lg font-bold ${tradingExp === level.id ? 'text-white' : 'text-white/80'}`}>{level.id}</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${tradingExp === level.id ? 'border-blue-500 bg-blue-500' : 'border-white/20'}`}>
                                                    {tradingExp === level.id && <Check className="w-3.5 h-3.5 text-black stroke-[4]" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {surveyStep === 3 && (
                                <div className="space-y-8 animate-slide-up">
                                    <h2 className="text-[34px] font-bold leading-[1.15] tracking-tight">
                                        Primary <span className="text-blue-500">Markets</span>?
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3.5">
                                        {[
                                          { id: 'Crypto', icon: Bitcoin },
                                          { id: 'Forex', icon: Globe },
                                          { id: 'Stocks', icon: BarChart3 },
                                          { id: 'Indices', icon: LineChartIcon } 
                                        ].map((market) => (
                                            <button 
                                                key={market.id} 
                                                onClick={() => { setPrimaryMarket(market.id); playCheckSound(); setTimeout(() => setSurveyStep(4), 300); }}
                                                className={`w-full h-[68px] rounded-[24px] border transition-all duration-300 flex items-center justify-between px-6 backdrop-blur-md ${primaryMarket === market.id ? 'bg-blue-500/15 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <market.icon className={`w-5 h-5 ${primaryMarket === market.id ? 'text-blue-400' : 'text-white/30'}`} />
                                                    <span className={`text-lg font-bold ${primaryMarket === market.id ? 'text-white' : 'text-white/80'}`}>{market.id}</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${primaryMarket === market.id ? 'border-blue-500 bg-blue-500' : 'border-white/20'}`}>
                                                    {primaryMarket === market.id && <Check className="w-3.5 h-3.5 text-black stroke-[4]" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {surveyStep === 4 && (
                                <div className="space-y-8 animate-slide-up">
                                    <h2 className="text-[34px] font-bold leading-[1.15] tracking-tight">
                                        What's your <span className="text-blue-500">Main Goal</span>?
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3.5">
                                        {[
                                          { id: 'Capital Growth', icon: TrendingUp },
                                          { id: 'Daily Income', icon: Wallet },
                                          { id: 'Risk Management', icon: Shield },
                                          { id: 'Market Mastery', icon: BrainCircuit }
                                        ].map((goal) => (
                                            <button 
                                                key={goal.id} 
                                                onClick={() => { setTradingGoal(goal.id); playCheckSound(); setTimeout(() => setSurveyStep(5), 300); }}
                                                className={`w-full h-[68px] rounded-[24px] border transition-all duration-300 flex items-center justify-between px-6 backdrop-blur-md ${tradingGoal === goal.id ? 'bg-blue-500/15 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <goal.icon className={`w-5 h-5 ${tradingGoal === goal.id ? 'text-blue-400' : 'text-white/30'}`} />
                                                    <span className={`text-lg font-bold ${tradingGoal === goal.id ? 'text-white' : 'text-white/80'}`}>{goal.id}</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${tradingGoal === goal.id ? 'border-blue-500 bg-blue-500' : 'border-white/20'}`}>
                                                    {tradingGoal === goal.id && <Check className="w-3.5 h-3.5 text-black stroke-[4]" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {surveyStep === 5 && (
                                <div className="space-y-8 animate-slide-up">
                                    <h2 className="text-[34px] font-bold leading-[1.15] tracking-tight">
                                        Preferred <span className="text-blue-500">Strategy</span>?
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3.5">
                                        {[
                                          { id: 'Smart Money (SMC)', icon: Layers },
                                          { id: 'Price Action', icon: BarChart4 },
                                          { id: 'High Frequency', icon: Zap },
                                          { id: 'Swing Trading', icon: Activity }
                                        ].map((strat) => (
                                            <button 
                                                key={strat.id} 
                                                onClick={() => { setTradingStrategy(strat.id); playCheckSound(); }}
                                                className={`w-full h-[68px] rounded-[24px] border transition-all duration-300 flex items-center justify-between px-6 backdrop-blur-md ${tradingStrategy === strat.id ? 'bg-blue-500/15 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <strat.icon className={`w-5 h-5 ${tradingStrategy === strat.id ? 'text-blue-400' : 'text-white/30'}`} />
                                                    <span className={`text-lg font-bold ${tradingStrategy === strat.id ? 'text-white' : 'text-white/80'}`}>{strat.id}</span>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${tradingStrategy === strat.id ? 'border-blue-500 bg-blue-500' : 'border-white/20'}`}>
                                                    {tradingStrategy === strat.id && <Check className="w-3.5 h-3.5 text-black stroke-[4]" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto space-y-5">
                            {surveyStep === 1 && (
                                <button 
                                    disabled={!userName.trim()}
                                    onClick={() => setSurveyStep(2)}
                                    className="w-full h-[64px] bg-[#1A1A1A] text-white rounded-[24px] font-bold text-lg disabled:opacity-30 active:scale-95 transition-all shadow-xl hover:bg-[#252525] border border-white/5"
                                >
                                    Continue
                                </button>
                            )}
                            {surveyStep === 5 && (
                                <button 
                                    disabled={!tradingStrategy}
                                    onClick={handleSurveyComplete}
                                    className={`w-full h-[58px] rounded-[20px] font-bold text-lg active:scale-95 transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-[0_0_25px_rgba(59,130,246,0.1)] hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] flex items-center justify-center group`}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Finish & Analyze <Sparkles className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                    </span>
                                </button>
                            )}
                            {surveyStep > 1 && (
                                <button 
                                    onClick={() => setSurveyStep(surveyStep - 1)}
                                    className="w-full text-white/40 text-[13px] font-bold uppercase tracking-[0.2em] py-2 flex items-center justify-center gap-2 hover:text-white/60 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Go Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SCAN INFO ONBOARDING */}
            {onboardingStep === 2 && (
              <div className="relative flex flex-col h-full text-white dark overflow-hidden bg-[#050505]">
                  <div className="absolute inset-0 z-0 opacity-20">
                      <div className="absolute top-[10%] left-[10%] w-[80%] h-[40%] bg-blue-500/30 blur-[120px] rounded-full" />
                      <div className="absolute bottom-[10%] right-[10%] w-[80%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" />
                  </div>
                  
                  <div className="relative z-20 flex flex-col h-full justify-between px-8 pt-6 pb-12 overflow-hidden">
                      <div className="animate-fade-in text-center flex flex-col items-center justify-center flex-1 w-full min-h-0">
                          <div className="flex flex-col items-center w-full min-h-0 pt-10 px-4">
                            <div className="relative mb-10">
                              <div className="absolute inset-0 bg-blue-600 blur-[60px] opacity-20 rounded-full" />
                              <div className="relative w-24 h-24 bg-[#0F172A] border border-blue-500/20 rounded-[28px] flex items-center justify-center shadow-2xl z-10 overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                                  <ScanLine className="w-10 h-10 text-blue-500 relative z-10" />
                                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/50 shadow-[0_0_10px_#3B82F6] animate-scan-vertical" />
                              </div>
                            </div>
                            <div className="text-center mb-10 z-10">
                              <h1 className="text-4xl font-bold text-white tracking-tight leading-none mb-1">Advanced</h1>
                              <h1 className="text-4xl font-bold text-blue-500 tracking-tight leading-none">Chart Logic</h1>
                            </div>
                            <div className="w-full max-w-[340px] relative z-10">
                              <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-[#1E293B] z-0" />
                              <div className="space-y-4">
                                  <div className="relative flex items-center gap-4 p-4 bg-[#111] border border-white/5 rounded-[24px] z-10 group transition-colors hover:border-white/10">
                                      <div className="w-12 h-12 rounded-2xl bg-[#0F0F0F] border border-white/10 flex items-center justify-center shrink-0 shadow-lg group-hover:border-white/20 transition-colors">
                                        <Camera className="w-5 h-5 text-gray-300" />
                                      </div>
                                      <div className="flex flex-col text-left">
                                        <span className="text-[15px] font-bold text-white mb-0.5">Snap or Upload</span>
                                        <span className="text-[13px] text-gray-500 font-medium">Capture chart directly</span>
                                      </div>
                                  </div>
                                  <div className="relative flex items-center gap-4 p-4 bg-[#111] border border-blue-500/30 rounded-[24px] z-10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/50">
                                        <Sparkles className="w-5 h-5 text-white" />
                                      </div>
                                      <div className="flex flex-col text-left">
                                        <span className="text-[15px] font-bold text-white mb-0.5">AI Perception</span>
                                        <span className="text-[13px] text-blue-400 font-medium">Patterns & Flows detected</span>
                                      </div>
                                  </div>
                                  <div className="relative flex items-center gap-4 p-4 bg-[#111] border border-white/5 rounded-[24px] z-10 group transition-colors hover:border-white/10">
                                      <div className="w-12 h-12 rounded-2xl bg-[#0F0F0F] border border-white/10 flex items-center justify-center shrink-0 shadow-lg group-hover:border-white/20 transition-colors">
                                        <Target className="w-5 h-5 text-gray-300" />
                                      </div>
                                      <div className="flex flex-col text-left">
                                        <span className="text-[15px] font-bold text-white mb-0.5">Entry Blueprint</span>
                                        <span className="text-[13px] text-gray-500 font-medium">Get precise levels instantly</span>
                                      </div>
                                  </div>
                              </div>
                            </div>
                          </div>
                      </div>

                      <div className="flex flex-col items-center gap-6 z-20 shrink-0">
                        <button 
                          onClick={handleSlideComplete}
                          className="w-56 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center gap-3 group transition-all active:scale-95 hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                        >
                            <span className="text-base font-bold text-white/90 tracking-wide">Enter Console</span>
                            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                  </div>
              </div>
            )}

            {isAuthenticated && onboardingStep === 3 && (
              <div className="flex flex-col h-full relative animate-fade-in overflow-hidden">
                  {activeTab === 'home' && (
                    <div className="h-full relative overflow-hidden">
                       <div className="absolute top-0 left-0 right-0 pt-8 px-6 flex items-center justify-between z-50 pointer-events-none">
                           <div className="flex items-center gap-3 pointer-events-auto">
                                <UserAvatar isPro={true} currentPlan="lifetime" imageUrl={currentUser?.profileImage} name={currentUser?.fullName || "Trader"} />
                                <div className="flex flex-col justify-center">
                                    <p className="text-xs text-gray-500 dark:text-white/60 font-medium leading-none mb-1">Welcome Back,</p>
                                    <h3 className="text-lg text-gray-900 dark:text-white font-bold leading-none">{currentUser?.fullName || "Trader"}</h3>
                                </div>
                           </div>
                           <div className="pointer-events-auto"><NotificationBell onClick={handleNotificationClick} unreadCount={unreadCount} /></div>
                       </div>
                       <div className="w-full h-full overflow-y-auto custom-scrollbar px-6 pt-24 pb-24 z-20">
                           <div className="mb-8 mt-2">
                             <div className="relative w-full h-48 rounded-[32px] overflow-hidden border shadow-2xl transition-all duration-500 bg-[#0F0F0F] border-[#FFD700]/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                 <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                                     <div>
                                         <h2 className="text-4xl font-medium text-white tracking-tight mb-1">Remaining</h2>
                                         <div className="flex items-baseline gap-2">
                                            <h2 className="text-4xl font-medium tracking-tight text-[#FFD700]">Scans: <Infinity className="inline w-8 h-8 -mb-1" /></h2>
                                         </div>
                                         <p className="text-xs text-white/40 mt-1 font-medium">Total Scans: {totalScans}</p>
                                     </div>
                                     <div className="flex items-center gap-4 mt-auto">
                                         <button onClick={() => setActiveTab('scan')} className="flex-1 h-12 bg-white text-black rounded-2xl flex items-center justify-center gap-2 font-semibold active:scale-95 transition-all"><Camera className="w-5 h-5" /><span>Scan Chart</span></button>
                                         <button onClick={() => setActiveTab('history')} className="flex-1 h-12 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-medium active:scale-95 transition-all"><Clock className="w-5 h-5" /><span>History</span></button>
                                     </div>
                                 </div>
                             </div>
                           </div>
                           <div className="flex flex-col">
                               <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white/90">Recent Scans</h3>
                               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-6 px-6">
                                   {scanHistory.length === 0 ? (
                                       <div className="w-full flex items-center justify-center p-8 text-gray-400 dark:text-white/30 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10"><p>No recent scans</p></div>
                                   ) : (
                                       scanHistory.slice(0, 5).map((item, idx) => (
                                            <CryptoCard key={item.id || idx} symbol={item.symbol} name={item.name} pattern={item.pattern} score={item.score} color={item.trend === 'Bullish' ? 'green' : 'red'} graphPath={item.graphPath} onClick={() => handleHistoryItemClick(item)} />
                                       ))
                                   )}
                               </div>
                           </div>
                        </div>
                    </div>
                  )}

                  {activeTab === 'scan' && (<ScanView onUploadClick={triggerFileInput} onCameraClick={startCamera} onNotificationClick={handleNotificationClick} unreadCount={unreadCount} isPro={true} userImage={currentUser?.profileImage} currentPlan="lifetime" name={currentUser?.fullName || "Trader"} />)}
                  {activeTab === 'history' && (<HistoryView history={scanHistory} onNotificationClick={handleNotificationClick} unreadCount={unreadCount} onHistoryItemClick={handleHistoryItemClick} onDeleteItem={handleDeleteHistoryItem} isPro={true} userImage={currentUser?.profileImage} currentPlan="lifetime" name={currentUser?.fullName || "Trader"} />)}
                  {activeTab === 'subscription' && (<SubscriptionView onNotificationClick={handleNotificationClick} unreadCount={unreadCount} isPro={true} userImage={currentUser?.profileImage} currentPlan="lifetime" name={currentUser?.fullName || "Trader"} />)}
                  {activeTab === 'profile' && (
                    <>
                        {profileSubView === 'main' ? (
                            <ProfileView user={currentUser} onBack={() => setActiveTab('home')} onUpdateName={handleUpdateName} onUpdateImage={handleProfileImageUpload} onRemoveImage={handleRemoveProfileImage} onNotificationClick={handleNotificationClick} unreadCount={unreadCount} isPro={true} onSettingsClick={() => setProfileSubView('settings')} currentPlan="lifetime" />
                        ) : (
                            <SettingsView onBack={() => setProfileSubView('main')} theme={theme} toggleTheme={toggleTheme} userEmail={currentUser?.email} />
                        )}
                    </>
                  )}

                  <div className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[32px] shadow-2xl flex items-center justify-around px-2 z-50">
                      <div onClick={() => setActiveTab('home')} className="flex items-center justify-center w-14 h-14 cursor-pointer"><Home className={`w-6 h-6 transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-400 dark:text-white/40'}`} /></div>
                      <div onClick={() => setActiveTab('history')} className="flex items-center justify-center w-14 h-14 cursor-pointer"><Clock className={`w-6 h-6 transition-colors ${activeTab === 'history' ? 'text-blue-500' : 'text-gray-400 dark:text-white/40'}`} /></div>
                      <div onClick={() => setActiveTab('scan')} className="flex items-center justify-center w-14 h-14 cursor-pointer"><ScanLine className={`w-6 h-6 transition-colors ${activeTab === 'scan' ? 'text-blue-600' : 'text-gray-400 dark:text-white/40'}`} /></div>
                      <div onClick={() => setActiveTab('subscription')} className="flex items-center justify-center w-14 h-14 cursor-pointer"><Crown className={`w-6 h-6 transition-colors ${activeTab === 'subscription' ? 'text-blue-500' : 'text-gray-400 dark:text-white/40'}`} /></div>
                      <div onClick={() => { setActiveTab('profile'); setProfileSubView('main'); }} className="flex items-center justify-center w-14 h-14 cursor-pointer"><User className={`w-6 h-6 transition-colors ${activeTab === 'profile' ? 'text-green-500' : 'text-gray-400 dark:text-white/40'}`} /></div>
                  </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full w-full bg-[#050505] text-white backdrop-blur-3xl overflow-hidden relative font-sans">
             <div className="absolute top-0 left-0 right-0 z-50 pt-8 px-6 flex items-center justify-between">
                 <button onClick={resetApp} className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20"><ArrowLeft className="w-5 h-5 text-white" /></button>
            </div>
            <div className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar p-4 pt-24 pb-8 space-y-4">
                {analyzing ? (
                     <div className="flex flex-col items-center justify-center h-full w-full p-6">
                        <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
                            {selectedImage && <img src={selectedImage} className="w-full h-full object-cover opacity-50 blur-[2px]" alt="Analyzing" />}
                            <div className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)] z-20 animate-scan-vertical" />
                            <CandleJumpGame />
                        </div>
                        <div className="mt-8 text-center space-y-3">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3 justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" />Analyzing...</h3>
                            <p className="text-gray-400 text-sm font-medium animate-pulse">Detecting market structure & patterns</p>
                        </div>
                    </div>
                ) : result ? (
                   <>
                    <div 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverData(null)}
                        className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F0F11]/60 cursor-crosshair group"
                    >
                        {selectedImage && <img src={selectedImage} alt="Analyzed Chart" className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-75" />}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-md flex items-center gap-2"> <Crosshair className="w-3 h-3 text-blue-400" /> <span className="text-xs font-semibold text-white">{result.detected_pattern}</span> </div>
                        
                        {/* Tooltip Overlay */}
                        {hoverData && (
                            <div 
                                className="fixed z-[150] pointer-events-none bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-lg shadow-2xl flex flex-col gap-1 min-w-[120px] animate-scale-in"
                                style={{ top: tooltipPos.y + 15, left: tooltipPos.x + 15 }}
                            >
                                <div className="flex justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-500">O:</span>
                                    <span className="text-[11px] font-mono text-white">{hoverData.o}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-500">H:</span>
                                    <span className="text-[11px] font-mono text-green-400">{hoverData.h}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-500">L:</span>
                                    <span className="text-[11px] font-mono text-red-400">{hoverData.l}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-500">C:</span>
                                    <span className="text-[11px] font-mono text-white">{hoverData.c}</span>
                                </div>
                                <div className="mt-1 pt-1 border-t border-white/10 flex justify-between gap-4">
                                    <span className="text-[10px] font-bold text-blue-500">VOL:</span>
                                    <span className="text-[10px] font-mono text-blue-200">{hoverData.v}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Gauge className="w-5 h-5 text-white" /></div>
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Market Bias</span>
                                <span className="text-sm font-bold text-white">{result.market_bias || "Neutral Structure"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#121214]/60 backdrop-blur-md border border-white/5 rounded-xl p-4"> 
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Market Context</h3> 
                        <p className="text-sm text-gray-300 font-medium">{result.analysis_summary}</p> 
                    </div>
                    <div className="grid grid-cols-2 gap-3"> 
                        <div className="bg-[#1A1A1D] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center"> 
                            <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Direction</span> 
                            <div className={`flex items-center gap-1 font-bold ${result.direction === 'Bullish' ? 'text-green-400' : 'text-red-400'}`}> {result.direction} </div> 
                        </div> 
                        <div className="bg-[#1A1A1D] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center"> 
                            <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">Win Rate</span> 
                            <span className="text-white font-bold">{result.trade_setup?.win_rate_simulation || "N/A"}</span> 
                        </div> 
                    </div>
                    <div className="bg-[#161618] border border-white/10 rounded-xl p-4"> 
                        <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /><h3 className="text-sm font-bold text-white uppercase">The Setup</h3></div> 
                        <div className="space-y-4"> 
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex flex-col"> 
                                <span className="text-[10px] text-blue-300 font-bold uppercase">Entry Zone</span> 
                                <span className="text-xl font-mono text-white tracking-tight">{result.trade_setup.suggested_entry}</span> 
                            </div> 
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col"> 
                                <span className="text-[10px] text-red-300 font-bold uppercase block mb-1">Stop Loss</span> 
                                <div className="flex justify-between items-end">
                                    <span className="text-lg font-mono text-white">{result.trade_setup.stop_loss}</span>
                                    <span className="text-[10px] text-red-200/60 max-w-[60%] text-right leading-tight">{result.trade_setup.stop_loss_logic || "Invalidation Level"}</span>
                                </div>
                            </div> 
                            <div className="space-y-2"> 
                                <div className="flex justify-between items-center p-2 rounded-lg bg-green-900/10 border border-green-500/20"> 
                                    <span className="text-xs text-green-400 font-bold">TP 1 (Safe)</span> 
                                    <span className="text-sm font-mono text-white">{result.trade_setup.target_1}</span> 
                                </div> 
                                <div className="flex justify-between items-center p-2 rounded-lg bg-green-900/10 border border-green-500/20"> 
                                    <span className="text-xs text-green-400 font-bold">TP 2 (Aggressive)</span> 
                                    <span className="text-sm font-mono text-white">{result.trade_setup.target_2}</span> 
                                </div> 
                            </div> 
                        </div> 
                    </div>
                    <div className="bg-[#1A1A1D] border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3"><BrainCircuit className="w-4 h-4 text-purple-400" /><h3 className="text-xs font-bold text-purple-400 uppercase">Why This Works</h3></div>
                        <p className="text-sm text-gray-300 leading-relaxed">{result.why_this_works || "Aligns with market structure and institutional flow."}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-[#1A1A1D] border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1"><Shield className="w-3 h-3 text-blue-400" /><span className="text-[10px] font-bold text-gray-500 uppercase">Leverage</span></div>
                            <span className="text-sm font-mono text-white">{result.risk_shield?.recommended_leverage || "2x-5x"}</span>
                        </div>
                        <div className="flex-1 bg-[#1A1A1D] border border-white/5 rounded-xl p-3">
                            <div className="flex items-center gap-1.5 mb-1"><AlertCircle className="w-3 h-3 text-blue-400" /><span className="text-[10px] font-bold text-gray-500 uppercase">Risk</span></div>
                            <span className="text-sm font-mono text-white">{result.risk_shield?.risk_per_trade || "1-2%"}</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-xs font-bold text-blue-500 uppercase mb-1">Insider Tip</h3>
                                <p className="text-sm text-gray-300 leading-snug">{result.insider_tip || "Watch for volume confirmation before entry."}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#121214]/60 backdrop-blur-md border border-white/5 rounded-xl p-4"> 
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Micro Insights</h3> 
                        <ul className="space-y-3"> 
                            {result.micro_insights.map((insight, i) => ( 
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-3"> 
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /> 
                                    {insight} 
                                </li> 
                            ))} 
                        </ul> 
                    </div>
                     {selectedImage && <ChatInterface base64Image={selectedImage} mimeType="image/jpeg" />}
                     <button onClick={resetApp} className="w-full h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center gap-2 text-white font-medium hover:bg-white/20 transition-all mt-4 mb-6"> Scan another chart <ArrowRight className="w-4 h-4" /> </button>
                     <div className="w-full py-2 bg-white/5 border-t border-b border-white/5 backdrop-blur-sm overflow-hidden"> <div className="animate-marquee whitespace-nowrap"> <span className="text-xs font-medium text-white/70 mx-4"> DISCLAIMER: Educational purpose only. Trading involves risk. </span> </div> </div>
                   </>
                ) : null}
            </div>
          </div>
        )}
      </main>

      {/* CAMERA OVERLAY */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          <div className="absolute top-10 left-6 right-6 flex justify-between items-center z-50">
            <button onClick={stopCamera} className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[2px] border-white/20 m-12 rounded-[40px] pointer-events-none flex items-center justify-center">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-white/20 rounded-full mt-4" />
               <div className="w-64 h-64 border border-dashed border-white/40 rounded-3xl" />
            </div>
          </div>
          <div className="h-40 bg-black flex items-center justify-center px-12">
            <button onClick={captureImage} className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-1 group active:scale-90 transition-transform"><div className="w-full h-full rounded-full border-2 border-black/10 flex items-center justify-center"><div className="w-14 h-14 rounded-full bg-white border border-gray-200" /></div></button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for LineChart as lucide-react name differs
const LineChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export default App;
