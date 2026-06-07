import { useState } from 'react';
import { MessageSquare, Send, X, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { feedbackApi } from '../lib/api';
import { useI18n } from '../i18n';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const { t } = useI18n();

  const CATEGORIES = [
    { value: 'bug', label: t('feedback.bug'), icon: Bug, color: 'text-error' },
    { value: 'feature', label: t('feedback.feature'), icon: Lightbulb, color: 'text-primary' },
    { value: 'general', label: t('feedback.general'), icon: HelpCircle, color: 'text-secondary' },
    { value: 'other', label: t('feedback.other'), icon: MessageSquare, color: 'text-on-surface-variant' },
  ];
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await feedbackApi.submit({ category, subject: subject.trim(), message: message.trim() });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSubject('');
        setMessage('');
        setCategory('general');
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{t('feedback.title')}</h3>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success-container rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-on-surface">{t('feedback.thankYou')}</p>
                <p className="text-sm text-on-surface-variant mt-1">{t('feedback.submitted')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-on-surface-variant">{t('feedback.category')}</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                          category === cat.value
                            ? 'border-primary bg-primary-container'
                            : 'border-outline-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <cat.icon size={18} className={category === cat.value ? 'text-primary' : cat.color} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-on-surface-variant">{t('feedback.subject')}</span>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Brief description..."
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-on-surface-variant">{t('feedback.message')}</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Tell us more..."
                  />
                </label>

                {error && (
                  <p className="text-sm text-error font-medium">{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !subject.trim() || !message.trim()}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 btn-press"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {t('feedback.submit')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
