export type Page = 'home' | 'guide' | 'forum' | 'chatbot' | 'profile' | 'admin' | 'events' | 'about' | 'help';

export interface Guide {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  image_url: string;
  read_time: string;
  fee: string;
  steps: GuideStep[];
  documents: GuideDocument[];
  faq: GuideFaq[];
}

export interface GuideStep {
  icon: string;
  title: string;
  desc: string;
}

export interface GuideDocument {
  title: string;
  desc: string;
  special?: boolean;
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface ForumPost {
  id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  reply_count: number;
  time: string;
  created_at?: string;
}

export interface ForumReply {
  id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  time: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  sort_order: number;
}

export interface SavedGuide {
  id: string;
  title: string;
  category: string;
  image_url: string;
  read_time: string;
  saved_at: string;
}
