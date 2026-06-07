import { useState, useEffect } from 'react';
import {
  Users, FileText, MessageSquare, Flag, Bug, Settings,
  Trash2, Check, X, Loader2, Pin, Eye, EyeOff, Shield,
  BarChart3, Clock, AlertTriangle, CheckCircle, XCircle,
  Plus, Edit, ChevronRight, Bell, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminApi } from '../lib/api';
import { useI18n } from '../i18n';

type Tab = 'overview' | 'posts' | 'users' | 'guides' | 'events' | 'reports' | 'feedback' | 'announcements' | 'logs';

export default function AdminDashboard() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, postsData, usersData, guidesData, eventsData, reportsData, feedbackData, announcementsData, logsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllPosts(),
        adminApi.getUsers(),
        adminApi.getGuides(),
        adminApi.getEvents(),
        adminApi.getReports(),
        adminApi.getFeedback(),
        adminApi.getAnnouncements(),
        adminApi.getLogs(),
      ]);
      setStats(statsData);
      setPosts(postsData);
      setUsers(usersData);
      setGuides(guidesData);
      setEvents(eventsData);
      setReports(reportsData);
      setFeedback(feedbackData);
      setAnnouncements(announcementsData);
      setLogs(logsData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePostStatus = async (id: string, status: string) => {
    await adminApi.updatePostStatus(id, status);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    if (stats) {
      setStats((prev: any) => ({
        ...prev,
        pendingPosts: status === 'pending' ? prev.pendingPosts + 1 : prev.pendingPosts - 1,
        approvedPosts: status === 'approved' ? prev.approvedPosts + 1 : prev.approvedPosts,
      }));
    }
  };

  const handlePinPost = async (id: string, pinned: boolean) => {
    await adminApi.pinPost(id, pinned);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, pinned: pinned ? 1 : 0 } : p));
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await adminApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleUpdateUserStatus = async (id: string, status: string) => {
    await adminApi.updateUserStatus(id, status);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    await adminApi.updateUserRole(id, role);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  };

  const handleUpdateReportStatus = async (id: string, status: string) => {
    await adminApi.updateReportStatus(id, status);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const handleUpdateFeedbackStatus = async (id: string, status: string) => {
    await adminApi.updateFeedbackStatus(id, status);
    setFeedback((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
  };

  if (loading) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'posts' as Tab, label: 'Posts', icon: MessageSquare, badge: stats?.pendingPosts },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'guides' as Tab, label: 'Guides', icon: FileText },
    { id: 'events' as Tab, label: 'Events', icon: Calendar },
    { id: 'reports' as Tab, label: 'Reports', icon: Flag, badge: stats?.pendingReports },
    { id: 'feedback' as Tab, label: 'Feedback', icon: Bug, badge: stats?.newFeedback },
    { id: 'announcements' as Tab, label: 'Announcements', icon: Bell },
    { id: 'logs' as Tab, label: 'Logs', icon: Clock },
  ];

  return (
    <div className="pt-16 pb-4 px-4">
      <section className="py-4">
        <h2 className="text-2xl font-bold text-on-surface mb-1">{t('admin.dashboard')}</h2>
        <p className="text-sm text-on-surface-variant">{t('admin.manageContent')}</p>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.badge ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-50 text-blue-600" />
            <StatCard icon={MessageSquare} label="Total Posts" value={stats.totalPosts} color="bg-green-50 text-green-600" />
            <StatCard icon={FileText} label="Guides" value={stats.totalGuides} color="bg-purple-50 text-purple-600" />
            <StatCard icon={Flag} label="Pending Reports" value={stats.pendingReports} color={stats.pendingReports > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'} />
          </div>

          {/* User Status Breakdown */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">User Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Active Users</span>
                  <span className="font-medium text-success">{stats.activeUsers}</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Disabled Users</span>
                  <span className="font-medium text-error">{stats.disabledUsers}</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div
                    className="bg-error h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.disabledUsers / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Post Status Breakdown */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Post Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Approved Posts</span>
                  <span className="font-medium text-success">{stats.approvedPosts}</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalPosts > 0 ? (stats.approvedPosts / stats.totalPosts) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Pending Posts</span>
                  <span className="font-medium text-warning">{stats.pendingPosts}</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full transition-all"
                    style={{ width: `${stats.totalPosts > 0 ? (stats.pendingPosts / stats.totalPosts) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Overview */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Content Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-surface-variant rounded-xl">
                <p className="text-2xl font-bold text-primary">{stats.publishedGuides}</p>
                <p className="text-xs text-on-surface-variant">Published Guides</p>
              </div>
              <div className="text-center p-3 bg-surface-variant rounded-xl">
                <p className="text-2xl font-bold text-primary">{stats.totalReplies}</p>
                <p className="text-xs text-on-surface-variant">Total Replies</p>
              </div>
              <div className="text-center p-3 bg-surface-variant rounded-xl">
                <p className="text-2xl font-bold text-primary">{stats.totalFeedback}</p>
                <p className="text-xs text-on-surface-variant">Feedback</p>
              </div>
              <div className="text-center p-3 bg-surface-variant rounded-xl">
                <p className="text-2xl font-bold text-primary">{stats.newFeedback}</p>
                <p className="text-xs text-on-surface-variant">New Feedback</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('posts')}
                className="p-3 bg-warning-container text-warning rounded-xl text-sm font-medium text-center hover:opacity-90 transition-opacity"
              >
                Review Posts ({stats.pendingPosts})
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="p-3 bg-error-container text-error rounded-xl text-sm font-medium text-center hover:opacity-90 transition-opacity"
              >
                View Reports ({stats.pendingReports})
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className="p-3 bg-primary-light text-primary rounded-xl text-sm font-medium text-center hover:opacity-90 transition-opacity"
              >
                Check Feedback ({stats.newFeedback})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="p-3 bg-success-container text-success rounded-xl text-sm font-medium text-center hover:opacity-90 transition-opacity"
              >
                Manage Users
              </button>
            </div>
          </div>

          {/* Data Export */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Data Export</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8,"
                    + "Name,Email,Role,Status,Joined\n"
                    + users.map(u => `${u.name},${u.email},${u.role},${u.status},${u.member_since}`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "users_export.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full p-3 bg-surface-variant text-on-surface-variant rounded-xl text-sm font-medium text-center hover:bg-surface-container-high transition-colors"
              >
                Export Users (CSV)
              </button>
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8,"
                    + "Title,Category,Author,Status,Created\n"
                    + posts.map(p => `"${p.title}",${p.category},${p.author_name},${p.status},${p.created_at}`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "posts_export.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full p-3 bg-surface-variant text-on-surface-variant rounded-xl text-sm font-medium text-center hover:bg-surface-container-high transition-colors"
              >
                Export Posts (CSV)
              </button>
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8,"
                    + "Title,Category,Type,Status,Created\n"
                    + guides.map(g => `"${g.title}",${g.category},${g.read_time},${g.status || 'published'},${g.created_at}`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "guides_export.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="w-full p-3 bg-surface-variant text-on-surface-variant rounded-xl text-sm font-medium text-center hover:bg-surface-container-high transition-colors"
              >
                Export Guides (CSV)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => adminApi.getAllPosts({ status: 'pending' }).then(setPosts)}
              className="px-3 py-1.5 text-xs font-medium bg-warning-container text-warning rounded-full"
            >
              Pending ({stats?.pendingPosts})
            </button>
            <button
              onClick={() => adminApi.getAllPosts({ status: 'approved' }).then(setPosts)}
              className="px-3 py-1.5 text-xs font-medium bg-success-container text-success rounded-full"
            >
              Approved
            </button>
            <button
              onClick={() => adminApi.getAllPosts().then(setPosts)}
              className="px-3 py-1.5 text-xs font-medium bg-surface-variant text-on-surface-variant rounded-full"
            >
              All
            </button>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No posts</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        post.status === 'pending' ? 'bg-warning-container text-warning' :
                        post.status === 'approved' ? 'bg-success-container text-success' :
                        'bg-error-container text-error'
                      }`}>
                        {post.status}
                      </span>
                      {post.pinned ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary-light text-primary">
                          Pinned
                        </span>
                      ) : null}
                      <span className="text-[10px] text-on-surface-variant">{post.category}</span>
                    </div>
                    <h4 className="font-medium text-sm">{post.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">by {post.author_name}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {post.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdatePostStatus(post.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-success-container text-success rounded-lg text-xs font-medium"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdatePostStatus(post.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-error-container text-error rounded-lg text-xs font-medium"
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handlePinPost(post.id, !post.pinned)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium"
                  >
                    <Pin size={14} /> {post.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-error-container text-error rounded-lg text-xs font-medium ml-auto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                  <p className="text-xs text-on-surface-variant">Joined: {user.member_since}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    user.role === 'admin' ? 'bg-primary-light text-primary' : 'bg-surface-variant text-on-surface-variant'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    user.status === 'active' ? 'bg-success-container text-success' :
                    user.status === 'disabled' ? 'bg-warning-container text-warning' :
                    'bg-error-container text-error'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleUpdateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                  className="text-xs text-primary font-medium"
                >
                  {user.role === 'admin' ? 'Demote' : 'Promote'}
                </button>
                <button
                  onClick={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'disabled' : 'active')}
                  className="text-xs text-warning font-medium"
                >
                  {user.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No reports</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    report.status === 'pending' ? 'bg-warning-container text-warning' :
                    report.status === 'reviewed' ? 'bg-primary-light text-primary' :
                    'bg-success-container text-success'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-xs text-on-surface-variant">{report.created_at}</span>
                </div>
                {report.post_title && (
                  <p className="text-sm font-medium mb-1">Post: {report.post_title}</p>
                )}
                <p className="text-sm text-on-surface-variant mb-2">{report.reason}</p>
                <p className="text-xs text-on-surface-variant">Reported by: {report.reporter_name}</p>
                {report.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-xs font-medium"
                    >
                      <Check size={14} /> Review
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium"
                    >
                      <X size={14} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-3">
          {feedback.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No feedback</p>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      item.category === 'bug' ? 'bg-error-container text-error' :
                      item.category === 'feature' ? 'bg-primary-light text-primary' :
                      'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      item.status === 'new' ? 'bg-warning-container text-warning' :
                      item.status === 'reviewed' ? 'bg-primary-light text-primary' :
                      'bg-success-container text-success'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{item.created_at}</span>
                </div>
                <p className="text-sm font-medium mb-1">{item.subject}</p>
                <p className="text-sm text-on-surface-variant mb-2">{item.message}</p>
                <p className="text-xs text-on-surface-variant">From: {item.user_name}</p>
                <div className="flex gap-2 mt-3">
                  {item.status === 'new' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(item.id, 'reviewed')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-light text-primary rounded-lg text-xs font-medium"
                    >
                      <Check size={14} /> Review
                    </button>
                  )}
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateFeedbackStatus(item.id, 'resolved')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-success-container text-success rounded-lg text-xs font-medium"
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Guides Management</h3>
            <button
              onClick={() => {
                alert('Guide creation form coming soon!');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Add Guide
            </button>
          </div>
          {guides.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No guides</p>
          ) : (
            guides.map((guide) => (
              <div key={guide.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary-light text-primary">
                      {guide.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      guide.status === 'published' ? 'bg-success-container text-success' :
                      guide.status === 'draft' ? 'bg-warning-container text-warning' :
                      'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {guide.status || 'published'}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{guide.created_at}</span>
                </div>
                <h4 className="font-medium text-sm mb-1">{guide.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2">{guide.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                  <span>{guide.read_time}</span>
                  <span>Fee: {guide.fee}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => alert('Edit guide feature coming soon!')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this guide?')) {
                        adminApi.deleteGuide(guide.id)
                          .then(() => adminApi.getGuides().then(setGuides));
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-error-container text-error rounded-lg text-xs font-medium"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Events Management</h3>
            <button
              onClick={() => {
                alert('Event creation form coming soon!');
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Add Event
            </button>
          </div>
          {events.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No events</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary-light text-primary">
                      {event.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      event.type === 'online' ? 'bg-blue-50 text-blue-600' :
                      event.type === 'offline' ? 'bg-green-50 text-green-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {event.type}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      event.status === 'upcoming' ? 'bg-success-container text-success' :
                      event.status === 'ongoing' ? 'bg-warning-container text-warning' :
                      'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{event.created_at}</span>
                </div>
                <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{event.description}</p>

                {/* Registration Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">Registrations</span>
                    <span className="font-medium">
                      {event.current_participants || 0}
                      {event.max_participants > 0 && ` / ${event.max_participants}`}
                    </span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${event.max_participants > 0
                          ? Math.min((event.current_participants / event.max_participants) * 100, 100)
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                  <span>📍 {event.location || 'Online'}</span>
                  <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // View registrations
                      adminApi.getEventRegistrations(event.id).then((regs) => {
                        alert(`Registrations: ${regs.length}\n\n${regs.map((r: any) => `${r.name} (${r.email})`).join('\n')}`);
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium"
                  >
                    <Users size={14} /> View Registrations
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this event?')) {
                        adminApi.deleteEvent(event.id)
                          .then(() => adminApi.getEvents().then(setEvents));
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-error-container text-error rounded-lg text-xs font-medium"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Announcements</h3>
            <button
              onClick={() => {
                const title = prompt('Announcement title:');
                const content = prompt('Announcement content:');
                if (title && content) {
                  adminApi.createAnnouncement({ title, content, type: 'info' })
                    .then(() => adminApi.getAnnouncements().then(setAnnouncements));
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
            >
              <Plus size={14} /> Add Announcement
            </button>
          </div>
          {announcements.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No announcements</p>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      announcement.type === 'important' ? 'bg-error-container text-error' :
                      announcement.type === 'warning' ? 'bg-warning-container text-warning' :
                      'bg-primary-light text-primary'
                    }`}>
                      {announcement.type}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      announcement.active ? 'bg-success-container text-success' : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {announcement.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{announcement.created_at}</span>
                </div>
                <p className="text-sm font-medium mb-1">{announcement.title}</p>
                <p className="text-sm text-on-surface-variant mb-2">{announcement.content}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      adminApi.updateAnnouncement(announcement.id, { ...announcement, active: !announcement.active })
                        .then(() => adminApi.getAnnouncements().then(setAnnouncements));
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-variant text-on-surface-variant rounded-lg text-xs font-medium"
                  >
                    {announcement.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this announcement?')) {
                        adminApi.deleteAnnouncement(announcement.id)
                          .then(() => adminApi.getAnnouncements().then(setAnnouncements));
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-error-container text-error rounded-lg text-xs font-medium"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-center text-on-surface-variant py-8">No logs</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-on-surface-variant">by {log.admin_name}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant">{log.created_at}</span>
                </div>
                {log.details && (
                  <p className="text-xs text-on-surface-variant mt-1">{log.details}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`card p-4 ${color}`}>
      <Icon size={20} className="mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}
