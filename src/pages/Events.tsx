import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Users, Clock, Globe, Building2, Heart,
  Loader2, ChevronRight, Check, X, Filter, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { eventsApi } from '../lib/api';
import { Page } from '../types';
import { useI18n } from '../i18n';

interface EventsProps {
  onNavigate: (page: Page, params?: any) => void;
}

export default function Events({ onNavigate }: EventsProps) {
  const { t } = useI18n();

  const CATEGORIES = [
    { value: 'all', label: 'All Events' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'volunteer', label: t('events.volunteer') },
    { value: 'social', label: 'Social' },
  ];

  const TYPES = [
    { value: 'all', label: 'All Types', icon: Globe },
    { value: 'online', label: t('events.online'), icon: Globe },
    { value: 'offline', label: t('events.offline'), icon: Building2 },
    { value: 'hybrid', label: t('events.hybrid'), icon: Users },
  ];

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, selectedType]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedType !== 'all') params.type = selectedType;
      const data = await eventsApi.list(params);
      setEvents(data);
    } catch (e) {
      console.error('Failed to load events:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    setRegistering(true);
    try {
      await eventsApi.register(eventId);
      setEvents((prev) => prev.map((e) =>
        e.id === eventId
          ? { ...e, is_registered: 1, registration_count: e.registration_count + 1 }
          : e
      ));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent((prev: any) => prev ? {
          ...prev,
          is_registered: 1,
          registration_count: prev.registration_count + 1
        } : null);
      }
    } catch (e) {
      console.error('Failed to register:', e);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    setRegistering(true);
    try {
      await eventsApi.cancelRegistration(eventId);
      setEvents((prev) => prev.map((e) =>
        e.id === eventId
          ? { ...e, is_registered: 0, registration_count: e.registration_count - 1 }
          : e
      ));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent((prev: any) => prev ? {
          ...prev,
          is_registered: 0,
          registration_count: prev.registration_count - 1
        } : null);
      }
    } catch (e) {
      console.error('Failed to cancel registration:', e);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      workshop: 'bg-blue-50 text-blue-600',
      seminar: 'bg-purple-50 text-purple-600',
      meetup: 'bg-green-50 text-green-600',
      volunteer: 'bg-orange-50 text-orange-600',
      social: 'bg-pink-50 text-pink-600',
    };
    return colors[category] || 'bg-gray-50 text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online': return <Globe size={14} />;
      case 'offline': return <Building2 size={14} />;
      case 'hybrid': return <Users size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  return (
    <div className="pt-16 pb-4 px-4">
      <section className="py-4">
        <h2 className="text-2xl font-bold text-on-surface mb-1">{t('events.title')}</h2>
        <p className="text-sm text-on-surface-variant">
          {t('events.subtitle')}
        </p>
      </section>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? 'bg-primary text-white'
                : 'bg-white border border-outline-variant text-on-surface-variant'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedType === type.value
                ? 'bg-primary-light text-primary'
                : 'bg-white border border-outline-variant text-on-surface-variant'
            }`}
          >
            <type.icon size={14} />
            {type.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={48} className="text-on-surface-variant mx-auto mb-4 opacity-50" />
          <p className="text-on-surface-variant">{t('events.noEvents')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              {event.image_url && (
                <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                    {getTypeIcon(event.type)}
                    {event.type}
                  </span>
                  {event.category === 'volunteer' && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-600 font-medium">
                      <Heart size={12} /> {t('events.volunteer')}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-on-surface mb-2">{event.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{event.description}</p>

                <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(event.start_date)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {event.registration_count}
                    {event.max_participants > 0 && ` / ${event.max_participants}`}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant">
                  {event.is_registered ? (
                    <span className="flex items-center gap-1 text-success text-sm font-medium">
                      <Check size={16} /> {t('events.registered')}
                    </span>
                  ) : (
                    <span className="text-sm text-on-surface-variant">
                      {event.max_participants > 0 && event.registration_count >= event.max_participants
                        ? t('events.full')
                        : t('events.register')}
                    </span>
                  )}
                  <ChevronRight size={18} className="text-on-surface-variant" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
            >
              {selectedEvent.image_url && (
                <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-48 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(selectedEvent.category)}`}>
                    {selectedEvent.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                    {getTypeIcon(selectedEvent.type)}
                    {selectedEvent.type}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-on-surface mb-3">{selectedEvent.title}</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{selectedEvent.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={18} className="text-primary" />
                    <div>
                      <p className="font-medium">Start</p>
                      <p className="text-on-surface-variant">{formatDate(selectedEvent.start_date)}</p>
                    </div>
                  </div>
                  {selectedEvent.end_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock size={18} className="text-primary" />
                      <div>
                        <p className="font-medium">End</p>
                        <p className="text-on-surface-variant">{formatDate(selectedEvent.end_date)}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin size={18} className="text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-on-surface-variant">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.online_link && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe size={18} className="text-primary" />
                      <div>
                        <p className="font-medium">Online Link</p>
                        <a href={selectedEvent.online_link} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Users size={18} className="text-primary" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-on-surface-variant">
                        {selectedEvent.registration_count} registered
                        {selectedEvent.max_participants > 0 && ` / ${selectedEvent.max_participants} max`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registered Users */}
                {selectedEvent.registrations && selectedEvent.registrations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2">Registered Participants</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.registrations.slice(0, 10).map((reg: any) => (
                        <div key={reg.id} className="flex items-center gap-2 bg-surface-variant px-2 py-1 rounded-full">
                          <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary">
                            {reg.avatar_url ? (
                              <img src={reg.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                              reg.name.charAt(0)
                            )}
                          </div>
                          <span className="text-xs font-medium">{reg.name}</span>
                        </div>
                      ))}
                      {selectedEvent.registrations.length > 10 && (
                        <span className="text-xs text-on-surface-variant">
                          +{selectedEvent.registrations.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex-shrink-0 p-5 pt-0">
                <div className="flex gap-3">
                  {selectedEvent.is_registered ? (
                    <button
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      disabled={registering}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-error-container text-error hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {registering ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                      {t('events.cancel')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(selectedEvent.id)}
                      disabled={registering || (selectedEvent.max_participants > 0 && selectedEvent.registration_count >= selectedEvent.max_participants)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {registering ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      {selectedEvent.max_participants > 0 && selectedEvent.registration_count >= selectedEvent.max_participants
                        ? t('events.full')
                        : t('events.register')}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-3 rounded-xl font-medium bg-surface-variant text-on-surface-variant"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
