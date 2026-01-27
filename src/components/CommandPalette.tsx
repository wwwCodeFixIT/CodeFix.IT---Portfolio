import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

interface Command {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  category: string;
  categoryEn: string;
  action: () => void;
  shortcut?: string;
  adminOnly?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { language } = useLanguage();
  const { isAdmin, openLoginModal } = useAdmin();

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onClose();
  };

  const commands: Command[] = [
    // Nawigacja - 8 głównych sekcji
    { 
      id: 'home', 
      label: 'Przejdź do strony głównej', 
      labelEn: 'Go to homepage',
      icon: '🏠', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('hero'), 
      shortcut: 'G H' 
    },
    { 
      id: 'services', 
      label: 'Przejdź do usług', 
      labelEn: 'Go to services',
      icon: '⚡', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('uslugi'), 
      shortcut: 'G S' 
    },
    { 
      id: 'portfolio', 
      label: 'Przejdź do portfolio', 
      labelEn: 'Go to portfolio',
      icon: '💼', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('portfolio'), 
      shortcut: 'G P' 
    },
    { 
      id: 'technologies', 
      label: 'Przejdź do technologii', 
      labelEn: 'Go to technologies',
      icon: '🛠️', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('technologies'), 
      shortcut: 'G T' 
    },
    { 
      id: 'testimonials', 
      label: 'Przejdź do opinii', 
      labelEn: 'Go to testimonials',
      icon: '⭐', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('testimonials'), 
      shortcut: 'G O' 
    },
    { 
      id: 'faq', 
      label: 'Przejdź do FAQ', 
      labelEn: 'Go to FAQ',
      icon: '❓', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('faq'), 
      shortcut: 'G F' 
    },
    { 
      id: 'contact', 
      label: 'Przejdź do kontaktu', 
      labelEn: 'Go to contact',
      icon: '📧', 
      category: 'Nawigacja', 
      categoryEn: 'Navigation',
      action: () => scrollTo('kontakt'), 
      shortcut: 'G C' 
    },
    
    // Akcje
    { 
      id: 'start-project', 
      label: 'Rozpocznij projekt', 
      labelEn: 'Start a project',
      icon: '🚀', 
      category: 'Akcje', 
      categoryEn: 'Actions',
      action: () => scrollTo('kontakt')
    },
    { 
      id: 'calculator', 
      label: 'Otwórz kalkulator wyceny', 
      labelEn: 'Open price calculator',
      icon: '🧮', 
      category: 'Akcje', 
      categoryEn: 'Actions',
      action: () => {
        scrollTo('kontakt');
        // Przełącz na zakładkę kalkulatora po scrollu
        setTimeout(() => {
          const calculatorTab = document.querySelector('[data-tab="calculator"]') as HTMLButtonElement;
          if (calculatorTab) calculatorTab.click();
        }, 500);
      }
    },
    
    // Zewnętrzne
    { 
      id: 'github', 
      label: 'Otwórz GitHub', 
      labelEn: 'Open GitHub',
      icon: '🐙', 
      category: 'Zewnętrzne', 
      categoryEn: 'External',
      action: () => { window.open('https://github.com/wwwCodeFixIT', '_blank'); onClose(); }
    },
    { 
      id: 'email', 
      label: 'Wyślij email', 
      labelEn: 'Send email',
      icon: '📧', 
      category: 'Zewnętrzne', 
      categoryEn: 'External',
      action: () => { window.open('mailto:wwwcodefixit@gmail.com', '_blank'); onClose(); }
    },
    { 
      id: 'phone', 
      label: 'Zadzwoń', 
      labelEn: 'Call',
      icon: '📱', 
      category: 'Zewnętrzne', 
      categoryEn: 'External',
      action: () => { window.open('tel:+48883667943', '_blank'); onClose(); }
    },
    
    // Admin
    { 
      id: 'admin-login', 
      label: 'Panel administratora', 
      labelEn: 'Admin panel',
      icon: '🔐', 
      category: 'Admin', 
      categoryEn: 'Admin',
      action: () => { 
        if (isAdmin) {
          window.location.hash = '#/admin/dashboard';
        } else {
          openLoginModal();
        }
        onClose(); 
      },
      shortcut: '⌘⇧A'
    },
    { 
      id: 'admin-dashboard', 
      label: 'Otwórz dashboard', 
      labelEn: 'Open dashboard',
      icon: '📊', 
      category: 'Admin', 
      categoryEn: 'Admin',
      action: () => { 
        if (isAdmin) {
          window.location.hash = '#/admin/dashboard';
        } else {
          openLoginModal();
        }
        onClose(); 
      },
      shortcut: '⌘⇧D',
      adminOnly: true
    },
  ];

  // Filtruj komendy - ukryj adminOnly jeśli nie jest adminem
  const availableCommands = commands.filter(cmd => {
    if (cmd.adminOnly && !isAdmin) return false;
    return true;
  });

  const filteredCommands = availableCommands.filter(cmd => {
    const label = language === 'pl' ? cmd.label : cmd.labelEn;
    const category = language === 'pl' ? cmd.category : cmd.categoryEn;
    return label.toLowerCase().includes(search.toLowerCase()) ||
           category.toLowerCase().includes(search.toLowerCase());
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const category = language === 'pl' ? cmd.category : cmd.categoryEn;
    if (!acc[category]) acc[category] = [];
    acc[category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const flatCommands = filteredCommands;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatCommands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [isOpen, flatCommands, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[9999] px-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                <div className="text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={language === 'pl' ? 'Wpisz komendę lub szukaj...' : 'Type a command or search...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-lg"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-400 text-xs font-mono">ESC</kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {category}
                    </div>
                    {cmds.map((cmd) => {
                      const globalIndex = flatCommands.findIndex(c => c.id === cmd.id);
                      const isSelected = globalIndex === selectedIndex;
                      const label = language === 'pl' ? cmd.label : cmd.labelEn;
                      
                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-red-500/20 text-white' 
                              : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span className="text-xl">{cmd.icon}</span>
                          <span className="flex-1 text-left">{label}</span>
                          {cmd.shortcut && (
                            <div className="flex gap-1">
                              {cmd.shortcut.split(' ').map((key, i) => (
                                <kbd key={i} className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-xs font-mono">
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="p-8 text-center text-zinc-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>{language === 'pl' ? 'Nie znaleziono komend' : 'No commands found'}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑↓</kbd>
                    {language === 'pl' ? 'Nawiguj' : 'Navigate'}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↵</kbd>
                    {language === 'pl' ? 'Wybierz' : 'Select'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-xs">Powered by</span>
                  <span className="text-red-500 font-bold text-sm">CodeFix.IT</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
