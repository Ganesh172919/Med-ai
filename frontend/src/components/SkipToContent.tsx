/**
 * =============================================================================
 * SkipToContent Component
 * =============================================================================
 *
 * PURPOSE:
 * Provides a keyboard-accessible "Skip to main content" link that appears
 * when users press Tab on page load. This allows keyboard and screen reader
 * users to bypass navigation and jump directly to the main content.
 *
 * WHY THIS EXISTS:
 * Without a skip link, keyboard users must tab through every navigation link
 * on every page load before reaching the main content. This is a significant
 * accessibility barrier, especially for users with motor disabilities.
 *
 * USAGE:
 * Place this component at the very top of the app, before any navigation:
 *
 *   <SkipToContent />
 *   <Navbar />
 *   <main id="main-content">...</main>
 *
 * HOW IT WORKS:
 * 1. The link is visually hidden by default (off-screen position)
 * 2. When focused via Tab key, it becomes visible
 * 3. Clicking it scrolls to the element with id="main-content"
 * 4. The main content element should have tabIndex={-1} for focus
 *
 * ACCESSIBILITY STANDARDS:
 * - WCAG 2.1 Level A: Bypass Blocks (2.4.1)
 * - Required for WCAG AA compliance
 *
 * LEARNING NOTES:
 * - "Skip links" are a standard accessibility pattern
 * - They help all keyboard users, not just screen reader users
 * - The sr-only + focus-visible pattern is the modern approach
 * =============================================================================
 */

import { useCallback } from 'react';

/**
 * Skip-to-content link for keyboard navigation.
 *
 * PATTERN: Visually hidden until focused
 * - sr-only: Hides visually but keeps in DOM for screen readers
 * - focus:visible: Shows when focused via keyboard (not mouse)
 * - Absolute positioning prevents layout shift
 *
 * WHY NOT display:none:
 * display:none removes from tab order entirely. We want it in the tab order
 * but visually hidden until focused.
 */
export default function SkipToContent() {
  /**
   * Handle click on skip link.
   *
   * WHY MANUAL FOCUS:
   * Setting window.location.hash scrolls to the element, but doesn't move
   * focus. We manually focus the target element so keyboard users can
   * continue navigating from the main content.
   *
   * WHY tabIndex={-1}:
   * The main content element needs tabIndex={-1} to be programmatically
   * focusable. It won't appear in the tab order (users can't Tab to it),
   * but JavaScript can focus it.
   */
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById('main-content');
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="
        sr-only
        focus:not-sr-only
        focus:fixed
        focus:top-4
        focus:left-4
        focus:z-[100]
        focus:rounded-xl
        focus:bg-neon-purple
        focus:px-4
        focus:py-2
        focus:text-sm
        focus:font-medium
        focus:text-white
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-neon-purple/50
        focus:ring-offset-2
        focus:ring-offset-navy-900
      "
    >
      Skip to main content
    </a>
  );
}
