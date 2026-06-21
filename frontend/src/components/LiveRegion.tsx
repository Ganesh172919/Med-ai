/**
 * =============================================================================
 * LiveRegion Component
 * =============================================================================
 *
 * PURPOSE:
 * Provides ARIA live regions for announcing dynamic content changes to
 * screen readers. Essential for chat applications where messages appear
 * dynamically without page navigation.
 *
 * WHY THIS EXISTS:
 * Screen readers only announce content that changes in the DOM if those
 * changes are in an ARIA live region. Without this, screen reader users
 * would not know when new messages arrive, when users join/leave, or
 * when AI responses complete.
 *
 * USAGE:
 *   <LiveRegion>
 *     {announcement}
 *   </LiveRegion>
 *
 *   // Or for chat messages:
 *   <ChatAnnouncer newMessage={latestMessage} />
 *
 * ARIA LIVE REGION LEVELS:
 * - polite: Waits for user to finish current task before announcing
 * - assertive: Interrupts current task to announce immediately
 *
 * WHEN TO USE EACH:
 * - polite: New messages, typing indicators, status changes
 * - assertive: Errors, important alerts, connection lost
 *
 * ACCESSIBILITY STANDARDS:
 * - WCAG 2.1 Level A: Status Messages (4.1.3)
 * - WCAG 2.1 Level AA: Name, Role, Value (4.1.2)
 *
 * LEARNING NOTES:
 * - Live regions must be in the DOM BEFORE content changes
 * - Screen readers poll live regions for changes
 * - role="status" is equivalent to aria-live="polite"
 * - role="alert" is equivalent to aria-live="assertive"
 * - aria-atomic="true" announces entire region, not just changes
 * =============================================================================
 */

import { useEffect, useState } from 'react';

/**
 * Props for LiveRegion component.
 *
 * @property children - Text content to announce
 * @property level - ARIA live level: 'polite' or 'assertive'
 * @property atomic - Whether to announce entire region or just changes
 */
interface LiveRegionProps {
  children: string;
  level?: 'polite' | 'assertive';
  atomic?: boolean;
}

/**
 * ARIA live region for screen reader announcements.
 *
 * PATTERN: Visually hidden but accessible
 * The region is positioned off-screen so sighted users don't see it,
 * but screen readers can announce its content.
 *
 * WHY sr-only CLASS:
 * Tailwind's sr-only class positions content off-screen while keeping
 * it accessible to assistive technology. This is the standard pattern
 * for visually hidden but accessible content.
 *
 * @param children - Text to announce to screen readers
 * @param level - Announcement priority level
 * @param atomic - Whether to announce entire region
 */
export default function LiveRegion({
  children,
  level = 'polite',
  atomic = true,
}: LiveRegionProps) {
  return (
    <div
      role={level === 'assertive' ? 'alert' : 'status'}
      aria-live={level}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * Chat message announcer for screen readers.
 *
 * PURPOSE:
 * Announces new chat messages to screen reader users with context about
 * who sent the message and whether it's from AI.
 *
 * USAGE:
 *   <ChatAnnouncer newMessage={latestMessage} />
 *
 * ANNOUNCEMENT FORMAT:
 * - User message: "John said: Hello everyone"
 * - AI message: "AI Assistant said: Here's the answer"
 * - System message: "User joined the room"
 *
 * WHY DEDICATED COMPONENT:
 * Chat messages need special formatting for screen readers:
 * - Include sender name
 * - Distinguish AI from human messages
 * - Handle message updates (edits)
 * - Clear announcements after a delay
 *
 * @param newMessage - The latest message to announce
 */
interface ChatMessage {
  username: string;
  content: string;
  isAI?: boolean;
  isSystem?: boolean;
}

interface ChatAnnouncerProps {
  newMessage: ChatMessage | null;
}

export function ChatAnnouncer({ newMessage }: ChatAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!newMessage) {
      setAnnouncement('');
      return;
    }

    let text = '';

    if (newMessage.isSystem) {
      text = newMessage.content;
    } else if (newMessage.isAI) {
      text = `AI Assistant said: ${newMessage.content}`;
    } else {
      text = `${newMessage.username} said: ${newMessage.content}`;
    }

    // Truncate long messages for screen readers
    // Long announcements are disruptive and hard to follow
    if (text.length > 200) {
      text = `${text.slice(0, 200)}...`;
    }

    setAnnouncement(text);

    // Clear announcement after delay to allow re-announcement
    // of same content if user sends identical message
    const timer = setTimeout(() => setAnnouncement(''), 5000);
    return () => clearTimeout(timer);
  }, [newMessage]);

  if (!announcement) return null;

  return (
    <LiveRegion level="polite">
      {announcement}
    </LiveRegion>
  );
}

/**
 * Typing indicator announcer.
 *
 * PURPOSE:
 * Announces when users start/stop typing for screen reader users.
 *
 * USAGE:
 *   <TypingAnnouncer users={['Alice', 'Bob']} />
 *
 * ANNOUNCEMENT FORMAT:
 * - One user: "Alice is typing"
 * - Two users: "Alice and Bob are typing"
 * - Three+: "Alice and 2 others are typing"
 *
 * @param users - Array of usernames currently typing
 */
interface TypingAnnouncerProps {
  users: string[];
}

export function TypingAnnouncer({ users }: TypingAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (users.length === 0) {
      setAnnouncement('');
      return;
    }

    let text = '';

    if (users.length === 1) {
      text = `${users[0]} is typing`;
    } else if (users.length === 2) {
      text = `${users[0]} and ${users[1]} are typing`;
    } else {
      text = `${users[0]} and ${users.length - 1} others are typing`;
    }

    setAnnouncement(text);
  }, [users]);

  if (!announcement) return null;

  return (
    <LiveRegion level="polite">
      {announcement}
    </LiveRegion>
  );
}

/**
 * Connection status announcer.
 *
 * PURPOSE:
 * Announces connection state changes (connected, disconnected, reconnecting)
 * so screen reader users know when they can send messages.
 *
 * USAGE:
 *   <ConnectionAnnouncer status={connectionStatus} />
 *
 * @property status - Connection state: 'connected', 'disconnected', 'reconnecting'
 */
interface ConnectionAnnouncerProps {
  status: 'connected' | 'disconnected' | 'reconnecting';
}

export function ConnectionAnnouncer({ status }: ConnectionAnnouncerProps) {
  const messages = {
    connected: 'Connected to chat',
    disconnected: 'Disconnected from chat. Messages may not be sent.',
    reconnecting: 'Reconnecting to chat...',
  };

  // Connection issues are important - use assertive for disconnect
  const level = status === 'disconnected' ? 'assertive' : 'polite';

  return (
    <LiveRegion level={level}>
      {messages[status]}
    </LiveRegion>
  );
}
