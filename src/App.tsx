import { useState, useEffect } from 'react';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LoadingScreen } from './components/LoadingScreen';
import { FloatingShapes, BackgroundNoise, Spotlight, ScrollIndicator } from './components/FloatingElements';
import { CustomCursor } from './components/CustomCursor';
import { ScrollProgress } from './components/ScrollProgress';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Partners } from './components/Partners';
import { Services } from './components/Services';
import { WhyUs } from './components/WhyUs';
import { Process } from './components/Process';
import { Technologies } from './components/Technologies';
import { TechCenter } from './components/TechCenter';
import { Portfolio } from './components/Portfolio';
import { CodePlayground } from './components/CodePlayground';
import ProjectEstimator from './components/ProjectEstimator';
import Blog from './components/Blog';
import GitHubStats from './components/GitHubStats';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { Testimonials } from './components/Testimonials';
import { CaseStudies } from './components/CaseStudies';
import { FAQ } from './components/FAQ';
import { StatusPage } from './components/StatusPage';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { CookieConsentAdvanced } from './components/CookieConsentAdvanced';
import { LegalPage } from './components/LegalPages';
import { NotFound } from './components/NotFound';
import CommandPalette from './components/CommandPalette';
import LiveChat from './components/LiveChat';
import AccessibilityPanel from './components/AccessibilityPanel';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import SettingsPanel from './components/SettingsPanel';
import SetupWizard from './components/SetupWizard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminIndicator, AdminToolbar } from './components/AdminPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { useAnalytics } from './hooks/useAnalytics';

// Komponent głównej aplikacji z dostępem do kontekstu
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | '404' | 'dashboard'>('home');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | null>(null);
  const { trackEvent } = useAnalytics();
  const { isConfigured } = useSettings();
  const { isAdmin, openLoginModal } = useAdmin();
  const { language } = useLanguage();

  // Check for hash routes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/404') {
        setCurrentPage('404');
      } else if (hash === '#/admin/dashboard' && isAdmin) {
        setCurrentPage('dashboard');
      } else if (hash === '#/privacy') {
        setLegalPage('privacy');
      } else if (hash === '#/terms') {
        setLegalPage('terms');
      } else {
        setCurrentPage('home');
        setLegalPage(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdmin]);

  // Track page sections on scroll
  useEffect(() => {
    if (currentPage !== 'home') return;
    
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          const lastSection = sessionStorage.getItem('currentSection');
          if (lastSection !== sectionId && sectionId) {
            sessionStorage.setItem('currentSection', sectionId);
            trackEvent('section_view', 'navigation', sectionId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent, currentPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Settings: Cmd/Ctrl + , (tylko dla admina)
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        if (isAdmin) {
          setIsSettingsOpen(true);
        } else {
          openLoginModal();
        }
      }
      // Setup Wizard: Cmd/Ctrl + Shift + S (tylko dla admina)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (isAdmin) {
          setIsSetupWizardOpen(true);
        } else {
          openLoginModal();
        }
      }
      // Admin Dashboard: Cmd/Ctrl + Shift + D
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        if (isAdmin) {
          window.location.hash = '#/admin/dashboard';
        } else {
          openLoginModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, openLoginModal]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  const handleSetupComplete = () => {
    localStorage.setItem('codefix_setup_completed', 'true');
    setIsSetupWizardOpen(false);
  };

  const goHome = () => {
    window.location.hash = '';
    setCurrentPage('home');
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handlePreloaderComplete} />;
  }

  // 404 Page
  if (currentPage === '404') {
    return <NotFound onGoHome={goHome} />;
  }

  // Admin Dashboard (tylko dla admina)
  if (currentPage === 'dashboard' && isAdmin) {
    return (
      <>
        <AdminDashboard />
        <button
          onClick={goHome}
          className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          ← {language === 'pl' ? 'Wróć do strony' : 'Back to site'}
        </button>
      </>
    );
  }

  return (
    <div className="bg-black min-h-screen relative overflow-x-hidden">
      {/* Background effects */}
      <FloatingShapes />
      <BackgroundNoise />
      <Spotlight />
      
      <CustomCursor />
      <ScrollProgress />
      <ScrollIndicator />
      <Navbar onOpenSettings={() => isAdmin ? setIsSettingsOpen(true) : openLoginModal()} />
      
      {/* Baner konfiguracji - TYLKO DLA ADMINA */}
      {isAdmin && !isConfigured && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4">
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border border-red-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚙️</div>
              <div className="flex-1">
                <p className="font-medium text-sm text-white">
                  {language === 'pl' ? 'Skonfiguruj swoje środowisko' : 'Configure your environment'}
                </p>
                <p className="text-gray-400 text-xs">
                  {language === 'pl' ? 'Odblokuj pełne statystyki GitHub i więcej' : 'Unlock full GitHub stats and more'}
                </p>
              </div>
              <button
                onClick={() => setIsSetupWizardOpen(true)}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm transition-colors text-white"
              >
                {language === 'pl' ? 'Konfiguruj' : 'Configure'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main>
        <Hero />
        <Partners />
        <Services />
        <WhyUs />
        <Process />
        <Technologies />
        <TechCenter />
        <Portfolio />
        <CaseStudies />
        <CodePlayground />
        <ProjectEstimator />
        <Blog />
        <GitHubStats />
        {/* Analytics Dashboard - TYLKO DLA ADMINA */}
        {isAdmin && <AnalyticsDashboard />}
        <Testimonials />
        <FAQ />
        <StatusPage />
        <Contact />
      </main>
      
      <Footer 
        onOpenPrivacy={() => setLegalPage('privacy')}
        onOpenTerms={() => setLegalPage('terms')}
      />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      {/* Overlays & Widgets */}
      <CookieConsentAdvanced />
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      
      {/* Legal Pages */}
      <LegalPage 
        isOpen={legalPage === 'privacy'} 
        onClose={() => setLegalPage(null)} 
        type="privacy" 
      />
      <LegalPage 
        isOpen={legalPage === 'terms'} 
        onClose={() => setLegalPage(null)} 
        type="terms" 
      />
      
      {/* Panel logowania admina */}
      <AdminLoginModal />
      
      {/* Indykator i toolbar admina - tylko gdy zalogowany */}
      <AdminIndicator />
      <AdminToolbar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
      />
      
      {/* Panele konfiguracji - TYLKO DLA ADMINA */}
      {isAdmin && (
        <>
          <SettingsPanel 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
          />
          <SetupWizard
            isOpen={isSetupWizardOpen}
            onClose={() => setIsSetupWizardOpen(false)}
            onComplete={handleSetupComplete}
          />
        </>
      )}
      
      <LiveChat />
      <AccessibilityPanel />
      <KeyboardShortcuts onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
    </div>
  );
}

// Główny App z providerami
function App() {
  return (
    <SettingsProvider>
      <AdminProvider>
        <LanguageProvider>
          <CustomThemeProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </CustomThemeProvider>
        </LanguageProvider>
      </AdminProvider>
    </SettingsProvider>
  );
}

export default App;
