import { useState, useEffect } from 'react';
import {
  Compass, Landmark, HomeIcon, Briefcase, HeartPulse, MessageSquare, Eye,
  Plus, X, Send, Loader2, Search, ArrowLeft, Flag, Check, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { forumApi } from '../lib/api';
import { Page, ForumPost, ForumReply } from '../types';
import { useI18n } from '../i18n';
import ImageUpload from '../components/ImageUpload';

interface ForumProps {
  onNavigate: (page: Page, params?: { postId?: string }) => void;
  selectedPostId: string | null;
}

export default function Forum({ onNavigate, selectedPostId }: ForumProps) {
  const { t } = useI18n();

  const CATEGORIES = [
    { label: t('forum.allTopics'), value: 'all', icon: Compass },
    { label: '#Banking', value: 'Banking', icon: Landmark },
    { label: '#Housing', value: 'Housing', icon: HomeIcon },
    { label: '#Jobs', value: 'Jobs', icon: Briefcase },
    { label: '#Health', value: 'Health', icon: HeartPulse },
  ];

  if (selectedPostId) {
    return <PostDetail postId={selectedPostId} onBack={() => {
      // Clear the selected post and navigate back to forum list
      onNavigate('forum', { postId: null as any });
    }} />;
  }
  return <ForumList onNavigate={onNavigate} categories={CATEGORIES} />;
}

// Post Detail View
function PostDetail({ postId, onBack }: { postId: string; onBack: () => void }) {
  const { t } = useI18n();
  const [post, setPost] = useState<(ForumPost & { replies: ForumReply[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    forumApi.get(postId).then(setPost).finally(() => setLoading(false));
  }, [postId]);

  const handleReply = async () => {
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    try {
      const reply = await forumApi.reply(postId, replyContent);
      setPost((prev) => prev ? { ...prev, replies: [...prev.replies, reply] } : prev);
      setReplyContent('');
    } catch (e) {
      console.error('Reply failed:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || reporting) return;
    setReporting(true);
    try {
      await forumApi.reportPost(postId, reportReason.trim());
      setReported(true);
      setShowReport(false);
      setReportReason('');
    } catch (e) {
      console.error('Report failed:', e);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-20 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant">Post not found.</p>
        <button onClick={onBack} className="mt-4 text-primary font-medium">
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-28 px-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-medium text-sm mb-4 pt-2">
        <ArrowLeft size={18} /> {t('common.back')}
      </button>

      {/* Post */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              post.author_name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{post.author_name}</p>
            <p className="text-xs text-on-surface-variant">{post.time}</p>
          </div>
          <span className="bg-accent-container text-accent px-2.5 py-1 rounded-full text-[10px] font-medium">
            #{post.category}
          </span>
        </div>
        <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-outline-variant text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <MessageSquare size={14} /> {post.replies?.length || 0} {t('common.replies')}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} /> {post.views} {t('common.views')}
          </span>
          {!reported ? (
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1 text-error hover:underline ml-auto"
            >
              <Flag size={14} /> {t('forum.report')}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-success ml-auto">
              <Check size={14} /> {t('forum.reported')}
            </span>
          )}
        </div>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag: string, i: number) => (
              <span key={i} className="bg-surface-variant px-2 py-0.5 rounded text-[10px] font-medium text-on-surface-variant">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-3">
          {t('common.replies')} ({post.replies?.length || 0})
        </h3>
        <div className="space-y-2">
          {post.replies?.map((reply) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center text-xs font-bold">
                  {reply.author_avatar ? (
                    <img src={reply.author_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    reply.author_name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium">{reply.author_name}</p>
                  <p className="text-[10px] text-on-surface-variant">{reply.time}</p>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant">{reply.content}</p>
            </motion.div>
          ))}
          {(!post.replies || post.replies.length === 0) && (
            <p className="text-sm text-on-surface-variant text-center py-4">
              No replies yet. Be the first to respond!
            </p>
          )}
        </div>
      </div>

      {/* Reply Input */}
      <div className="fixed bottom-0 left-0 w-full px-4 z-[90] bg-gradient-to-t from-background via-background to-background/80 pt-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-outline-variant rounded-xl p-2 flex items-center gap-2 shadow-xl">
            <input
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-3"
              placeholder={t('forum.writeReply')}
            />
            <button
              onClick={handleReply}
              disabled={submitting || !replyContent.trim()}
              className="bg-primary text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl p-5"
            >
              <h3 className="text-lg font-semibold mb-3">{t('forum.reportPost')}</h3>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={t('forum.reportReason')}
                rows={3}
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none mb-4"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowReport(false)}
                  className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-variant rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleReport}
                  disabled={reporting || !reportReason.trim()}
                  className="px-4 py-2 text-sm font-medium bg-error text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {reporting ? '...' : t('forum.submitReport')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Forum List View
function ForumList({ onNavigate, categories }: { onNavigate: (page: Page, params?: { postId?: string }) => void; categories: any[] }) {
  const { t } = useI18n();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPosts = async (category?: string, search?: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;
      const data = await forumApi.list(params);
      setPosts(data);
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(activeCategory);
  }, [activeCategory]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadPosts(activeCategory, searchQuery.trim());
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || creating) return;
    setCreating(true);
    try {
      const created = await forumApi.create(newPost);
      setPosts((prev) => [created, ...prev]);
      setShowCreateForm(false);
      setNewPost({ title: '', content: '', category: 'General' });
    } catch (e) {
      console.error('Failed to create post:', e);
    } finally {
      setCreating(false);
    }
  };

  const tags = ['#VisaProcessing', '#DriverLicense', '#RentalMarket', '#SocialSecurity'];

  return (
    <div className="pt-16 pb-4">
      <section className="px-4 py-4">
        <h2 className="text-2xl font-bold text-on-surface mb-1">{t('forum.title')}</h2>
        <p className="text-sm text-on-surface-variant">{t('forum.subtitle')}</p>
      </section>

      {/* Search */}
      <section className="px-4 mb-4">
        <div className="flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('common.search') + '...'}
            className="flex-1 h-10 px-4 bg-white border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-4 rounded-lg font-medium text-sm"
          >
            <Search size={16} />
          </button>
        </div>
      </section>

      {/* Category Scroll */}
      <section className="mb-4">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="px-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setSearchQuery(tag); loadPosts(activeCategory, tag); }}
              className="bg-surface-variant px-2.5 py-1 rounded-full text-[10px] font-medium text-on-surface-variant hover:bg-primary-light hover:text-primary transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Posts */}
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-on-surface-variant py-12">No posts found.</p>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onNavigate('forum', { postId: post.id })}
              className="card p-4 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-medium">
                  {post.category}
                </span>
                <p className="text-xs text-on-surface-variant">
                  {post.author_name} · {post.time}
                </p>
              </div>
              <h4 className="font-medium text-on-surface text-sm">{post.title}</h4>
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-outline-variant">
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <MessageSquare size={12} /> {post.reply_count}
                </span>
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <Eye size={12} /> {post.views}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-dark transition-colors z-40 btn-press"
      >
        <Plus size={24} />
      </button>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('forum.createPost')}</h3>
                <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-surface-variant rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-on-surface-variant">{t('forum.postTitle')}</span>
                  <input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="What's your question?"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-on-surface-variant">{t('forum.postCategory')}</span>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Banking">Banking</option>
                    <option value="Housing">Housing</option>
                    <option value="Jobs">Jobs</option>
                    <option value="Health">Health</option>
                    <option value="DMV">DMV</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-on-surface-variant">{t('forum.postContent')}</span>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                    className="mt-1 w-full border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Describe your question..."
                  />
                </label>

                <div>
                  <span className="text-xs font-medium text-on-surface-variant">Image (optional)</span>
                  <div className="mt-1">
                    <ImageUpload
                      onUpload={(imageUrl) => {
                        // Store image URL for later use
                        console.log('Image uploaded:', imageUrl);
                      }}
                      maxSize={5}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={creating || !newPost.title.trim() || !newPost.content.trim()}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 btn-press"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  {t('forum.createPost')}
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
