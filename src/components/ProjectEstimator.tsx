import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feature {
  id: string;
  name: string;
  price: number;
  time: number;
  icon: string;
  category: string;
}

const projectTypes = [
  { id: 'landing', name: 'Landing Page', basePrice: 2000, baseTime: 5, icon: '📄' },
  { id: 'website', name: 'Strona firmowa', basePrice: 4000, baseTime: 10, icon: '🌐' },
  { id: 'ecommerce', name: 'Sklep online', basePrice: 8000, baseTime: 20, icon: '🛒' },
  { id: 'webapp', name: 'Aplikacja webowa', basePrice: 12000, baseTime: 30, icon: '💻' },
  { id: 'mobile', name: 'Aplikacja mobilna', basePrice: 15000, baseTime: 40, icon: '📱' },
  { id: 'custom', name: 'Rozwiązanie custom', basePrice: 20000, baseTime: 60, icon: '🔧' },
];

const features: Feature[] = [
  // Design
  { id: 'custom-design', name: 'Custom design UI/UX', price: 2000, time: 5, icon: '🎨', category: 'Design' },
  { id: 'animations', name: 'Zaawansowane animacje', price: 1500, time: 3, icon: '✨', category: 'Design' },
  { id: 'responsive', name: 'Responsywność premium', price: 800, time: 2, icon: '📱', category: 'Design' },
  { id: 'dark-mode', name: 'Tryb ciemny/jasny', price: 500, time: 1, icon: '🌙', category: 'Design' },
  
  // Funkcjonalności
  { id: 'auth', name: 'System logowania', price: 1500, time: 3, icon: '🔐', category: 'Funkcje' },
  { id: 'payments', name: 'Płatności online', price: 2500, time: 5, icon: '💳', category: 'Funkcje' },
  { id: 'admin', name: 'Panel administracyjny', price: 3000, time: 7, icon: '⚙️', category: 'Funkcje' },
  { id: 'search', name: 'Wyszukiwarka zaawansowana', price: 1200, time: 3, icon: '🔍', category: 'Funkcje' },
  { id: 'notifications', name: 'System powiadomień', price: 1000, time: 2, icon: '🔔', category: 'Funkcje' },
  { id: 'chat', name: 'Chat / Komunikator', price: 2500, time: 5, icon: '💬', category: 'Funkcje' },
  
  // Integracje
  { id: 'api', name: 'Integracja z API', price: 1500, time: 3, icon: '🔗', category: 'Integracje' },
  { id: 'crm', name: 'Integracja CRM', price: 2000, time: 4, icon: '📊', category: 'Integracje' },
  { id: 'analytics', name: 'Analytics & Tracking', price: 500, time: 1, icon: '📈', category: 'Integracje' },
  { id: 'social', name: 'Social media login', price: 800, time: 2, icon: '👥', category: 'Integracje' },
  
  // Dodatkowe
  { id: 'seo', name: 'Optymalizacja SEO', price: 1000, time: 2, icon: '🎯', category: 'Dodatkowe' },
  { id: 'pwa', name: 'Progressive Web App', price: 1500, time: 3, icon: '📲', category: 'Dodatkowe' },
  { id: 'multilang', name: 'Wielojęzyczność', price: 1200, time: 3, icon: '🌍', category: 'Dodatkowe' },
  { id: 'testing', name: 'Testy automatyczne', price: 2000, time: 4, icon: '🧪', category: 'Dodatkowe' },
];

const urgencyOptions = [
  { id: 'normal', name: 'Standardowy', multiplier: 1, icon: '🐢' },
  { id: 'fast', name: 'Przyspieszony (-20% czasu)', multiplier: 1.3, icon: '🐇' },
  { id: 'urgent', name: 'Pilny (-40% czasu)', multiplier: 1.6, icon: '🚀' },
];

