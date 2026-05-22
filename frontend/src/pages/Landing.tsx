import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Brain, Zap, Shield, Globe, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: Brain,
    title: 'Deep Reasoning',
    description: 'A reasoning engine that breaks down problems, challenges assumptions, and thinks in multiple dimensions.',
    gradient: 'from-purple-500/20 to-blue-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Solo AI Chat',
    description: 'Private conversations with full markdown, code highlighting, and persistent history saved to MongoDB.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Users,
    title: 'Group Rooms',
    description: 'Create or join rooms and collaborate with AI via @ai mentions in real-time.',
    gradient: 'from-cyan-500/20 to-emerald-500/20',
  },
  {
    icon: Zap,
    title: 'Real-time Messaging',
    description: 'Instant messaging with Socket.IO — typing indicators, read receipts, and live updates.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    description: 'JWT access/refresh tokens plus Google OAuth. Password reset and admin controls built in.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: Globe,
    title: 'Multi-Provider AI',
    description: 'Supports OpenRouter, Gemini, Grok, Groq, Together AI, and Hugging Face. Pick your model.',
    gradient: 'from-pink-500/20 to-purple-500/20',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-neon-purple/8 blur-[150px] animate-float" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-neon-blue/6 blur-[130px] animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[130px] animate-float" style={{ animationDelay: '8s' }} />
      </div>

      <Navbar />

      {/* Hero */}
      <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-purple/20 bg-neon-purple/5 text-xs text-neon-purple mb-6">
              <Sparkles size={12} />
              Multi-provider AI gateway
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Think deeper.
              <br />
              <span className="gradient-text">Chat smarter.</span>
            </h1>

            <p className="mt-6 text-gray-400 max-w-xl text-lg leading-relaxed">
              A high-reasoning AI chat platform with solo conversations, collaborative group rooms, and real-time intelligence — powered by your choice of AI provider.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link 
                to="/register" 
                className="group px-6 py-3.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-6 py-3.5 border border-navy-700/60 text-gray-300 rounded-xl font-medium hover:border-neon-purple/30 hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Open Source
              </div>
              <div>MongoDB Backed</div>
              <div>Socket.IO Real-time</div>
            </div>
          </motion.div>

          {/* RIGHT — Chat Preview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 max-w-lg w-full"
          >
            <div className="rounded-2xl border border-navy-700/60 bg-navy-800/60 backdrop-blur-xl p-6 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center animate-pulse-glow">
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">ChatSphere AI</p>
                  <p className="text-[10px] text-gray-500">Multi-model reasoning engine</p>
                </div>
              </div>

              {/* Mock conversation */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 px-4 py-2.5 max-w-[80%]">
                    <p className="text-sm text-gray-200">Explain how transformers work in deep learning</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-navy-700/60 border border-navy-600/40 px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Transformers use <span className="text-neon-purple">self-attention</span> mechanisms to process all positions in a sequence simultaneously. Unlike RNNs, they capture long-range dependencies efficiently through…
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-500">
                      <span>Gemini Pro</span>
                      <span>·</span>
                      <span>347 tokens</span>
                      <span>·</span>
                      <span>1.2s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock input */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-navy-700/60 bg-navy-900/60 px-3 py-2.5">
                <p className="text-sm text-gray-600 flex-1">Ask anything…</p>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FEATURES */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-28"
        >
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon-purple font-semibold mb-3">Capabilities</p>
            <h2 className="text-3xl text-white font-bold">
              Everything you need to think clearly
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Built for developers, researchers, and teams who demand more from their AI conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className={`group p-5 border border-navy-700/50 rounded-xl bg-gradient-to-br ${f.gradient} backdrop-blur-sm hover:border-neon-purple/30 transition-all duration-300`}
              >
                <div className="w-9 h-9 rounded-lg bg-navy-800/80 border border-navy-700/50 flex items-center justify-center mb-4 group-hover:border-neon-purple/30 transition-colors">
                  <f.icon className="text-gray-300 group-hover:text-neon-purple transition-colors" size={18} />
                </div>
                <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* HOW IT WORKS */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-28 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon-blue font-semibold mb-3">Getting Started</p>
          <h2 className="text-3xl text-white font-bold mb-12">
            Three steps to smarter conversations
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with email or Google OAuth in seconds' },
              { step: '02', title: 'Start Chatting', desc: 'Pick an AI provider and model, then ask anything' },
              { step: '03', title: 'Collaborate', desc: 'Create rooms, invite teams, and use @ai mentions' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="p-5 rounded-xl border border-navy-700/50 bg-navy-800/40"
              >
                <div className="text-4xl font-bold gradient-text mb-3">{item.step}</div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-28 text-center rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-navy-800/40 to-neon-blue/10 p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to think deeper?</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Join ChatSphere and unlock multi-provider AI reasoning, group collaboration, and persistent memory — all in one platform.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all text-lg"
          >
            Start for Free
            <ArrowRight size={18} />
          </Link>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-navy-700/30">
        <p className="text-xs text-gray-600">
          ChatSphere © {new Date().getFullYear()} — AI-native chat platform
        </p>
      </footer>
    </div>
  );
}
