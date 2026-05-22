import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, Users, Search, TrendingUp,
  ArrowRight, Clock, Zap, Brain, Globe, FolderKanban,
  Activity, Shield, Tag, Stethoscope, Heart, FileText,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { fetchDashboard } from '../api/dashboard';
import type { DashboardData } from '../api/dashboard';
import { formatRelativeTime } from '../utils/format';

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="p-4 rounded-xl bg-navy-800/60 border border-navy-700/50 hover:border-navy-600/80 hover:bg-navy-800/80 transition-all duration-200 backdrop-blur-sm"
    >
      <div className="mb-2">
        <Icon size={14} className="text-gray-500" />
      </div>
      <p className="text-xl font-semibold text-white tabular-nums">{value.toLocaleString()}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchDashboard();
        setData(result);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };


  const topTags = Array.from(
    new Set((data?.recentRooms || []).flatMap((room) => room.tags))
  ).slice(0, 4);

  const adminRooms = (data?.recentRooms || []).filter(
    (room) => room.currentUserRole === 'creator' || room.currentUserRole === 'admin'
  );

  const clinicalTone = !data
    ? 'Loading clinical workspace...'
    : data.stats.totalRooms >= 4
    ? 'Active multi-department collaboration with steady patient case flow.'
    : data.stats.totalConversations >= 5
    ? 'Balanced clinical consultations with AI-assisted diagnostics.'
    : 'Clinical workspace configured for focused patient care.';

  const analysisCards = data
    ? [
        {
          icon: Activity,
          title: 'Case Load',
          value:
            data.stats.messagesToday > 20
              ? 'High'
              : data.stats.messagesToday > 5
              ? 'Steady'
              : 'Light',
          text: `${data.stats.messagesToday} interactions today.`,
        },
        {
          icon: Shield,
          title: 'Departments',
          value: `${adminRooms.length}`,
          text:
            adminRooms.length > 0
              ? 'Departments under your supervision.'
              : 'Contributing as clinical staff.',
        },
        {
          icon: Tag,
          title: 'Specialty',
          value: topTags.length > 0 ? topTags[0] : '—',
          text:
            topTags.length > 0
              ? topTags.map((tag) => `#${tag}`).join(' · ')
              : 'No specialties tagged yet.',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-navy-900 relative overflow-hidden">
      <Navbar />

      {/* Gradient mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] animate-[drift1_18s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-[100px] animate-[drift2_22s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full bg-sky-500/6 blur-[110px] animate-[drift3_26s_ease-in-out_infinite]" />
      </div>

      <div className="flex min-h-screen pt-14">

        {/* ── LEFT PANEL ── */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-10 max-w-3xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <p className="text-sm text-gray-500 mb-1">{greeting()}, Doctor</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Clinical Command Center
            </h1>
            <p className="text-sm text-gray-400 mt-1.5">{clinicalTone}</p>
          </motion.div>

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-navy-800/50 border border-navy-700/30 animate-pulse" />
              ))}
            </div>
          ) : (
            data && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <StatCard icon={Stethoscope} label="Consultations" value={data.stats.totalConversations} delay={0.05} />
                <StatCard icon={Users} label="Patient Rooms" value={data.stats.totalRooms} delay={0.1} />
                <StatCard icon={Zap} label="Clinical Notes" value={data.stats.totalMessagesSent} delay={0.15} />
                <StatCard icon={TrendingUp} label="Today" value={data.stats.messagesToday} delay={0.2} />
              </div>
            )
          )}

          {/* Analysis Cards */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {analysisCards.map(({ icon: Icon, title, value, text }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
                  className="rounded-xl bg-navy-800/60 border border-navy-700/50 p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-navy-700/80">
                    <Icon size={13} className="text-gray-400" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600 font-medium mb-1">
                    {title}
                  </p>
                  <p className="text-lg font-semibold text-white mb-1">{value}</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{text}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3">
              Clinical Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { to: '/chat', icon: Stethoscope, label: 'Clinical AI Consult', sub: 'AI-assisted diagnosis and analysis' },
                { to: '/memory', icon: Brain, label: 'Medical Records', sub: 'Review and manage patient memory' },
                { to: '/search', icon: Search, label: 'Search Records', sub: 'Find across all clinical notes' },
                { to: '/projects', icon: FileText, label: 'Case Files', sub: 'Persistent patient case workspaces' },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-navy-800/60 border border-navy-700/50 hover:border-navy-600/80 hover:bg-navy-800/80 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-navy-700/80 flex items-center justify-center flex-shrink-0 group-hover:bg-navy-600/80 transition-colors">
                    <Icon size={13} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 leading-tight">{label}</p>
                    <p className="text-[11px] text-gray-500 truncate">{sub}</p>
                  </div>
                  <ArrowRight size={12} className="text-navy-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity + Rooms row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
                <Clock size={11} />
                Recent Clinical Activity
              </h2>
              <div className="bg-navy-800/60 rounded-xl border border-navy-700/50 p-3 space-y-0.5 max-h-72 overflow-y-auto backdrop-blur-sm">
                {!data || data.activity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-600 mt-1">Begin a clinical consultation to see activity here</p>
                  </div>
                ) : (
                  data.activity.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-navy-700/40 transition-colors"
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${item.type === 'ai_response' ? 'bg-navy-600' : 'bg-navy-700'}`}>
                        <MessageSquare size={10} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate">{item.content}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.roomName && (
                            <span className="text-[10px] text-gray-500">#{item.roomName}</span>
                          )}
                          <span className="text-[10px] text-gray-600">{formatRelativeTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
            >
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-600 mb-3 flex items-center gap-1.5">
                <FileText size={11} />
                Quick Links
              </h2>
              <div className="bg-navy-800/60 rounded-xl border border-navy-700/50 p-3 space-y-2 backdrop-blur-sm">
                <Link to="/projects" className="group flex items-center gap-3 p-2.5 rounded-lg bg-navy-700/30 border border-navy-700/40 hover:border-navy-600/60 hover:bg-navy-700/50 transition-all">
                  <FolderKanban size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">Open Case Files</p>
                    <p className="text-[10px] text-gray-500">Manage patient case workspaces</p>
                  </div>
                  <ArrowRight size={11} className="text-navy-600 group-hover:text-gray-400 transition-all flex-shrink-0" />
                </Link>
                <Link to="/export" className="group flex items-center gap-3 p-2.5 rounded-lg bg-navy-700/30 border border-navy-700/40 hover:border-navy-600/60 hover:bg-navy-700/50 transition-all">
                  <Globe size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">Export Records</p>
                    <p className="text-[10px] text-gray-500">Download consultation history</p>
                  </div>
                  <ArrowRight size={11} className="text-navy-600 group-hover:text-gray-400 transition-all flex-shrink-0" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Keyboard shortcuts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex items-center gap-5 text-[11px] text-gray-600"
          >
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-navy-800 border border-navy-700 text-gray-500">Ctrl+K</kbd>
              New consultation
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-navy-800 border border-navy-700 text-gray-500">Ctrl+/</kbd>
              Search records
            </span>
          </motion.div>
        </main>

        {/* ── RIGHT PANEL ── */}
        <aside className="hidden lg:flex w-[42%] xl:w-[45%] sticky top-14 h-[calc(100vh-3.5rem)] flex-col items-center justify-center border-l border-navy-700/40 bg-navy-800/20 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center gap-6 text-center px-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-navy-600/40 flex items-center justify-center">
              <Activity size={36} className="text-neon-purple" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-2">ChatSphere</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                AI-powered clinical intelligence platform for healthcare professionals. 
                Smarter diagnoses, faster insights, better patient outcomes.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { icon: Stethoscope, label: 'Diagnosis' },
                { icon: Heart, label: 'Patient Care' },
                { icon: FileText, label: 'Records' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-navy-700/60 border border-navy-600/40 flex items-center justify-center">
                    <Icon size={16} className="text-gray-400" />
                  </div>
                  <span className="text-[10px] text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
