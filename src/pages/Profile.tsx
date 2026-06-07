import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Bookmark, Camera, FileCheck, LockKeyhole, LogOut, MessageSquare,
  Settings, UserRound, Plus, Trash2, Check, Loader2, ExternalLink,
  Shield, MessageCircle, ChevronRight, Bell, Calendar, Clock, Info, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { readAvatarFile } from '../lib/avatarUpload';
import { profileApi, guidesApi, forumApi, remindersApi } from '../lib/api';
import { Page, ChecklistItem, SavedGuide, ForumPost } from '../types';
import { useI18n } from '../i18n';
import FeedbackForm from '../components/FeedbackForm';

interface ProfileProps {
  onNavigate: (page: Page, params?: any) => void;
}

type MenuSection = 'checklist' | 'saved' | 'posts' | 'reminders' | 'settings' | null;

export default function Profile({ onNavigate }: ProfileProps) {
  const { t } = useI18n();
  const { currentUser, logout, updateAccount, updatePassword } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [activeSection, setActiveSection] = useState<MenuSection>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Saved guides state
  const [savedGuides, setSavedGuides] = useState<SavedGuide[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  // My posts state
  const [myPosts, setMyPosts] = useState<ForumPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState<any[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', due_date: '', type: 'general' });

  // Settings state
  const [language, setLanguage] = useState(() => localStorage.getItem('caliguide-lang') || 'en');

  useEffect(() => {
    setName(currentUser?.name ?? '');
    setAvatarUrl(currentUser?.avatarUrl ?? '');
  }, [currentUser]);

  useEffect(() => {
    if (activeSection === 'checklist' && checklist.length === 0) {
      setChecklistLoading(true);
      profileApi.getChecklist().then(setChecklist).finally(() => setChecklistLoading(false));
    }
    if (activeSection === 'saved' && savedGuides.length === 0) {
      setSavedLoading(true);
      guidesApi.savedList().then(setSavedGuides).finally(() => setSavedLoading(false));
    }
    if (activeSection === 'posts' && myPosts.length === 0) {
      setPostsLoading(true);
      forumApi.userPosts().then(setMyPosts).finally(() => setPostsLoading(false));
    }
    if (activeSection === 'reminders' && reminders.length === 0) {
      setRemindersLoading(true);
      remindersApi.list().then(setReminders).finally(() => setRemindersLoading(false));
    }
  }, [activeSection]);

  const handleAddReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.due_date) return;
    try {
      const reminder = await remindersApi.create(newReminder);
      setReminders((prev) => [reminder, ...prev]);
      setNewReminder({ title: '', due_date: '', type: 'general' });
    } catch (e) {
      console.error('Failed to add reminder:', e);
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await remindersApi.complete(id);
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, completed: 1 } : r));
    } catch (e) {
      console.error('Failed to complete reminder:', e);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await remindersApi.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Failed to delete reminder:', e);
    }
  };

  const menuItems = [
    {
      id: 'checklist' as MenuSection,
      title: t('profile.checklist'),
      desc: `${checklist.filter((i) => i.checked).length} of ${checklist.length || '...'} completed`,
      icon: FileCheck,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'saved' as MenuSection,
      title: t('profile.savedGuides'),
      desc: `${savedGuides.length || '...'} saved`,
      icon: Bookmark,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'reminders' as MenuSection,
      title: 'Reminders',
      desc: `${reminders.filter((r) => !r.completed).length || '0'} upcoming`,
      icon: Bell,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      id: 'posts' as MenuSection,
      title: t('profile.myPosts'),
      desc: `${myPosts.length || '...'} posts`,
      icon: MessageSquare,
      color: 'bg-green-50 text-green-600',
    },
    {
      id: 'settings' as MenuSection,
      title: t('profile.settings'),
      desc: t('settings.language'),
      icon: Settings,
      color: 'bg-gray-50 text-gray-600',
    },
  ];

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage('');
    try {
      updateAccount({ name, avatarUrl });
      setProfileMessage(t('common.save') + ' ✓');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Error');
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileMessage('');
    try {
      const uploadedAvatarUrl = await readAvatarFile(file);
      setAvatarUrl(uploadedAvatarUrl);
      setProfileMessage('Ready to save');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      event.target.value = '';
    }
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage('');
    try {
      updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage(t('common.save') + ' ✓');
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : 'Error');
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newItemName.trim()) return;
    try {
      const item = await profileApi.addChecklistItem(newItemName.trim());
      setChecklist((prev) => [...prev, item]);
      setNewItemName('');
    } catch (e) {
      console.error('Failed to add item:', e);
    }
  };

  const handleToggleChecklistItem = async (id: string) => {
    try {
      const result = await profileApi.toggleChecklistItem(id);
      setChecklist((prev) => prev.map((item) => item.id === id ? { ...item, checked: result.checked } : item));
    } catch (e) {
      console.error('Failed to toggle item:', e);
    }
  };

  const handleDeleteChecklistItem = async (id: string) => {
    try {
      await profileApi.deleteChecklistItem(id);
      setChecklist((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Failed to delete item:', e);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('caliguide-lang', lang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  const toggleSection = (section: MenuSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="pt-16 pb-4 px-4">
      {/* Avatar & Info */}
      <section className="flex flex-col items-center py-6">
        <div className="relative mb-3">
          <img
            alt={currentUser.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-surface-variant"
            src={avatarUrl}
          />
          <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-2 border-white shadow cursor-pointer hover:bg-primary-dark transition-colors">
            <Camera size={14} />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
          </label>
        </div>
        <h2 className="text-xl font-semibold text-on-surface">{currentUser.name}</h2>
        <p className="text-sm text-on-surface-variant">{currentUser.email}</p>
        <p className="text-xs text-on-surface-variant mt-1">
          {t('profile.memberSince')} {currentUser.memberSince}
        </p>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowFeedback(true)}
          className="card p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <MessageCircle size={20} className="text-orange-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-on-surface">Feedback</p>
            <p className="text-[10px] text-on-surface-variant">Report bugs</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('about')}
          className="card p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Info size={20} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-on-surface">About</p>
            <p className="text-[10px] text-on-surface-variant">About CaliGuide</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('help')}
          className="card p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <HelpCircle size={20} className="text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-on-surface">Help</p>
            <p className="text-[10px] text-on-surface-variant">FAQ & Support</p>
          </div>
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className="card p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-on-surface">Admin</p>
              <p className="text-[10px] text-on-surface-variant">Dashboard</p>
            </div>
          </button>
        )}
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleProfileSubmit} className="card p-4 mb-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <UserRound size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">{t('profile.editProfile')}</h3>
            <p className="text-xs text-on-surface-variant">{t('profile.editProfileDesc')}</p>
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-on-surface-variant">{t('profile.name')}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-on-surface-variant">{t('profile.avatarUrl')}</span>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {profileMessage && (
          <p className="text-sm font-medium text-primary">{profileMessage}</p>
        )}
        <button className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors btn-press">
          {t('profile.saveProfile')}
        </button>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordSubmit} className="card p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
            <LockKeyhole size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-on-surface">{t('profile.password')}</h3>
            <p className="text-xs text-on-surface-variant">{t('profile.passwordDesc')}</p>
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-on-surface-variant">{t('profile.currentPassword')}</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-on-surface-variant">{t('profile.newPassword')}</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {passwordMessage && (
          <p className="text-sm font-medium text-primary">{passwordMessage}</p>
        )}
        <button className="w-full border border-primary text-primary py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors btn-press">
          {t('profile.changePassword')}
        </button>
      </form>

      {/* Menu Sections */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.id} className="card overflow-hidden">
            <button
              onClick={() => toggleSection(item.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-on-surface">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className={`text-on-surface-variant transition-transform duration-200 ${
                  activeSection === item.id ? 'rotate-90' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {activeSection === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-outline-variant">
                    {/* Document Checklist */}
                    {item.id === 'checklist' && (
                      <div className="pt-3">
                        {checklistLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2 mb-3">
                              {checklist.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-3 py-2">
                                  <button
                                    onClick={() => handleToggleChecklistItem(doc.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      doc.checked ? 'bg-success border-success text-white' : 'border-outline-variant'
                                    }`}
                                  >
                                    {doc.checked && <Check size={14} />}
                                  </button>
                                  <span className={`flex-1 text-sm ${doc.checked ? 'line-through text-on-surface-variant' : ''}`}>
                                    {doc.name}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteChecklistItem(doc.id)}
                                    className="text-on-surface-variant hover:text-error p-1"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                                placeholder={t('profile.addDocument')}
                                className="flex-1 h-10 px-3 border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                              <button
                                onClick={handleAddChecklistItem}
                                className="bg-primary text-white px-3 rounded-lg btn-press"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                const text = checklist.map((doc) =>
                                  `${doc.checked ? '✓' : '○'} ${doc.name}`
                                ).join('\n');
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'document-checklist.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors"
                            >
                              <ExternalLink size={14} /> {t('export.checklist')}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Saved Guides */}
                    {item.id === 'saved' && (
                      <div className="pt-3">
                        {savedLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        ) : savedGuides.length === 0 ? (
                          <p className="text-sm text-on-surface-variant text-center py-4">{t('empty.noSaved')}</p>
                        ) : (
                          <div className="space-y-2">
                            {savedGuides.map((guide) => (
                              <div
                                key={guide.id}
                                onClick={() => onNavigate('guide', { guideId: guide.id })}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-variant cursor-pointer"
                              >
                                {guide.image_url ? (
                                  <img src={guide.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                                    <Bookmark size={16} className="text-primary" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{guide.title}</p>
                                  <p className="text-[10px] text-on-surface-variant">{guide.category}</p>
                                </div>
                                <ExternalLink size={14} className="text-on-surface-variant" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* My Posts */}
                    {item.id === 'posts' && (
                      <div className="pt-3">
                        {postsLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        ) : myPosts.length === 0 ? (
                          <p className="text-sm text-on-surface-variant text-center py-4">{t('empty.noPosts')}</p>
                        ) : (
                          <div className="space-y-2">
                            {myPosts.map((post) => (
                              <div
                                key={post.id}
                                onClick={() => onNavigate('forum', { postId: post.id })}
                                className="p-2 rounded-lg hover:bg-surface-variant cursor-pointer"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-medium bg-surface-variant px-2 py-0.5 rounded">
                                    {post.category}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant">{post.time}</span>
                                </div>
                                <p className="text-sm font-medium">{post.title}</p>
                                <p className="text-xs text-on-surface-variant mt-1">
                                  {post.reply_count} replies · {post.views} views
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reminders */}
                    {item.id === 'reminders' && (
                      <div className="pt-3">
                        {remindersLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2 mb-3">
                              {reminders.map((reminder) => (
                                <div key={reminder.id} className={`flex items-center gap-3 p-2 rounded-lg ${reminder.completed ? 'opacity-50' : ''}`}>
                                  <button
                                    onClick={() => handleCompleteReminder(reminder.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      reminder.completed ? 'bg-success border-success text-white' : 'border-outline-variant'
                                    }`}
                                  >
                                    {reminder.completed && <Check size={14} />}
                                  </button>
                                  <div className="flex-1">
                                    <p className={`text-sm ${reminder.completed ? 'line-through text-on-surface-variant' : 'font-medium'}`}>
                                      {reminder.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                                        <Calendar size={10} /> {reminder.due_date}
                                      </span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        reminder.type === 'visa' ? 'bg-blue-50 text-blue-600' :
                                        reminder.type === 'appointment' ? 'bg-purple-50 text-purple-600' :
                                        reminder.type === 'document' ? 'bg-green-50 text-green-600' :
                                        'bg-gray-50 text-gray-600'
                                      }`}>
                                        {reminder.type}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteReminder(reminder.id)}
                                    className="text-on-surface-variant hover:text-error p-1"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              {reminders.length === 0 && (
                                <p className="text-sm text-on-surface-variant text-center py-4">{t('empty.noReminders')}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                value={newReminder.title}
                                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                                placeholder="Reminder title"
                                className="flex-1 h-10 px-3 border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                              <input
                                type="date"
                                value={newReminder.due_date}
                                onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                                className="w-32 h-10 px-2 border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                              <select
                                value={newReminder.type}
                                onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                                className="w-24 h-10 px-2 border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                              >
                                <option value="general">General</option>
                                <option value="visa">Visa</option>
                                <option value="appointment">Appt</option>
                                <option value="document">Doc</option>
                              </select>
                              <button
                                onClick={handleAddReminder}
                                className="bg-primary text-white px-3 rounded-lg btn-press"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Settings */}
                    {item.id === 'settings' && (
                      <div className="pt-3 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-on-surface-variant">
                            {t('settings.language')}
                          </label>
                          <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                          >
                            <option value="en">🇺🇸 English</option>
                            <option value="zh-CN">🇨🇳 简体中文</option>
                            <option value="zh-TW">🇹🇼 繁體中文</option>
                            <option value="yue">🇭🇰 粤语</option>
                            <option value="es">🇪🇸 Español</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Sign Out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-4 text-error font-medium rounded-xl border border-error/20 bg-error/5 hover:bg-error/10 transition-colors mt-6"
        >
          <LogOut size={18} />
          {t('profile.signOut')}
        </button>
      </div>

      {/* Feedback Form Modal */}
      <FeedbackForm isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </div>
  );
}
