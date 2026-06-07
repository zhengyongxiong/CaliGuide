import { useState } from 'react';
import {
  HelpCircle, ChevronDown, ChevronRight, Search,
  Book, MessageSquare, Phone, Mail, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import { useI18n } from '../i18n';

interface HelpProps {
  onNavigate: (page: Page, params?: any) => void;
}

const FAQ_ITEMS = [
  {
    question: 'How do I apply for a Social Security Number (SSN)?',
    answer: 'Visit your nearest Social Security Administration office with your passport, visa, and I-94 form. Complete Form SS-5 at the office. You should receive your SSN card by mail in 2-4 weeks.',
  },
  {
    question: 'Can I work in the US while my visa application is pending?',
    answer: 'It depends on your visa type. Some visas allow work authorization while others do not. Check with an immigration attorney or visit USCIS.gov for specific visa requirements.',
  },
  {
    question: 'How do I open a bank account without an SSN?',
    answer: 'Some banks accept an ITIN (Individual Taxpayer Identification Number) or passport for non-residents. Banks like Chase, Bank of America, and Wells Fargo have programs for newcomers.',
  },
  {
    question: 'What health insurance options are available for immigrants?',
    answer: 'Options include Covered California (state marketplace), employer-sponsored plans, and Medi-Cal for eligible residents. Your eligibility depends on your immigration status and income.',
  },
  {
    question: 'How do I find a good immigration lawyer?',
    answer: 'Use the State Bar of California website to verify licenses. Many non-profits offer free or low-cost legal services. Avoid notarios who are not authorized to practice law.',
  },
  {
    question: 'What documents should I always carry with me?',
    answer: 'Always carry your passport, visa, I-94 record, and work authorization documents. Keep copies in a safe place and digital copies in your email or cloud storage.',
  },
  {
    question: 'How do I get a California driver\'s license?',
    answer: 'Complete the DL 44 form online, schedule a DMV appointment, bring required documents (passport, SSN, proof of residency), pass the vision and written tests, then schedule a driving test.',
  },
  {
    question: 'What are my rights as an immigrant in California?',
    answer: 'California has strong protections for immigrants. You have the right to remain silent, the right to an attorney, and protection against discrimination in housing and employment.',
  },
];

export default function Help({ onNavigate }: HelpProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaq = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-16 pb-4 px-4">
      {/* Header */}
      <section className="py-6 text-center">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Help Center</h1>
        <p className="text-sm text-on-surface-variant">
          Find answers to common questions about immigration and life in California
        </p>
      </section>

      {/* Search */}
      <section className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-outline-variant rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-on-surface mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {filteredFaq.map((item, index) => (
            <div key={index} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-variant/50 transition-colors"
              >
                <span className="text-sm font-medium text-on-surface pr-4">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-on-surface-variant transition-transform flex-shrink-0 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-on-surface mb-4">Quick Links</h2>
        <div className="space-y-2">
          <a
            href="https://www.uscis.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Book size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">USCIS Website</p>
                <p className="text-xs text-on-surface-variant">Official immigration information</p>
              </div>
            </div>
            <ExternalLink size={16} className="text-on-surface-variant" />
          </a>
          <a
            href="https://www.dmv.ca.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Book size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">California DMV</p>
                <p className="text-xs text-on-surface-variant">Driver's license and vehicle registration</p>
              </div>
            </div>
            <ExternalLink size={16} className="text-on-surface-variant" />
          </a>
          <a
            href="https://www.coveredca.com"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Book size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium">Covered California</p>
                <p className="text-xs text-on-surface-variant">Health insurance marketplace</p>
              </div>
            </div>
            <ExternalLink size={16} className="text-on-surface-variant" />
          </a>
        </div>
      </section>

      {/* Contact Support */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-on-surface mb-4">Contact Support</h2>
        <div className="card p-4 space-y-4">
          <p className="text-sm text-on-surface-variant">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('chatbot')}
              className="flex items-center gap-2 p-3 bg-primary-light rounded-xl text-primary font-medium text-sm"
            >
              <MessageSquare size={18} />
              Chat with CaliBot
            </button>
            <a
              href="mailto:support@caliguide.com"
              className="flex items-center gap-2 p-3 bg-surface-variant rounded-xl text-on-surface font-medium text-sm"
            >
              <Mail size={18} />
              Email Support
            </a>
          </div>
        </div>
      </section>

      {/* Emergency */}
      <section className="mb-8">
        <div className="card p-4 bg-error-container">
          <h3 className="font-semibold text-error mb-2">Emergency?</h3>
          <p className="text-sm text-on-surface-variant mb-3">
            If you're in immediate danger or need emergency assistance:
          </p>
          <div className="flex gap-2">
            <a
              href="tel:911"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-error text-white rounded-xl font-medium text-sm"
            >
              <Phone size={16} /> Call 911
            </a>
            <a
              href="tel:211"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-on-surface rounded-xl font-medium text-sm border border-outline-variant"
            >
              <Phone size={16} /> Call 211
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
