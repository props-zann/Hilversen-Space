import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  Image as ImageIcon
} from 'lucide-react';

import { Language } from '../utils/i18n';
import { resolveProductImageUrl, handleImageError } from '../utils/resolveImage';

export interface CreatorPost {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  image?: string;
  tag: string;
  createdAt: string;
  likes: number;
  comments: { id: string; author: string; text: string; time: string; authorEmail?: string }[];
}

const INITIAL_CREATOR_POSTS: CreatorPost[] = [
  {
    id: 'DUMP-101',
    authorName: 'Zann | Creator',
    authorEmail: 'marcauzed@gmail.com',
    authorAvatar: 'Z',
    content: 'Prototipe keychain F1 edisi sirkuit Monaco 2026 akhirnya lolos uji CNC laser precision! Finishing serat karbon 3K asli terasa sangat solid dan ringan di genggaman. Rilisan batch pertama terbatas 50 unit aja. Stay tuned! 🏎️⚡',
    image: '/src/assets/images/f1_keychain_hero_1791067169824.jpg',
    tag: '#BehindTheScenes',
    createdAt: '2 jam yang lalu',
    likes: 42,
    comments: [
      { id: 'c1', author: 'Raden Arya', text: 'Auto buy edisi Monaco ini min! Ditunggu tgl lounchingnya!', time: '1 jam yang lalu' },
      { id: 'c2', author: 'Dimas Pratama', text: 'Bisa custom grafir nama di titanium ring nya nggak?', time: '45 menit yang lalu' }
    ]
  },
  {
    id: 'DUMP-102',
    authorName: 'Zann | Creator',
    authorEmail: 'fauzayyn@gmail.com',
    authorAvatar: 'Z',
    content: 'Lagi nyoba eksplorasi sampel bahan titanium anodized warna biru elektrik untuk edisi spesial Pitstop Series. Gradasi warnanya pas kena cahaya matahari juara banget sih 🔥 Menurut kalian bagusan matte atau glossy finish?',
    image: '/src/assets/images/f1_keychain_track_1791067194914.jpg',
    tag: '#MerchDrop',
    createdAt: 'Kemarin, 19:40 WIB',
    likes: 68,
    comments: [
      { id: 'c3', author: 'Sarah N.', text: 'Vote matte finish! Kelihatan lebih stealth dan premium banget.', time: 'Kemarin, 20:15 WIB' }
    ]
  },
  {
    id: 'DUMP-103',
    authorName: 'Zann | Creator',
    authorEmail: 'marcauzed@gmail.com',
    authorAvatar: 'Z',
    content: 'Update fitur website: Tab Personal sekarang udah ada linimasa Creator Dump, Jadwal Sholat, dan Donate Me! Biar teman-teman kolektor bisa terus ikuti perkembangan studio sekaligus dukung karya lokal ini. Thank you so much for the endless support guys! ☕✨',
    tag: '#F1Dev',
    createdAt: '2 hari yang lalu',
    likes: 95,
    comments: []
  }
];

interface CreatorDumpPageProps {
  currentUser: any;
  onOpenLogin: () => void;
  lang?: Language;
}

