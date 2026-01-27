import { motion } from 'framer-motion';
import { useGitHubStats } from '../hooks/useGitHubStats';
import { useSettings } from '../context/SettingsContext';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';

interface GitHubStatsProps {
  onOpenDashboard?: () => void;
}

export function GitHubStats({ onOpenDashboard }: GitHubStatsProps) {
  const { isConfigured } = useSettings();
  const { isAdmin, openLoginModal } = useAdmin();
  const { language } = useLanguage();
  
  const {
    user,
    repos,
    contributions,
    languages,
    totalCommits,
    totalPRs,
    totalIssues,
    totalStars,
    currentStreak,
    longestStreak,
    isLoading,
    error,
    lastUpdated,
    refetch,
  } = useGitHubStats();

  const topRepos = repos
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  const topLanguages = Object.entries(languages).slice(0, 6);

  const statCards = [
    { label: language === 'pl' ? 'Commits' : 'Commits', value: totalCommits, icon: '📝' },
    { label: 'Pull Requests', value: totalPRs, icon: '🔀' },
    { label: 'Issues', value: totalIssues, icon: '🐛' },
    { label: language === 'pl' ? 'Gwiazdki' : 'Stars', value: totalStars, icon: '⭐' },
    { label: language === 'pl' ? 'Repozytoria' : 'Repositories', value: repos.filter(r => !r.fork).length, icon: '📦' },
    { label: 'Followers', value: user?.followers || 0, icon: '👥' },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleConfigure = () => {
    if (isAdmin) {
      // Otwórz dashboard na zakładce GitHub
      if (onOpenDashboard) {
        onOpenDashboard();
      } else {
        window.location.hash = '#/admin/dashboard';
      }
    } else {
      openLoginModal();
    }
  };

  // Błąd lub brak konfiguracji
  if (error && !user) {
    return (
      <section id="github" className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              GitHub <span className="text-red-500">Stats</span>
            </h2>
            
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 max-w-md mx-auto mt-8">
              <div className="text-5xl mb-4">🔗</div>
              <p className="text-gray-400 mb-6">
                {language === 'pl' 
                  ? 'Połącz konto GitHub, aby wyświetlić statystyki' 
                  : 'Connect GitHub account to display statistics'}
              </p>
              
              <button
                onClick={handleConfigure}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-red-500/25 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {isAdmin 
                  ? (language === 'pl' ? 'Konfiguruj GitHub' : 'Configure GitHub')
                  : (language === 'pl' ? 'Zaloguj się jako admin' : 'Login as admin')
                }
              </button>
              
              {!isAdmin && (
                <p className="text-gray-600 text-sm mt-4">
                  {language === 'pl' 
                    ? 'Skrót: Ctrl+Shift+A' 
                    : 'Shortcut: Ctrl+Shift+A'}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="github" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {language === 'pl' ? 'Aktywny na GitHub' : 'Active on GitHub'}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            GitHub <span className="text-red-500">Activity</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {language === 'pl' 
              ? 'Prawdziwe statystyki z mojego konta GitHub. Dane aktualizowane automatycznie.'
              : 'Real statistics from my GitHub account. Data updated automatically.'}
          </p>

          {lastUpdated && (
            <p className="text-gray-600 text-sm mt-4">
              {language === 'pl' ? 'Ostatnia aktualizacja:' : 'Last updated:'} {lastUpdated.toLocaleTimeString()}
              <button
                onClick={refetch}
                className="ml-2 text-red-500 hover:text-red-400 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '⏳' : '🔄'} {language === 'pl' ? 'Odśwież' : 'Refresh'}
              </button>
            </p>
          )}
        </motion.div>

        {/* Loading state */}
        {isLoading && !user && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {user && (
          <>
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6 mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-6">
                <img
                  src={user.avatar_url}
                  alt={user.name || user.login}
                  className="w-20 h-20 rounded-full border-2 border-red-500"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{user.name || user.login}</h3>
                  <p className="text-gray-400">@{user.login}</p>
                  {user.bio && <p className="text-gray-500 text-sm mt-1">{user.bio}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {user.location && <span>📍 {user.location}</span>}
                    {user.company && <span>🏢 {user.company}</span>}
                  </div>
                </div>
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  {language === 'pl' ? 'Zobacz profil' : 'View profile'} →
                </a>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl mb-2 block">{stat.icon}</span>
                  <div className="text-2xl font-bold text-red-500">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 text-center border border-orange-500/20"
              >
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-3xl font-bold">{currentStreak} {language === 'pl' ? 'dni' : 'days'}</div>
                <div className="text-gray-400">{language === 'pl' ? 'Aktualna seria' : 'Current streak'}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 text-center border border-purple-500/20"
              >
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-bold">{longestStreak} {language === 'pl' ? 'dni' : 'days'}</div>
                <div className="text-gray-400">{language === 'pl' ? 'Najdłuższa seria' : 'Longest streak'}</div>
              </motion.div>
            </div>

            {/* Contribution Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 mb-12 overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span> Contribution Graph
                <span className="text-sm font-normal text-gray-500 ml-auto">
                  {language === 'pl' ? 'Ostatnie 365 dni' : 'Last 365 days'}
                </span>
              </h3>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-[3px] min-w-max">
                  {/* Podziel na tygodnie */}
                  {Array.from({ length: 52 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const contribIndex = weekIndex * 7 + dayIndex;
                        const contrib = contributions[contribIndex];
                        if (!contrib) return null;

                        const colors = [
                          'bg-white/5',
                          'bg-green-900/50',
                          'bg-green-700/70',
                          'bg-green-500',
                          'bg-green-400',
                        ];

                        return (
                          <motion.div
                            key={contribIndex}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: contribIndex * 0.001 }}
                            className={`w-3 h-3 rounded-sm ${colors[contrib.level]} cursor-pointer hover:ring-2 hover:ring-white/30 transition-all`}
                            title={`${contrib.date}: ${contrib.count} contributions`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 text-sm text-gray-500">
                <span>{language === 'pl' ? 'Mniej' : 'Less'}</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-white/5 rounded-sm" />
                  <div className="w-3 h-3 bg-green-900/50 rounded-sm" />
                  <div className="w-3 h-3 bg-green-700/70 rounded-sm" />
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <div className="w-3 h-3 bg-green-400 rounded-sm" />
                </div>
                <span>{language === 'pl' ? 'Więcej' : 'More'}</span>
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 mb-12"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>💻</span> Top Languages
              </h3>
              <div className="space-y-4">
                {topLanguages.map(([lang, data], index) => (
                  <motion.div
                    key={lang}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="font-medium">{lang}</span>
                      </div>
                      <span className="text-gray-500">{data.percentage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${data.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Top Repos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>📌</span> Pinned Repositories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topRepos.map((repo, index) => (
                  <motion.a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="block bg-white/5 rounded-xl p-5 border border-white/10 hover:border-red-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold group-hover:text-red-500 transition-colors truncate pr-2">
                        {repo.name}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full whitespace-nowrap">
                        {repo.language || 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {repo.description || (language === 'pl' ? 'Brak opisu' : 'No description')}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        🍴 {repo.forks_count}
                      </span>
                      {repo.open_issues_count > 0 && (
                        <span className="flex items-center gap-1">
                          🐛 {repo.open_issues_count}
                        </span>
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Config hint - tylko dla admina */}
        {isAdmin && !isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <p className="text-yellow-400 mb-4">
              ⚠️ {language === 'pl' 
                ? 'Skonfiguruj swoją nazwę użytkownika GitHub w panelu admina' 
                : 'Configure your GitHub username in admin panel'}
            </p>
            <button
              onClick={handleConfigure}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
            >
              {language === 'pl' ? 'Otwórz konfigurację' : 'Open configuration'}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default GitHubStats;
