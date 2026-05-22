import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { getAvatarColor } from '../utils/format';

interface Props {
  users: Array<{ id: string; username: string }>;
  creatorId?: string;
}

export default function UserList({ users, creatorId }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-navy-700/50">
        <h3 className="font-display font-semibold text-sm text-gray-300 uppercase tracking-wider">
          Online — {users.length}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-navy-700/50 transition-colors"
          >
            <div className="relative">
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-[10px] font-bold text-white`}
              >
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-navy-800" />
            </div>
            <span className="text-sm text-gray-300 font-medium truncate">{user.username}</span>
            {user.id === creatorId && (
              <span title="Room creator" className="flex-shrink-0">
                <Crown size={14} className="text-yellow-500" />
              </span>
            )}
          </motion.div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-gray-600 text-center py-8">No users online</p>
        )}
      </div>
    </div>
  );
}
