import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { getErrorMessage } from '../utils/errors';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      toast.success('If an account exists, a reset link has been sent');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send reset link'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),#0d0f1a] p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-navy-700/70 bg-navy-900/90 p-10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold gradient-text mb-2">Reset Password</h1>
          <p className="text-sm text-gray-400">
            {sent
              ? 'Check your email (or console) for the reset link'
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                className="w-full rounded-xl border border-navy-700/70 bg-navy-800/90 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon-purple/50 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-neon-purple/20 bg-neon-purple/10 p-4 text-center">
            <p className="mb-1 text-2xl">📧</p>
            <p className="text-sm text-white">
              If an account with <strong>{email}</strong> exists, you&apos;ll receive a reset link shortly.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Tip: If SMTP isn&apos;t configured, check the backend console for the reset URL
            </p>
          </div>
        )}

        <div className="mt-6 border-t border-navy-700/60 pt-4 text-center">
          <Link to="/login" className="text-sm font-medium text-neon-purple hover:text-neon-purple/80 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
