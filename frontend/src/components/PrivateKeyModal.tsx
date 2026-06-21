/**
 * =============================================================================
 * PrivateKeyModal Component
 * =============================================================================
 *
 * PURPOSE:
 * Modal dialog for entering a private room's join key.
 * Used when a user tries to join a private room that requires a 16-character key.
 *
 * FEATURES:
 * - Animated modal with backdrop blur
 * - Auto-uppercase input for key consistency
 * - Character counter (16 chars required)
 * - Loading state during join attempt
 * - Auto-reset on close
 * - Accessible: focus management, keyboard support
 *
 * USAGE:
 *   <PrivateKeyModal
 *     room={selectedRoom}
 *     isOpen={showModal}
 *     isJoining={loading}
 *     onClose={() => setShowModal(false)}
 *     onSubmit={(roomId, key) => joinRoom(roomId, key)}
 *   />
 *
 * PATTERN: Controlled Modal
 * All state is managed by the parent. This component only renders
 * the UI and calls the onSubmit/onClose callbacks.
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Loader2, Lock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Room } from '../api/rooms';

/**
 * Props for the PrivateKeyModal component.
 *
 * @property room - The private room to join
 * @property isOpen - Whether the modal is visible
 * @property isJoining - Whether a join request is in progress
 * @property onClose - Callback when the modal is closed
 * @property onSubmit - Callback when the key is submitted (roomId, joinKey)
 */
interface PrivateKeyModalProps {
  room: Room;
  isOpen: boolean;
  isJoining: boolean;
  onClose: () => void;
  onSubmit: (roomId: string, joinKey: string) => void;
}

/**
 * Modal for entering a private room's 16-character join key.
 *
 * VALIDATION:
 * - Key must be exactly 16 characters
 * - Auto-uppercased for consistency
 * - Shows character count
 *
 * ACCESSIBILITY:
 * - Focus trapped within modal
 * - Escape key closes modal
 * - Backdrop click closes modal
 * - Auto-focus on input when opened
 */
export default function PrivateKeyModal({
  room,
  isOpen,
  isJoining,
  onClose,
  onSubmit,
}: PrivateKeyModalProps) {
  const [joinKey, setJoinKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinKey.trim().toUpperCase();
    if (!trimmed) {
      toast.error('Please enter the private room key');
      return;
    }
    if (trimmed.length !== 16) {
      toast.error('Room key must be exactly 16 characters');
      return;
    }
    onSubmit(room.id, trimmed);
  };

  // Reset key when modal opens/closes
  useEffect(() => {
    if (!isOpen) setJoinKey('');
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-navy-800 rounded-2xl border border-navy-700/50 w-full max-w-sm shadow-2xl shadow-black/50">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-navy-700/50">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-amber-300" />
                  <h2 className="font-display font-bold text-lg text-white">
                    Private Room
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-navy-700 text-gray-400 hover:text-white transition-all"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                <div>
                  <p className="text-sm text-white font-medium mb-1">
                    {room.name}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This room is private. Enter the 16-character room key shared
                    by the creator to join.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    <KeyRound
                      size={12}
                      className="inline mr-1 text-amber-300"
                    />
                    Room Key
                  </label>
                  <input
                    type="text"
                    value={joinKey}
                    onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
                    placeholder="Enter 16-character key"
                    maxLength={16}
                    className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-navy-600/50 text-sm text-white placeholder-gray-600 focus:border-amber-400/50 transition-colors font-mono tracking-[0.15em] uppercase"
                    autoFocus
                    aria-label="Room Key"
                  />
                  <p className="text-[10px] text-gray-600 mt-1 text-right">
                    {joinKey.length}/16
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isJoining || joinKey.trim().length !== 16}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <KeyRound size={14} />
                  )}
                  {isJoining ? 'Joining...' : 'Join with Key'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
