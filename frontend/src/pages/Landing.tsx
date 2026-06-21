import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Brain, Zap, Shield, Globe, ArrowRight, Sparkles, Bot, Code, Lightbulb, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useTranslation } from '../i18n';

// Interactive typing demo that cycles through example prompts
const demoPrompts = [
  "Explain how transformers work in deep learning",
  "Write a React hook for debouncing",
  "What are the SOLID principles?",
  "Design a REST API for a todo app",
];

function TypingDemo() {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const prompt = demoPrompts[currentPrompt];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= prompt.length) {
        setDisplayText(prompt.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setIsTyping(true);
          setCurrentPrompt((prev) => (prev + 1) % demoPrompts.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentPrompt]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-navy-700/60 bg-navy-900/60 px-3 py-2.5">
      <p className="text-sm text-gray-400 flex-1">
        {displayText}
        <span className={`inline-block w-0.5 h-4 bg-neon-purple ml-0.5 ${isTyping ? 'animate-pulse' : 'opacity-0'}`} />
      </p>
    </div>
  );
}

// Stats counter animation
function AnimatedStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-3xl font-bold gradient-text">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}

const FEATURE_KEYS = [
  { icon: Brain, titleKey: 'landing.featureDeepReasoning', descKey: 'landing.featureDeepReasoningDesc', gradient: 'from-purple-500/20 to-blue-500/20' },
  { icon: MessageSquare, titleKey: 'landing.featureSoloChat', descKey: 'landing.featureSoloChatDesc', gradient: 'from-blue-500/20 to-cyan-500/20' },
  { icon: Users, titleKey: 'landing.featureGroupRooms', descKey: 'landing.featureGroupRoomsDesc', gradient: 'from-cyan-500/20 to-emerald-500/20' },
  { icon: Zap, titleKey: 'landing.featureRealtime', descKey: 'landing.featureRealtimeDesc', gradient: 'from-yellow-500/20 to-orange-500/20' },
  { icon: Shield, titleKey: 'landing.featureSecureAuth', descKey: 'landing.featureSecureAuthDesc', gradient: 'from-emerald-500/20 to-teal-500/20' },
  { icon: Globe, titleKey: 'landing.featureMultiProvider', descKey: 'landing.featureMultiProviderDesc', gradient: 'from-pink-500/20 to-purple-500/20' },
  { icon: Bot, titleKey: 'landing.featureAiMemory', descKey: 'landing.featureAiMemoryDesc', gradient: 'from-violet-500/20 to-fuchsia-500/20' },
  { icon: Code, titleKey: 'landing.featureCodeHighlight', descKey: 'landing.featureCodeHighlightDesc', gradient: 'from-amber-500/20 to-red-500/20' },
  { icon: Lightbulb, titleKey: 'landing.featureSmartReplies', descKey: 'landing.featureSmartRepliesDesc', gradient: 'from-lime-500/20 to-green-500/20' },
];

export default function Landing() {
  const { t } = useTranslation();
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
              {t('landing.badge')}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              {t('landing.heroTitle1')}
              <br />
              <span className="gradient-text">{t('landing.heroTitle2')}</span>
            </h1>

            <p className="mt-6 text-gray-400 max-w-xl text-lg leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/register"
                className="group px-6 py-3.5 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
              >
                {t('landing.getStarted')}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 border border-navy-700/60 text-gray-300 rounded-xl font-medium hover:border-neon-purple/30 hover:text-white transition-all"
              >
                {t('landing.signIn')}
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('landing.openSource')}
              </div>
              <div>{t('landing.mongoBacked')}</div>
              <div>{t('landing.socketRealtime')}</div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              <AnimatedStat value={6} label={t('landing.aiProviders')} suffix="+" />
              <AnimatedStat value={50} label={t('landing.aiModels')} suffix="+" />
              <AnimatedStat value={100} label={t('landing.features')} suffix="+" />
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

              {/* Interactive typing demo */}
              <div className="mt-4">
                <TypingDemo />
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon-purple font-semibold mb-3">{t('landing.capabilitiesLabel')}</p>
            <h2 className="text-3xl text-white font-bold">
              {t('landing.capabilitiesTitle')}
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              {t('landing.capabilitiesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURE_KEYS.map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className={`group p-5 border border-navy-700/50 rounded-xl bg-gradient-to-br ${f.gradient} backdrop-blur-sm hover:border-neon-purple/30 transition-all duration-300`}
              >
                <div className="w-9 h-9 rounded-lg bg-navy-800/80 border border-navy-700/50 flex items-center justify-center mb-4 group-hover:border-neon-purple/30 transition-colors">
                  <f.icon className="text-gray-300 group-hover:text-neon-purple transition-colors" size={18} />
                </div>
                <h3 className="text-white font-semibold mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{t(f.descKey)}</p>
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-neon-blue font-semibold mb-3">{t('landing.gettingStartedLabel')}</p>
          <h2 className="text-3xl text-white font-bold mb-12">
            {t('landing.gettingStartedTitle')}
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '01', titleKey: 'landing.step1Title', descKey: 'landing.step1Desc' },
              { step: '02', titleKey: 'landing.step2Title', descKey: 'landing.step2Desc' },
              { step: '03', titleKey: 'landing.step3Title', descKey: 'landing.step3Desc' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="p-5 rounded-xl border border-navy-700/50 bg-navy-800/40"
              >
                <div className="text-4xl font-bold gradient-text mb-3">{item.step}</div>
                <h3 className="text-white font-semibold mb-1">{t(item.titleKey)}</h3>
                <p className="text-sm text-gray-500">{t(item.descKey)}</p>
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
          <h2 className="text-3xl font-bold text-white mb-4">{t('landing.ctaTitle')}</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            {t('landing.ctaSubtitle')}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all text-lg"
          >
            {t('landing.ctaButton')}
            <ArrowRight size={18} />
          </Link>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-navy-700/30">
        <p className="text-xs text-gray-600">
          {t('landing.footerText', { year: new Date().getFullYear() })}
        </p>
      </footer>
    </div>
  );
}
