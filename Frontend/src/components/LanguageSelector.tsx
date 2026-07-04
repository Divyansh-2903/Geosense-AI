import React, { useState, useRef, useEffect } from 'react';
import { Globe, Search, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSelectorProps {
  theme?: 'dark' | 'light';
}

export default function LanguageSelector({ theme = 'dark' }: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, languages, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter languages based on search query
  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard handler for accessibility
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Theme-specific styles
  const btnStyles = theme === 'dark'
    ? 'bg-white/[0.04] hover:bg-white/[0.08] text-white border-white/10'
    : 'bg-brand-bg hover:bg-brand-gray-light text-brand-forest border-brand-gray-light/80';

  const menuStyles = theme === 'dark'
    ? 'bg-[#041407]/95 border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
    : 'bg-white border-brand-gray-light text-brand-forest shadow-[0_10px_30px_rgba(0,0,0,0.15)]';

  const searchInputStyles = theme === 'dark'
    ? 'bg-white/[0.06] border-white/10 text-white placeholder-white/40 focus:border-[#cff068]/50'
    : 'bg-brand-bg border-brand-gray-light text-brand-forest placeholder-brand-gray-dark/50 focus:border-brand-forest';

  const itemHoverStyles = theme === 'dark'
    ? 'hover:bg-white/[0.05]'
    : 'hover:bg-brand-bg';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer outline-none focus:ring-1 focus:ring-[#cff068]/30 ${btnStyles} ${
          isTranslating ? 'animate-pulse opacity-85' : ''
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
        <span>{activeLanguage.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 mt-2.5 w-64 rounded-2xl border backdrop-blur-xl p-3 z-[999] flex flex-col max-h-[380px] overflow-hidden transform origin-top-right transition-all duration-200 animate-fade-in ${menuStyles}`}
          role="menu"
        >
          {/* Search box */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-brand-gray-dark/50" />
            <input
              type="text"
              placeholder="Search language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs rounded-lg pl-8 pr-3 py-2 outline-none border transition-all ${searchInputStyles}`}
              autoFocus
            />
          </div>

          {/* Language list */}
          <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar pr-1 max-h-[280px]">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors font-medium cursor-pointer ${itemHoverStyles} ${
                    currentLanguage === lang.code 
                      ? 'text-[#cff068] font-bold bg-[#cff068]/10' 
                      : ''
                  }`}
                  role="menuitem"
                >
                  <span className="flex flex-col">
                    <span className="font-bold">{lang.nativeName}</span>
                    {lang.code !== 'en' && (
                      <span className="text-[10px] opacity-60 font-normal mt-0.5">
                        {lang.name}
                      </span>
                    )}
                  </span>
                  {currentLanguage === lang.code && (
                    <Check className="w-3.5 h-3.5 text-[#cff068] stroke-[3]" />
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-xs opacity-50">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
