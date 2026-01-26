import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Ile kosztuje stworzenie strony internetowej?",
    answer: "Koszt projektu zależy od jego złożoności i wymagań. Prosta strona wizytówka zaczyna się od kilku tysięcy złotych, podczas gdy zaawansowane aplikacje webowe mogą kosztować znacznie więcej. Zawsze przygotowujemy indywidualną wycenę po analizie wymagań projektu."
  },
  {
    question: "Jak długo trwa realizacja projektu?",
    answer: "Czas realizacji zależy od zakresu projektu. Prosta strona internetowa może być gotowa w 2-4 tygodnie, natomiast rozbudowana aplikacja webowa może wymagać 2-6 miesięcy pracy. Dokładny harmonogram ustalamy na etapie planowania projektu."
  },
  {
    question: "Czy oferujecie wsparcie po wdrożeniu?",
    answer: "Tak, oferujemy kompleksowe wsparcie techniczne po wdrożeniu. Nasze pakiety obejmują monitoring 24/7, regularne aktualizacje, backup danych, poprawki błędów oraz rozwój nowych funkcjonalności zgodnie z potrzebami klienta."
  },
  {
    question: "Jakie technologie wykorzystujecie?",
    answer: "Pracujemy z najnowocześniejszym stackiem technologicznym. Frontend: React, Next.js, Vue.js, TypeScript. Backend: Node.js, Python, PHP, Laravel. Mobile: React Native, Flutter. Dobieramy technologie indywidualnie do potrzeb każdego projektu."
  },
  {
    question: "Czy możecie przeprojektować moją istniejącą stronę?",
    answer: "Oczywiście! Specjalizujemy się w redesignie i optymalizacji istniejących stron internetowych. Przeprowadzamy audyt UX/UI, analizujemy wydajność i proponujemy ulepszenia, które zwiększą konwersję i poprawią doświadczenie użytkowników."
  },
  {
    question: "Jak wygląda proces współpracy z wami?",
    answer: "Nasz proces składa się z 5 etapów: 1) Konsultacja i analiza wymagań, 2) Projektowanie UI/UX, 3) Development, 4) Testy i wdrożenie, 5) Wsparcie i rozwój. Na każdym etapie utrzymujemy stały kontakt i prezentujemy postępy prac."
  },
  {
    question: "Czy mogę zobaczyć postępy prac w trakcie projektu?",
    answer: "Tak, stosujemy metodologię agile i regularnie prezentujemy postępy prac. Otrzymujesz dostęp do środowiska testowego, gdzie możesz na bieżąco śledzić rozwój projektu i zgłaszać uwagi. Organizujemy też regularne spotkania statusowe."
  },
  {
    question: "Czy zajmujecie się pozycjonowaniem SEO?",
    answer: "Tak, każdy nasz projekt jest tworzony z myślą o SEO. Optymalizujemy strukturę strony, meta tagi, szybkość ładowania i dostępność. Oferujemy również zaawansowane usługi SEO jako osobny pakiet dla klientów, którzy chcą zwiększyć widoczność w wyszukiwarkach."
  }
];

function FAQItem({ faq, index, isOpen, onToggle }: {
  faq: typeof faqs[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-white/10 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium pr-8 group-hover:text-red-500 transition-colors">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isOpen ? "bg-red-600 text-white" : "bg-white/5 text-gray-400 group-hover:bg-red-600/20 group-hover:text-red-500"
          }`}
        >
          {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-400 leading-relaxed pr-16">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split FAQs into two columns
  const leftFAQs = faqs.slice(0, Math.ceil(faqs.length / 2));
  const rightFAQs = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <section id="faq" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Często zadawane <span className="text-red-600">pytania</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Odpowiedzi na najczęściej zadawane pytania dotyczące naszych usług
            i procesu współpracy.
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-x-12 gap-y-0">
          {/* Left Column */}
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl px-6">
            {leftFAQs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl px-6 mt-6 lg:mt-0">
            {rightFAQs.map((faq, index) => {
              const actualIndex = index + leftFAQs.length;
              return (
                <FAQItem
                  key={actualIndex}
                  faq={faq}
                  index={actualIndex}
                  isOpen={openIndex === actualIndex}
                  onToggle={() => toggleFAQ(actualIndex)}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400">
            Nie znalazłeś odpowiedzi na swoje pytanie?{" "}
            <a
              href="#contact"
              className="text-red-500 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              Skontaktuj się z nami
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
