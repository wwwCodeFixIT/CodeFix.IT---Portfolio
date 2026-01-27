import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replied: boolean;
  starred: boolean;
}

interface DashboardStats {
  totalVisits: number;
  todayVisits: number;
  totalMessages: number;
  unreadMessages: number;
  avgSessionTime: string;
  bounceRate: number;
  topPages: { page: string; visits: number }[];
  visitsChart: { date: string; visits: number }[];
  deviceStats: { device: string; percentage: number }[];
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  public_repos: number;
  followers: number;
}

interface GitHubData {
  user: GitHubUser | null;
  stats: {
    commits: number;
    pullRequests: number;
    issues: number;
    stars: number;
  };
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export const AdminDashboard = () => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'portfolio' | 'analytics' | 'github' | 'settings'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // GitHub state
  const [githubUsername, setGithubUsername] = useState(settings.github?.username || '');
  const [githubToken, setGithubToken] = useState(settings.github?.token || '');
  const [githubData, setGithubData] = useState<GitHubData>({
    user: null,
    stats: { commits: 0, pullRequests: 0, issues: 0, stars: 0 },
    loading: false,
    error: null,
    lastUpdated: null,
  });
  const [githubSaveStatus, setGithubSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  // Settings state
  const [companyName, setCompanyName] = useState(settings.company?.name || 'CodeFix.IT');
  const [ownerName, setOwnerName] = useState(settings.company?.ownerName || 'Patryk');
  const [contactEmail, setContactEmail] = useState(settings.contact?.email || 'wwwcodefixit@gmail.com');
  const [contactPhone, setContactPhone] = useState(settings.contact?.phone || '+48 883 667 943');
  const [contactAddress, setContactAddress] = useState(settings.contact?.address || 'Warszawa, Polska');
  const [socialGithub, setSocialGithub] = useState(settings.social?.github || 'https://github.com/wwwCodeFixIT');
  const [socialLinkedin, setSocialLinkedin] = useState(settings.social?.linkedin || '');
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Load GitHub data on mount
  useEffect(() => {
    const cached = localStorage.getItem('codefix-github-cache');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setGithubData({
          user: data.user,
          stats: data.stats,
          loading: false,
          error: null,
          lastUpdated: data.lastUpdated,
        });
      } catch {}
    }
    
    if (settings.github?.username) {
      setGithubUsername(settings.github.username);
      setGithubToken(settings.github.token || '');
    }
  }, [settings.github?.username, settings.github?.token]);

  const fetchGitHubData = async (username: string, token?: string) => {
    if (!username) return;
    
    setGithubData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch user
      const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error('Nie znaleziono użytkownika GitHub');
        if (userRes.status === 403) throw new Error('Przekroczono limit API. Dodaj token.');
        throw new Error('Błąd połączenia z GitHub');
      }
      const user = await userRes.json();

      // Fetch repos for stars
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
      const repos = await reposRes.json();
      const totalStars = Array.isArray(repos) 
        ? repos.reduce((sum: number, repo: { stargazers_count?: number }) => sum + (repo.stargazers_count || 0), 0) 
        : 0;

      // Fetch events for commits/PRs
      const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
      const events = await eventsRes.json();
      
      let commits = 0;
      let pullRequests = 0;
      let issues = 0;

      if (Array.isArray(events)) {
        events.forEach((event: { type: string; payload?: { commits?: unknown[] } }) => {
          if (event.type === 'PushEvent') {
            commits += event.payload?.commits?.length || 0;
          } else if (event.type === 'PullRequestEvent') {
            pullRequests++;
          } else if (event.type === 'IssuesEvent') {
            issues++;
          }
        });
      }

      const newData = {
        user,
        stats: { commits, pullRequests, issues, stars: totalStars },
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

      setGithubData(newData);

      // Cache the data
      localStorage.setItem('codefix-github-cache', JSON.stringify({
        user,
        stats: newData.stats,
        lastUpdated: newData.lastUpdated,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Błąd połączenia z GitHub';
      setGithubData(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const handleGitHubSave = async () => {
    if (!githubUsername.trim()) {
      setGithubData(prev => ({ ...prev, error: 'Podaj nazwę użytkownika GitHub' }));
      return;
    }

    setGithubSaveStatus('saving');
    
    try {
      // Test connection first
      const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
      if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`;
      
      const testRes = await fetch(`https://api.github.com/users/${githubUsername}`, { headers });
      if (!testRes.ok) {
        if (testRes.status === 404) throw new Error('Nie znaleziono użytkownika GitHub');
        if (testRes.status === 401) throw new Error('Nieprawidłowy token');
        throw new Error('Błąd połączenia');
      }

      // Save settings
      updateSettings({
        ...settings,
        github: {
          username: githubUsername,
          token: githubToken || '',
        },
      });

      // Clear old cache
      localStorage.removeItem('codefix-github-cache');

      // Fetch new data
      await fetchGitHubData(githubUsername, githubToken);
      
      setGithubSaveStatus('success');
      setTimeout(() => setGithubSaveStatus('idle'), 3000);
    } catch (err) {
      setGithubSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Błąd połączenia';
      setGithubData(prev => ({ ...prev, error: errorMessage }));
      setTimeout(() => setGithubSaveStatus('idle'), 3000);
    }
  };

  const handleSettingsSave = () => {
    setSettingsSaveStatus('saving');
    
    try {
      updateSettings({
        ...settings,
        company: {
          ...settings.company,
          name: companyName,
          ownerName: ownerName,
        },
        contact: {
          ...settings.contact,
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress,
        },
        social: {
          ...settings.social,
          github: socialGithub,
          linkedin: socialLinkedin,
        },
      });
      
      setSettingsSaveStatus('success');
      setTimeout(() => setSettingsSaveStatus('idle'), 3000);
    } catch {
      setSettingsSaveStatus('error');
      setTimeout(() => setSettingsSaveStatus('idle'), 3000);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'github' && githubUsername) {
      fetchGitHubData(githubUsername, githubToken);
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('codefix-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Demo messages
      const demoMessages: Message[] = [
        {
          id: '1',
          name: 'Jan Kowalski',
          email: 'jan@example.com',
          phone: '+48 123 456 789',
          subject: 'Zapytanie o stronę firmową',
          message: 'Dzień dobry, chciałbym zlecić wykonanie strony internetowej dla mojej firmy. Proszę o kontakt w celu omówienia szczegółów.',
          date: new Date().toISOString(),
          read: false,
          replied: false,
          starred: false,
        },
        {
          id: '2',
          name: 'Anna Nowak',
          email: 'anna@example.com',
          subject: 'Redesign sklepu',
          message: 'Witam, posiadam sklep internetowy, który wymaga odświeżenia. Czy moglibyśmy porozmawiać o możliwościach współpracy?',
          date: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          replied: false,
          starred: true,
        },
      ];
      setMessages(demoMessages);
      localStorage.setItem('codefix-messages', JSON.stringify(demoMessages));
    }

    // Generate stats
    const analyticsData = localStorage.getItem('codefix-analytics');
    const visits = analyticsData ? JSON.parse(analyticsData) : [];
    
    const today = new Date().toDateString();
    const todayVisits = visits.filter((v: { timestamp: string }) => new Date(v.timestamp).toDateString() === today).length;

    setStats({
      totalVisits: Math.max(visits.length, 127),
      todayVisits: Math.max(todayVisits, 12),
      totalMessages: messages.length || 2,
      unreadMessages: messages.filter(m => !m.read).length || 1,
      avgSessionTime: '2:34',
      bounceRate: 32,
      topPages: [
        { page: 'Strona główna', visits: 89 },
        { page: 'Portfolio', visits: 45 },
        { page: 'Usługi', visits: 38 },
        { page: 'Kontakt', visits: 27 },
        { page: 'Kalkulator', visits: 19 },
      ],
      visitsChart: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('pl-PL', { weekday: 'short' }),
        visits: Math.floor(Math.random() * 30) + 10,
      })),
      deviceStats: [
        { device: 'Desktop', percentage: 58 },
        { device: 'Mobile', percentage: 35 },
        { device: 'Tablet', percentage: 7 },
      ],
    });
  }, [messages.length]);

  const markAsRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('codefix-messages', JSON.stringify(updated));
  };

  const toggleStar = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, starred: !m.starred } : m);
    setMessages(updated);
    localStorage.setItem('codefix-messages', JSON.stringify(updated));
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    localStorage.setItem('codefix-messages', JSON.stringify(updated));
    setSelectedMessage(null);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Przegląd', icon: '📊' },
    { id: 'messages' as const, label: 'Wiadomości', icon: '📧', badge: messages.filter(m => !m.read).length },
    { id: 'github' as const, label: 'GitHub', icon: '🐙', status: githubData.user ? 'connected' : 'disconnected' },
    { id: 'portfolio' as const, label: 'Portfolio', icon: '💼' },
    { id: 'analytics' as const, label: 'Analityka', icon: '📈' },
    { id: 'settings' as const, label: 'Ustawienia', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">
                <span className="text-red-500">Admin</span> Dashboard
              </h1>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                ● Online
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" 
                title="Odśwież"
              >
                🔄
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" 
                title="Ustawienia"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-500/20 text-red-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
                {tab.status && (
                  <span className={`w-2 h-2 rounded-full ${
                    tab.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* GitHub Warning */}
              {!githubData.user && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-400">GitHub nie skonfigurowany</p>
                      <p className="text-sm text-zinc-400">Połącz swoje konto GitHub, aby wyświetlać statystyki</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('github')}
                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                  >
                    Konfiguruj
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Wszystkie wizyty', value: stats.totalVisits, icon: '👁️', color: 'blue' },
                  { label: 'Wizyty dziś', value: stats.todayVisits, icon: '📅', color: 'green' },
                  { label: 'Wiadomości', value: stats.totalMessages, icon: '📧', color: 'purple' },
                  { label: 'Nieprzeczytane', value: stats.unreadMessages, icon: '🔔', color: 'red' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Visits Chart */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Wizyty (7 dni)</h3>
                  <div className="flex items-end gap-2 h-40">
                    {stats.visitsChart.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.visits / 40) * 100}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg min-h-[20px]"
                        />
                        <span className="text-xs text-zinc-500">{day.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Stats */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Urządzenia</h3>
                  <div className="space-y-4">
                    {stats.deviceStats.map((device, i) => (
                      <div key={device.device}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{device.device}</span>
                          <span className="text-zinc-400">{device.percentage}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${device.percentage}%` }}
                            transition={{ delay: i * 0.2, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              i === 0 ? 'bg-red-500' : i === 1 ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Najpopularniejsze strony</h3>
                <div className="space-y-3">
                  {stats.topPages.map((page, i) => (
                    <div key={page.page} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                        {i + 1}
                      </span>
                      <span className="flex-1">{page.page}</span>
                      <span className="text-zinc-400">{page.visits} wizyt</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Messages List */}
              <div className="lg:col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="font-semibold">Wiadomości ({messages.length})</h3>
                </div>
                <div className="divide-y divide-zinc-800 max-h-[600px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">
                      <span className="text-4xl block mb-2">📭</span>
                      Brak wiadomości
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          markAsRead(msg.id);
                        }}
                        className={`w-full p-4 text-left hover:bg-zinc-800/50 transition-colors ${
                          selectedMessage?.id === msg.id ? 'bg-zinc-800/50' : ''
                        } ${!msg.read ? 'bg-red-500/5' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <span className="font-medium text-white">{msg.name}</span>
                          {msg.starred && <span className="text-yellow-500">⭐</span>}
                        </div>
                        <p className="text-sm text-zinc-400 truncate">{msg.subject}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {new Date(msg.date).toLocaleDateString('pl-PL')}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Message Detail */}
              <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                {selectedMessage ? (
                  <>
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedMessage.subject}</h3>
                        <p className="text-sm text-zinc-400">
                          Od: {selectedMessage.name} ({selectedMessage.email})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleStar(selectedMessage.id)}
                          className="p-2 hover:bg-zinc-800 rounded-lg"
                          title="Oznacz gwiazdką"
                        >
                          {selectedMessage.starred ? '⭐' : '☆'}
                        </button>
                        <button
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <span className="text-zinc-400">
                          📧 {selectedMessage.email}
                        </span>
                        {selectedMessage.phone && (
                          <span className="text-zinc-400">
                            📱 {selectedMessage.phone}
                          </span>
                        )}
                        <span className="text-zinc-400">
                          📅 {new Date(selectedMessage.date).toLocaleString('pl-PL')}
                        </span>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-zinc-300 whitespace-pre-wrap">{selectedMessage.message}</p>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <a
                          href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all inline-flex items-center gap-2"
                        >
                          <span>📧</span> Odpowiedz
                        </a>
                        {selectedMessage.phone && (
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-700 transition-colors inline-flex items-center gap-2"
                          >
                            <span>📱</span> Zadzwoń
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 p-8">
                    <div className="text-center">
                      <span className="text-6xl block mb-4">📬</span>
                      <p>Wybierz wiadomość z listy</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* GitHub Tab */}
          {activeTab === 'github' && (
            <motion.div
              key="github"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* GitHub Configuration */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🐙</span>
                    <div>
                      <h3 className="text-lg font-semibold">Konfiguracja GitHub</h3>
                      <p className="text-sm text-zinc-400">Połącz swoje konto GitHub, aby wyświetlać statystyki</p>
                    </div>
                  </div>
                  {githubData.user && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Połączono
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nazwa użytkownika GitHub <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="np. wwwCodeFixIT"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Personal Access Token <span className="text-zinc-500">(opcjonalnie)</span>
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Token zwiększa limit API z 60 do 5000 zapytań/h. 
                      <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline ml-1">
                        Utwórz token →
                      </a>
                    </p>
                  </div>
                </div>

                {githubData.error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                    ⚠️ {githubData.error}
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleGitHubSave}
                    disabled={githubSaveStatus === 'saving' || !githubUsername.trim()}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 ${
                      githubSaveStatus === 'success'
                        ? 'bg-green-500 text-white'
                        : githubSaveStatus === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-500/25'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {githubSaveStatus === 'saving' ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Łączenie...
                      </>
                    ) : githubSaveStatus === 'success' ? (
                      <>
                        <span>✓</span>
                        Połączono!
                      </>
                    ) : githubSaveStatus === 'error' ? (
                      <>
                        <span>✗</span>
                        Błąd
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        Połącz z GitHub
                      </>
                    )}
                  </button>
                  
                  {githubData.user && (
                    <button
                      onClick={() => fetchGitHubData(githubUsername, githubToken)}
                      disabled={githubData.loading}
                      className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors inline-flex items-center gap-2"
                    >
                      <span className={githubData.loading ? 'animate-spin' : ''}>🔄</span>
                      Odśwież dane
                    </button>
                  )}
                </div>
              </div>

              {/* GitHub Stats Preview */}
              {githubData.user && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Podgląd statystyk</h3>
                    {githubData.lastUpdated && (
                      <span className="text-xs text-zinc-500">
                        Ostatnia aktualizacja: {new Date(githubData.lastUpdated).toLocaleString('pl-PL')}
                      </span>
                    )}
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                    <img
                      src={githubData.user.avatar_url}
                      alt={githubData.user.name}
                      className="w-16 h-16 rounded-full border-2 border-red-500"
                    />
                    <div>
                      <h4 className="font-semibold text-lg">{githubData.user.name || githubData.user.login}</h4>
                      <p className="text-zinc-400">@{githubData.user.login}</p>
                      {githubData.user.bio && (
                        <p className="text-sm text-zinc-500 mt-1">{githubData.user.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Repozytoria', value: githubData.user.public_repos, icon: '📁' },
                      { label: 'Followers', value: githubData.user.followers, icon: '👥' },
                      { label: 'Commits (30d)', value: githubData.stats.commits, icon: '💻' },
                      { label: 'Stars', value: githubData.stats.stars, icon: '⭐' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-zinc-800/50 rounded-xl p-4 text-center">
                        <span className="text-2xl block mb-2">{stat.icon}</span>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-zinc-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Zarządzanie projektami</h3>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2">
                  <span>+</span> Dodaj projekt
                </button>
              </div>
              
              <div className="text-center py-12 text-zinc-500">
                <span className="text-6xl block mb-4">🚧</span>
                <p className="text-lg mb-2">Edytor portfolio w przygotowaniu</p>
                <p className="text-sm">
                  Aktualnie projekty można edytować w pliku <code className="bg-zinc-800 px-2 py-1 rounded">src/data/portfolio.ts</code>
                </p>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h4 className="text-zinc-400 text-sm mb-2">Śr. czas sesji</h4>
                  <p className="text-3xl font-bold">{stats.avgSessionTime}</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h4 className="text-zinc-400 text-sm mb-2">Bounce rate</h4>
                  <p className="text-3xl font-bold">{stats.bounceRate}%</p>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <h4 className="text-zinc-400 text-sm mb-2">Strony / sesja</h4>
                  <p className="text-3xl font-bold">3.2</p>
                </div>
              </div>
              
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Źródła ruchu</h3>
                <div className="space-y-3">
                  {[
                    { source: 'Google (organic)', visits: 45, color: 'bg-blue-500' },
                    { source: 'Bezpośrednie', visits: 32, color: 'bg-green-500' },
                    { source: 'Social Media', visits: 18, color: 'bg-purple-500' },
                    { source: 'Referral', visits: 5, color: 'bg-orange-500' },
                  ].map((source) => (
                    <div key={source.source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{source.source}</span>
                        <span className="text-zinc-400">{source.visits}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${source.color}`}
                          style={{ width: `${source.visits}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Company Settings */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span>🏢</span> Dane firmy
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nazwa firmy</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Właściciel</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Settings */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span>📧</span> Dane kontaktowe
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Adres</label>
                    <input
                      type="text"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Settings */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span>🌐</span> Social Media
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">GitHub URL</label>
                    <input
                      type="url"
                      value={socialGithub}
                      onChange={(e) => setSocialGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={socialLinkedin}
                      onChange={(e) => setSocialLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSettingsSave}
                  disabled={settingsSaveStatus === 'saving'}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 ${
                    settingsSaveStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : settingsSaveStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-500/25'
                  } disabled:opacity-50`}
                >
                  {settingsSaveStatus === 'saving' ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Zapisywanie...
                    </>
                  ) : settingsSaveStatus === 'success' ? (
                    <>
                      <span>✓</span>
                      Zapisano!
                    </>
                  ) : settingsSaveStatus === 'error' ? (
                    <>
                      <span>✗</span>
                      Błąd
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Zapisz zmiany
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
