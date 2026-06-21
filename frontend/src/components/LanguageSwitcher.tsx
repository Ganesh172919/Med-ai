import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useTranslation, LOCALE_META, type Locale } from '../i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const locales = Object.entries(LOCALE_META) as [Locale, { label: string; flag: string }][];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-navy-700/50 transition-colors text-sm"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={14} />
        <span className="text-xs font-medium">{LOCALE_META[locale].flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-40 rounded-xl border border-navy-700/60 bg-navy-800/95 backdrop-blur-xl shadow-xl shadow-black/30 overflow-hidden z-50"
            role="listbox"
            aria-label="Select language"
          >
            {locales.map(([code, meta]) => (
              <button
                key={code}
                role="option"
                aria-selected={code === locale}
                onClick={() => { setLocale(code); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  code === locale
                    ? 'bg-neon-purple/15 text-neon-purple'
                    : 'text-gray-300 hover:bg-navy-700/50 hover:text-white'
                }`}
              >
                <span className="text-base">{meta.flag}</span>
                <span className="flex-1 text-left">{meta.label}</span>
                {code === locale && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