export default function ProjectEstimator() {
  const [selectedType, setSelectedType] = useState(projectTypes[0]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [urgency, setUrgency] = useState(urgencyOptions[0]);
  const [showSummary, setShowSummary] = useState(false);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const calculation = useMemo(() => {
    const basePrice = selectedType.basePrice;
    const baseTime = selectedType.baseTime;
    
    const featuresPrice = selectedFeatures.reduce((sum, id) => {
      const feature = features.find(f => f.id === id);
      return sum + (feature?.price || 0);
    }, 0);
    
    const featuresTime = selectedFeatures.reduce((sum, id) => {
      const feature = features.find(f => f.id === id);
      return sum + (feature?.time || 0);
    }, 0);
    
    const subtotal = basePrice + featuresPrice;
    const total = Math.round(subtotal * urgency.multiplier);
    const time = Math.round((baseTime + featuresTime) * (1 / urgency.multiplier));
    
    return { basePrice, featuresPrice, subtotal, total, time };
  }, [selectedType, selectedFeatures, urgency]);

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <section id="estimator" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-sm font-medium mb-4">
            <span className="text-lg">🧮</span>
            Kalkulator wyceny
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Oszacuj <span className="text-red-500">swój projekt</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Wybierz typ projektu i funkcjonalności, aby otrzymać szacunkową wycenę i czas realizacji.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>1️⃣</span> Typ projektu
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {projectTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedType.id === type.id
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <h4 className="text-white font-medium mt-2 text-sm">{type.name}</h4>
                    <p className="text-zinc-500 text-xs mt-1">od {type.basePrice.toLocaleString()} zł</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>2️⃣</span> Funkcjonalności
                <span className="ml-auto text-sm text-zinc-500">
                  {selectedFeatures.length} wybrano
                </span>
              </h3>
              
              <div className="space-y-6">
                {Object.entries(groupedFeatures).map(([category, featureList]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-zinc-400 mb-3">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {featureList.map(feature => (
                        <button
                          key={feature.id}
                          onClick={() => toggleFeature(feature.id)}
                          className={`p-3 rounded-lg border transition-all text-left flex items-center gap-2 ${
                            selectedFeatures.includes(feature.id)
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/30'
                          }`}
                        >
                          <span className="text-lg">{feature.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white text-xs font-medium truncate">{feature.name}</h5>
                            <p className="text-zinc-500 text-xs">+{feature.price.toLocaleString()} zł</p>
                          </div>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedFeatures.includes(feature.id)
                              ? 'border-red-500 bg-red-500'
                              : 'border-zinc-600'
                          }`}>
                            {selectedFeatures.includes(feature.id) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Urgency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>3️⃣</span> Termin realizacji
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {urgencyOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setUrgency(option)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      urgency.id === option.id
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <h4 className="text-white font-medium mt-2 text-sm">{option.name}</h4>
                    {option.multiplier > 1 && (
                      <p className="text-red-400 text-xs mt-1">+{Math.round((option.multiplier - 1) * 100)}% ceny</p>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Podsumowanie
              </h3>

              {/* Selected Type */}
              <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg mb-4">
                <span className="text-2xl">{selectedType.icon}</span>
                <div>
                  <h4 className="text-white font-medium text-sm">{selectedType.name}</h4>
                  <p className="text-zinc-500 text-xs">{selectedType.basePrice.toLocaleString()} zł</p>
                </div>
              </div>

              {/* Selected Features */}
              {selectedFeatures.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-zinc-400 mb-2">Wybrane funkcje:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeatures.map(id => {
                      const feature = features.find(f => f.id === id);
                      return feature ? (
                        <span key={id} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                          {feature.icon} {feature.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Calculation */}
              <div className="border-t border-zinc-800 pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Cena bazowa:</span>
                  <span className="text-white">{calculation.basePrice.toLocaleString()} zł</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Funkcje:</span>
                  <span className="text-white">+{calculation.featuresPrice.toLocaleString()} zł</span>
                </div>
                {urgency.multiplier > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Priorytet ({urgency.name}):</span>
                    <span className="text-red-400">+{Math.round((urgency.multiplier - 1) * calculation.subtotal).toLocaleString()} zł</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-zinc-800 pt-4 mt-4">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-400">Szacowana cena:</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">{calculation.total.toLocaleString()}</span>
                    <span className="text-zinc-400 ml-1">zł</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-zinc-400 text-sm">Czas realizacji:</span>
                  <span className="text-red-400 font-medium">~{calculation.time} dni roboczych</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setShowSummary(true)}
                className="w-full mt-6 py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
              >
                Wyślij zapytanie
              </button>
              
              <p className="text-xs text-zinc-500 text-center mt-3">
                * Ceny są orientacyjne i mogą się różnić w zależności od szczegółów projektu
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowSummary(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 z-50"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dziękujemy!</h3>
                <p className="text-zinc-400 mb-4">
                  Twoja wycena została przygotowana. Kliknij poniżej, aby przejść do formularza kontaktowego.
                </p>
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-white">{calculation.total.toLocaleString()} zł</div>
                  <div className="text-zinc-400 text-sm">~{calculation.time} dni roboczych</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="flex-1 py-2 px-4 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Zamknij
                  </button>
                  <button
                    onClick={() => {
                      setShowSummary(false);
                      document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Kontakt
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
