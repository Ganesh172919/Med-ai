import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { getErrorMessage } from '../utils/errors';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error('Invalid or missing reset link. Please request a new one.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email, token, newPassword);
      toast.success(result.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),#0d0f1a] p-4">
        <div className="max-w-md text-center text-white">
          <p className="mb-4 text-5xl">⚠️</p>
          <h2 className="mb-2 font-display text-xl font-semibold">Invalid Reset Link</h2>
          <p className="mb-6 text-sm text-gray-400">
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-sm font-medium text-neon-purple hover:text-neon-purple/80 transition-colors">
            Request New Reset Link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_30%),#0d0f1a] p-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-navy-700/70 bg-navy-900/90 p-10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold gradient-text mb-2">Set New Password</h1>
          <p className="text-sm text-gray-400">
            Enter your new password for <strong className="text-neon-purple">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-400">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoFocus
              className="w-full rounded-xl border border-navy-700/70 bg-navy-800/90 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon-purple/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-400">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full rounded-xl border border-navy-700/70 bg-navy-800/90 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-neon-purple/50 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 border-t border-navy-700/60 pt-4 text-center">
          <Link to="/login" className="text-sm font-medium text-neon-purple hover:text-neon-purple/80 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
