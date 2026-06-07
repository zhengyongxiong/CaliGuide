import { useState, useEffect } from 'react';
import {
  Info, CheckCircle2, FileText, Star, ClipboardCheck, UserPlus, Calendar,
  Eye, HelpCircle, Car, MapPin, ChevronDown, Bookmark, Clock, ArrowLeft,
  Landmark, CreditCard, Search, Key, HeartPulse, Loader2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { guidesApi } from '../lib/api';
import { Page, Guide as GuideType } from '../types';
import { useI18n } from '../i18n';

interface GuideProps {
  guideId: string | null;
  onNavigate: (page: Page, params?: { guideId?: string }) => void;
}

const ICON_MAP: Record<string, any> = {
  UserPlus, Calendar, Eye, HelpCircle, Car, MapPin, Search, FileText,
  ClipboardCheck, Landmark, CreditCard, Key, HeartPulse, Star,
};

function resolveStepIcon(iconName: string) {
  return ICON_MAP[iconName] || ClipboardCheck;
}

export default function Guide({ guideId, onNavigate }: GuideProps) {
  if (guideId) {
    return <GuideDetail guideId={guideId} onBack={() => onNavigate('guide')} />;
  }
  return <GuideList onNavigate={onNavigate} />;
}

// Guide List View
function GuideList({ onNavigate }: { onNavigate: (page: Page, params?: { guideId?: string }) => void }) {
  const { t } = useI18n();
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guidesApi.list().then(setGuides).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 pb-4 px-4">
      <section className="py-4">
        <h1 className="text-2xl font-bold text-on-surface mb-1">{t('guide.allGuides')}</h1>
        <p className="text-sm text-on-surface-variant">Step-by-step guides for your life in California.</p>
      </section>

      <div className="space-y-3">
        {guides.map((guide) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onNavigate('guide', { guideId: guide.id })}
            className="card overflow-hidden cursor-pointer"
          >
            {guide.image_url && (
              <img src={guide.image_url} alt={guide.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary-light text-primary px-2 py-0.5 rounded text-[10px] font-medium">
                  {guide.category}
                </span>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Clock size={12} /> {guide.read_time}
                </span>
              </div>
              <h3 className="font-semibold text-on-surface mb-1">{guide.title}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2">{guide.description}</p>
              {guide.fee && (
                <p className="text-xs text-primary font-medium mt-2">Fee: {guide.fee}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Guide Detail View
function GuideDetail({ guideId, onBack }: { guideId: string; onBack: () => void }) {
  const { t } = useI18n();
  const [guide, setGuide] = useState<GuideType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    guidesApi.get(guideId).then(setGuide).finally(() => setLoading(false));
  }, [guideId]);

  const handleSave = async () => {
    try {
      const result = await guidesApi.save(guideId);
      setSaved(result.saved);
    } catch (e) {
      console.error('Failed to save guide:', e);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="pt-20 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant">Guide not found.</p>
        <button onClick={onBack} className="mt-4 text-primary font-medium">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const steps = guide.steps || [];
  const documents = guide.documents || [];
  const faq = guide.faq || [];

  return (
    <div className="pt-16 pb-4 px-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-medium text-sm mb-4 pt-2">
        <ArrowLeft size={18} /> {t('common.back')}
      </button>

      {/* Header */}
      {guide.image_url && (
        <img src={guide.image_url} alt={guide.title} className="w-full h-48 object-cover rounded-xl mb-4" />
      )}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary-light text-primary px-2.5 py-1 rounded-full text-xs font-medium">
            {guide.category}
          </span>
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock size={12} /> {guide.read_time}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-on-surface mb-2">{guide.title}</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed">{guide.description}</p>
        {guide.fee && (
          <p className="text-sm text-primary font-medium mt-2">Fee: {guide.fee}</p>
        )}
      </div>

      {/* Overview */}
      {guide.content && (
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={18} className="text-primary" />
            <h2 className="text-base font-semibold">{t('guide.overview')}</h2>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">{guide.content}</p>
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardCheck size={18} className="text-primary" />
            <h2 className="text-base font-semibold">{t('guide.steps')}</h2>
          </div>
          <div className="space-y-3">
            {steps.map((step: any, i: number) => {
              const Icon = resolveStepIcon(step.icon);
              return (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-primary" />
            <h2 className="text-base font-semibold">{t('guide.documents')}</h2>
          </div>
          <div className="space-y-2">
            {documents.map((doc: any, i: number) => (
              <div key={i} className={`p-3 rounded-lg ${doc.special ? 'bg-warning-container' : 'bg-surface-variant'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={doc.special ? 'text-warning' : 'text-success'} />
                  <p className="text-sm font-medium">{doc.title}</p>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 ml-6">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={18} className="text-primary" />
            <h2 className="text-base font-semibold">{t('guide.faq')}</h2>
          </div>
          <div className="space-y-2">
            {faq.map((item: any, i: number) => (
              <div key={i} className="border border-outline-variant rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-3 flex items-center justify-between text-left hover:bg-surface-variant/50 transition-colors"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-on-surface-variant transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-3 pb-3 text-sm text-on-surface-variant">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors btn-press ${
            saved
              ? 'bg-primary text-white'
              : 'bg-primary-light text-primary'
          }`}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
          {saved ? t('guide.saved') : t('guide.saveGuide')}
        </button>
        {guide.category === 'DMV' && (
          <a
            href="https://www.dmv.ca.gov/portal/appointment/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-surface-variant text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <ExternalLink size={18} />
            {t('guide.findNearest')}
          </a>
        )}
      </div>
    </div>
  );
}
