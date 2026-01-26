import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, Github, Clock, MessageSquare } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  budget: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    budget: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Imię jest wymagane";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Podaj prawidłowy adres email";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Wiadomość jest wymagana";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Wiadomość musi mieć co najmniej 10 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        budget: "",
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "wwwcodefixit@gmail.com",
      href: "mailto:wwwcodefixit@gmail.com",
    },
    {
      icon: Phone,
      label: "Telefon",
      value: "+48 883 667 943",
      href: "tel:+48883667943",
    },
    {
      icon: MapPin,
      label: "Lokalizacja",
      value: "Warszawa, Polska",
      href: null,
    },
    {
      icon: Github,
      label: "GitHub",
      value: "wwwCodeFixIT",
      href: "https://github.com/wwwCodeFixIT",
    },
  ];

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-red-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Kontakt
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Porozmawiajmy o <span className="text-red-600">Twoim projekcie</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg">
            Masz pomysł na stronę lub aplikację? Skontaktuj się ze mną,
            a wspólnie omówimy szczegóły i przygotujemy wycenę.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Dane kontaktowe</h3>
              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ x: 5 }}
                    className="group"
                  >
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-red-600/30 transition-all duration-300"
                      >
                        <div className="w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                          <item.icon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">{item.label}</div>
                          <div className="text-white font-medium group-hover:text-red-500 transition-colors">
                            {item.value}
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <div className="w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">{item.label}</div>
                          <div className="text-white font-medium">{item.value}</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl border border-green-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-green-400">Szybka odpowiedź</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Staram się odpowiadać na wiadomości w ciągu 24 godzin w dni robocze.
                Pilne sprawy? Zadzwoń!
              </p>
            </motion.div>

            {/* Free Consultation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-xl border border-red-500/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-red-400">Bezpłatna konsultacja</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Pierwsza rozmowa jest zawsze bezpłatna. Omówimy Twój projekt,
                możliwości i wstępną wycenę bez żadnych zobowiązań.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="relative p-8 bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl border border-white/[0.05]">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">Wiadomość wysłana!</h3>
                  <p className="text-gray-400">
                    Dziękuję za kontakt. Odpowiem najszybciej jak to możliwe.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Imię i nazwisko *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white/[0.03] border ${
                          errors.name ? "border-red-500" : "border-white/[0.1]"
                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
                        placeholder="Jan Kowalski"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white/[0.03] border ${
                          errors.email ? "border-red-500" : "border-white/[0.1]"
                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors`}
                        placeholder="jan@firma.pl"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Telefon (opcjonalnie)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="+48 123 456 789"
                      />
                    </div>

                    {/* Budget */}
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                        Budżet (opcjonalnie)
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="" className="bg-zinc-900">Wybierz przedział</option>
                        <option value="1500-3000" className="bg-zinc-900">1 500 - 3 000 PLN</option>
                        <option value="3000-6000" className="bg-zinc-900">3 000 - 6 000 PLN</option>
                        <option value="6000-10000" className="bg-zinc-900">6 000 - 10 000 PLN</option>
                        <option value="10000+" className="bg-zinc-900">10 000+ PLN</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Temat (opcjonalnie)
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                      placeholder="np. Strona firmowa, Sklep internetowy..."
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Wiadomość *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/[0.03] border ${
                        errors.message ? "border-red-500" : "border-white/[0.1]"
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none`}
                      placeholder="Opisz swój projekt, cele i oczekiwania..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Wysyłanie...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Wyślij wiadomość
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-gray-500 text-sm">
                    Odpowiadam zwykle w ciągu 24 godzin w dni robocze.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
