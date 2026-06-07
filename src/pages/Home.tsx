import { useState, useEffect, useCallback } from 'react';
import { Search, Car, Landmark, HomeIcon, HeartPulse, Clock, ChevronRight, MessageSquare, Loader2, TrendingUp, Bell, Info, AlertTriangle } from 'lucide-react';
import { Page, ForumPost } from '../types';
import { guidesApi, forumApi, publicApi } from '../lib/api';
import { useI18n } from '../i18n';

interface SearchResult {
  id: string;
  type: 'guide' | 'forum';
  title: string;
  description?: string;
  content?: string;
  category: string;
  image_url?: string;
  read_time?: string;
  reply_count?: number;
  views?: number;
  time?: string;
}

interface HomeProps {
  onNavigate: (page: Page, params?: { guideId?: string; postId?: string; search?: string }) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { t } = useI18n();
  const [guides, setGuides] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<ForumPost[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const categories = [
    { id: 'DMV', icon: Car, label: t('cat.dmv'), color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { id: 'Banking', icon: Landmark, label: t('cat.banking'), color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'Housing', icon: HomeIcon, label: t('cat.housing'), color: 'bg-green-50 text-green-600 border-green-100' },
    { id: 'Health', icon: HeartPulse, label: t('cat.health'), color: 'bg-red-50 text-red-600 border-red-100' },
  ];

  useEffect(() => {
    Promise.all([
      guidesApi.list(),
      forumApi.list(),
      publicApi.getAnnouncements(),
    ]).then(([guidesData, postsData, announcementsData]) => {
      setGuides(guidesData);
      setTrendingPosts(postsData.slice(0, 3));
      setAnnouncements(announcementsData);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const [guidesData, postsData] = await Promise.all([
        guidesApi.list({ search: query.trim() }),
        forumApi.list({ search: query.trim() }),
      ]);

      const combinedResults: SearchResult[] = [
        ...guidesData.map((g: any) => ({
          id: g.id,
          type: 'guide' as const,
          title: g.title,
          description: g.description,
          category: g.category,
          image_url: g.image_url,
          read_time: g.read_time,
        })),
        ...postsData.map((p: any) => ({
          id: p.id,
          type: 'forum' as const,
          title: p.title,
          content: p.content,
          category: p.category,
          reply_count: p.reply_count,
          views: p.views,
          time: p.time,
        })),
      ];
      setSearchResults(combinedResults);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleCategoryClick = async (category: string) => {
    setSearching(true);
    try {
      const results = await guidesApi.list({ category });
      setSearchResults(results.map((g: any) => ({ ...g, type: 'guide' as const })));
      setSearchQuery('');
    } catch (e) {
      console.error('Category filter failed:', e);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 pb-4">
      {/* Announcements */}
      {announcements.length > 0 && searchResults === null && (
        <section className="px-4 py-2">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-3 rounded-xl mb-2 flex items-start gap-3 ${
                announcement.type === 'important' ? 'bg-error-container' :
                announcement.type === 'warning' ? 'bg-warning-container' :
                'bg-primary-light'
              }`}
            >
              {announcement.type === 'important' ? (
                <AlertTriangle size={18} className="text-error flex-shrink-0 mt-0.5" />
              ) : announcement.type === 'warning' ? (
                <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
              ) : (
                <Info size={18} className="text-primary flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">{announcement.title}</p>
                <p className="text-xs text-on-surface-variant mt-1">{announcement.content}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Search Section */}
      <section className="px-4 py-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full h-12 pl-11 pr-4 bg-white border border-outline-variant rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          {searching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
          )}
        </div>
      </section>

      {/* Search Results */}
      {searchResults !== null && (
        <section className="px-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-on-surface">
              {t('common.search')} ({searchResults.length})
            </h2>
            <button
              onClick={() => { setSearchResults(null); setSearchQuery(''); }}
              className="text-sm text-primary font-medium"
            >
              {t('common.cancel')}
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-on-surface-variant">No results found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => {
                    if (result.type === 'guide') {
                      onNavigate('guide', { guideId: result.id });
                    } else {
                      onNavigate('forum', { postId: result.id });
                    }
                  }}
                  className="card p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      result.type === 'guide'
                        ? 'bg-primary-light text-primary'
                        : 'bg-accent-container text-accent'
                    }`}>
                      {result.type === 'guide' ? 'Guide' : 'Forum'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{result.category}</span>
                  </div>
                  <h3 className="font-medium text-on-surface text-sm">{result.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                    {result.description || result.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories */}
      {searchResults === null && (
        <section className="px-4 mb-6">
          <h2 className="text-base font-semibold text-on-surface mb-3">{t('home.categories')}</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${cat.color} group-hover:scale-105 transition-transform`}>
                  <cat.icon size={24} />
                </div>
                <span className="text-xs font-medium text-on-surface-variant">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Guides */}
      {searchResults === null && (
        <section className="mb-6">
          <div className="px-4 flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-on-surface">{t('home.recommended')}</h2>
            <button
              onClick={() => onNavigate('guide')}
              className="text-sm text-primary font-medium"
            >
              {t('home.seeAll')}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {guides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onNavigate('guide', { guideId: guide.id })}
                className="min-w-[240px] card overflow-hidden cursor-pointer flex-shrink-0"
              >
                {guide.image_url && (
                  <img src={guide.image_url} alt={guide.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                  <span className="text-[10px] font-semibold text-primary uppercase">{guide.category}</span>
                  <h3 className="font-medium text-on-surface text-sm mt-1 line-clamp-2">{guide.title}</h3>
                  <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
                    <Clock size={12} />
                    <span className="text-[10px]">{guide.read_time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Questions */}
      {searchResults === null && (
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-on-surface">{t('home.trending')}</h2>
          </div>
          <div className="space-y-2">
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate('forum', { postId: post.id })}
                className="card p-4 cursor-pointer"
              >
                <h4 className="font-medium text-on-surface text-sm">{post.title}</h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} /> {post.reply_count} {t('common.replies')}
                  </span>
                  <span>{post.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
