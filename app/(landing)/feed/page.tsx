"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import PostComposer from "@/components/feed/PostComposer";
import PostCard, { type FeedPost } from "@/components/feed/PostCard";
import FeedLeftPanel from "@/components/feed/FeedLeftPanel";
import FeedRightPanel from "@/components/feed/FeedRightPanel";
import { Loader2, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function FeedPage() {
  const user = useAppSelector(s => s.auth.user);
  const [posts, setPosts]             = useState<FeedPost[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor]   = useState<string | null>(null);
  const [hasNew, setHasNew]           = useState(false);
  const loaderRef    = useRef<HTMLDivElement>(null);
  const pollingRef   = useRef<NodeJS.Timeout | null>(null);
  const latestIdRef  = useRef<string | null>(null);

  const fetchFeed = useCallback(async (cursor?: string) => {
    const url = cursor ? `/api/feed?cursor=${cursor}` : "/api/feed";
    const res = await fetch(url);
    const data = await res.json() as { posts?: FeedPost[]; nextCursor?: string | null };
    return {
      posts: Array.isArray(data.posts) ? data.posts : [],
      nextCursor: data.nextCursor ?? null,
    };
  }, []);

  // Initial load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFeed()
      .then(({ posts: p, nextCursor: nc }) => {
        setPosts(p);
        setNextCursor(nc);
        if (p[0]) latestIdRef.current = p[0].id;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchFeed]);

  // Poll every 30s for new posts
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      try {
        const { posts: fresh } = await fetchFeed();
        if (fresh[0] && fresh[0].id !== latestIdRef.current) setHasNew(true);
      } catch { /* ignore */ }
    }, 30_000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchFeed]);

  const refreshFeed = async () => {
    setHasNew(false);
    setLoading(true);
    const { posts: p, nextCursor: nc } = await fetchFeed();
    setPosts(p);
    setNextCursor(nc);
    if (p[0]) latestIdRef.current = p[0].id;
    setLoading(false);
  };

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || !nextCursor || loadingMore) return;
      setLoadingMore(true);
      try {
        const { posts: more, nextCursor: nc } = await fetchFeed(nextCursor);
        setPosts(prev => [...prev, ...more]);
        setNextCursor(nc);
      } catch { /* ignore */ }
      finally { setLoadingMore(false); }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [fetchFeed, nextCursor, loadingMore]);

  const handlePostCreated = (post: FeedPost) => {
    setPosts(prev => [post, ...prev]);
    latestIdRef.current = post.id;
  };

  const handlePostUpdate = (updated: FeedPost) =>
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));

  return (
    <div className="min-h-screen bg-slate-100 pt-4 pb-12">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-5">

          {/* LEFT — profile panel */}
          <div className="hidden lg:block self-start sticky top-[100px] h-fit max-h-[calc(100vh-100px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <FeedLeftPanel />
          </div>

          {/* CENTER — feed */}
          <div className="space-y-4">
            {/* Only show composer for logged-in users */}
            {user && <PostComposer onPostCreated={handlePostCreated} />}

            {/* New posts banner */}
            {hasNew && (
              <button onClick={refreshFeed}
                className="w-full flex items-center justify-center gap-2 bg-[#0a1628] text-white text-sm font-bold py-3 rounded-2xl hover:bg-[#1a3a6b] transition-all">
                <RefreshCw className="w-4 h-4" /> New posts — click to refresh
              </button>
            )}

            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 text-[#d4a017] animate-spin" /></div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="font-black text-[#0a1628] text-lg mb-2">Nothing in the feed yet</h3>
                <p className="text-slate-400 text-sm">Be the first to share a tax insight with the community!</p>
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} onUpdate={handlePostUpdate} />
                ))}
                <div ref={loaderRef} className="h-8 flex items-center justify-center">
                  {loadingMore && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
                </div>
              </>
            )}
          </div>

          {/* RIGHT — sidebar */}
          <div className="hidden lg:block self-start sticky top-[100px] h-fit max-h-[calc(100vh-100px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <FeedRightPanel />
          </div>

        </div>
      </div>
    </div>
  );
}