export const CreatorDumpPage: React.FC<CreatorDumpPageProps> = ({
  currentUser
}) => {
  const isOwner = currentUser?.role === 'owner';

  const [posts, setPosts] = useState<CreatorPost[]>(() => {
    const saved = localStorage.getItem('hilversen_creator_dump_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CREATOR_POSTS;
  });

  // Track comment IDs created by the current local user session
  const [myCommentIds, setMyCommentIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('hilversen_my_comment_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('hilversen_creator_dump_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('hilversen_my_comment_ids', JSON.stringify(myCommentIds));
  }, [myCommentIds]);

  // Form State for Authorized Creator
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState('');
  const [selectedTag, setSelectedTag] = useState('#BehindTheScenes');
  const [activeFilterTag, setActiveFilterTag] = useState('ALL');
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tagsList = ['#BehindTheScenes', '#MerchDrop', '#F1Dev', '#StudioLife', '#CollectorNotes'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    if (!isOwner) {
      showToast('Hanya Owner/Creator terverifikasi yang dapat membuat postingan!');
      return;
    }

    const newPost: CreatorPost = {
      id: `DUMP-${Date.now()}`,
      authorName: currentUser?.name || 'Creator Hilversen',
      authorEmail: currentUser?.email || 'marcauzed@gmail.com',
      authorAvatar: (currentUser?.name?.[0] || 'H').toUpperCase(),
      content: newContent.trim(),
      image: newImage.trim() || undefined,
      tag: selectedTag,
      createdAt: 'Baru saja',
      likes: 0,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewContent('');
    setNewImage('');
    showToast('Postingan baru berhasil dipublikasikan!');
  };

  const handleDeletePost = (id: string) => {
    if (!isOwner) return;
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('Postingan berhasil dihapus.');
  };

  const handleToggleLike = (id: string) => {
    setLikedPostIds(prev => {
      const currentlyLiked = prev[id];
      const updated = !currentlyLiked;
      
      setPosts(currentPosts => currentPosts.map(p => {
        if (p.id === id) {
          return { ...p, likes: updated ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      }));

      return { ...prev, [id]: updated };
    });
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const commenterName = currentUser?.name || 'Kolektor Hilversen';
    const commentId = `c-${Date.now()}`;

    const newComment = {
      id: commentId,
      author: commenterName,
      authorEmail: currentUser?.email,
      text,
      time: 'Baru saja'
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));

    setMyCommentIds(prev => ({ ...prev, [commentId]: true }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    showToast('Komentar berhasil ditambahkan!');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    }));

    showToast('Komentar berhasil dihapus.');
  };

  const filteredPosts = posts.filter(p => {
    if (activeFilterTag === 'ALL') return true;
    return p.tag === activeFilterTag;
  });

  return (
    <div className="w-full bg-[#FAF7F0] dark:bg-black min-h-screen py-10 sm:py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="border-b border-slate-200 dark:border-neutral-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Linimasa Official Creator</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-slate-900 dark:text-white font-normal tracking-tight">
              Creator Dump & Updates
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              dokumentasi dan update kabar terbaru cuitan dari creator
            </p>
          </div>
        </div>

        {/* Creator Post Form (Only Visible to Verified Owner) */}
        {isOwner && (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-blue-500/30 dark:border-blue-500/40 shadow-xl space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {currentUser?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{currentUser?.name || 'Creator Hilversen'}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{currentUser?.email} (Owner Mode Active)</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Authorized Creator
              </span>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Bagikan ide, proses pengerjaan produk F1, atau kabar terbaru ke publik..."
                rows={3}
                className="w-full p-4 bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-none"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tag Selector */}
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="py-2 px-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {tagsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* Optional Image URL */}
                  <div className="relative flex-1 sm:w-56">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="URL Foto (Opsional)..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newContent.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publikasikan Update</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Hashtags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveFilterTag('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
              activeFilterTag === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
            }`}
          >
            Semua Updates ({posts.length})
          </button>
          {tagsList.map(t => {
            const count = posts.filter(p => p.tag === t).length;
            return (
              <button
                key={t}
                onClick={() => setActiveFilterTag(t)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  activeFilterTag === t
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const isLiked = Boolean(likedPostIds[post.id]);
            const commentText = commentInputs[post.id] || '';

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-neutral-700 transition-all"
              >
                {/* Author Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                        <span>{post.authorName}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{post.createdAt}</span>
                        <span>·</span>
                        <span className="text-blue-600 dark:text-blue-400 font-sans font-bold">{post.tag}</span>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Postingan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content Text */}
                <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Optional Image Attachment */}
                {post.image && (
                  <div className="rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 dark:border-neutral-800 bg-slate-100 dark:bg-black">
                    <img
                      src={resolveProductImageUrl(post.image)}
                      alt="Attachment"
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Interaction Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLiked
                        ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10'
                        : 'hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
                    <span>{post.likes} Suka</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Komentar</span>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="pt-2 space-y-3">
                  {post.comments.length > 0 && (
                    <div className="space-y-2.5 pl-3 border-l-2 border-slate-200 dark:border-neutral-800">
                      {post.comments.map(c => {
                        // Can delete if user is Owner OR author of the comment OR created in current session
                        const canDelete = isOwner || myCommentIds[c.id] || (currentUser?.name && c.author === currentUser.name);

                        return (
                          <div key={c.id} className="text-xs space-y-0.5 group relative flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-200">{c.author}</span>
                                <span className="text-[10px] text-slate-400">{c.time}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                            </div>

                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(post.id, c.id)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer shrink-0"
                                title="Hapus Komentar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Tulis komentar publik..."
                      value={commentText}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentText.trim()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Kirim
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Belum ada postingan dengan tag ini.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
