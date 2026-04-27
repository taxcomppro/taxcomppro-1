"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { Loader2 } from "lucide-react";
import { ThumbsUpIcon, Comment01Icon, Share01Icon, SentIcon } from "hugeicons-react";

interface Author {
  id: string; name: string; image: string | null;
  headline: string | null; role: string; tier: string;
}

interface Comment {
  id: string; content: string; createdAt: string;
  author: { id: string; name: string; image: string | null };
}

export interface FeedPost {
  id: string; content: string; images: string[];
  likeCount: number; commentCount: number; createdAt: string;
  author: Author;
  comments: Comment[];
  _count: { likes: number; comments: number };
  likes: { id: string }[];
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const tierBadge: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-700",
  MARKETPLACE: "bg-indigo-100 text-indigo-700",
  MARKETPLACE_PLUS: "bg-emerald-100 text-emerald-700",
};

export default function PostCard({ post, onUpdate }: { post: FeedPost; onUpdate: (updated: FeedPost) => void }) {
  const user = useAppSelector(s => s.auth.user);
  const [liked, setLiked]           = useState(post.likes.length > 0);
  const [likeCount, setLikeCount]   = useState(post._count.likes);
  const [liking, setLiking]         = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]     = useState<Comment[]>(post.comments);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(n => newLiked ? n + 1 : n - 1);
    try {
      await fetch(`/api/feed/${post.id}/like`, { method: "POST" });
    } catch {
      setLiked(!newLiked);
      setLikeCount(n => newLiked ? n - 1 : n + 1);
    } finally { setLiking(false); }
  };

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0 && commentCount > 0) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/feed/${post.id}/comment`);
        const data = await res.json() as Comment[];
        setComments(data);
      } catch { /* ignore */ }
      finally { setLoadingComments(false); }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/feed/${post.id}/comment`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const c = await res.json() as Comment;
        setComments(prev => [...prev, c]);
        setCommentCount(n => n + 1);
        setCommentText("");
      }
    } catch { /* ignore */ }
    finally { setPostingComment(false); }
  };

  const contentText = post.content;
  const isLong = contentText.length > 300;
  const displayText = isLong && !expanded ? contentText.slice(0, 300) + "…" : contentText;

  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 p-5 pb-3">
        <div className="w-11 h-11 rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden shrink-0">
          {post.author.image
            ? <img src={post.author.image} alt={post.author.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            : <span className="text-white font-bold">{post.author.name?.[0]?.toUpperCase()}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#0a1628] text-sm">{post.author.name}</span>
            {post.author.tier !== "FREE" && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tierBadge[post.author.tier] ?? ""}`}>
                {post.author.tier === "MARKETPLACE_PLUS" ? "Plus" : post.author.tier === "MARKETPLACE" ? "Market" : post.author.tier}
              </span>
            )}
          </div>
          {post.author.headline && (
            <div className="text-xs text-slate-400 truncate mt-0.5">{post.author.headline}</div>
          )}
          <div className="text-xs text-slate-400 mt-0.5">{timeAgo(post.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{displayText}</p>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs font-semibold text-[#0a1628] mt-1 hover:underline">
            {expanded ? "Show less" : "…see more"}
          </button>
        )}
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`px-5 pb-4 grid gap-1.5 ${
          post.images.length === 1 ? "grid-cols-1" :
          post.images.length === 2 ? "grid-cols-2" :
          post.images.length === 3 ? "grid-cols-3" :
          "grid-cols-2"
        }`}>
          {post.images.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className={`block rounded-xl overflow-hidden bg-slate-100 ${
                post.images.length === 4 && i === 0 ? "col-span-2" : ""
              }`}>
              <img
                src={url}
                alt={`Post image ${i + 1}`}
                className="w-full object-cover max-h-80 hover:opacity-95 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}

      {/* Like / Comment counts */}
      {(likeCount > 0 || commentCount > 0) && (
        <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
          {likeCount > 0 && <span className="flex items-center gap-1.5"><ThumbsUpIcon className="w-3.5 h-3.5" /> {likeCount}</span>}
          {commentCount > 0 && (
            <button onClick={handleToggleComments} className="hover:text-[#0a1628] transition-colors">
              {commentCount} comment{commentCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-slate-100 px-3 py-1.5 flex items-center gap-2">
        <button onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${liked ? "text-[#1a3a6b] bg-[#1a3a6b]/5" : "text-slate-500 hover:bg-slate-50 hover:text-[#0a1628]"}`}>
          {liking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUpIcon className={`w-4 h-4 ${liked ? "fill-[#1a3a6b] stroke-none" : ""}`} />}
          Like
        </button>
        <button onClick={handleToggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-[#0a1628] transition-all">
          <Comment01Icon className="w-4 h-4" /> Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-[#0a1628] transition-all">
          <Share01Icon className="w-4 h-4" /> Share
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
          {loadingComments ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden shrink-0">
                    {c.author.image
                      ? <img src={c.author.image} alt={c.author.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      : <span className="text-white text-[10px] font-bold">{c.author.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                    <div className="text-xs font-bold text-[#0a1628]">{c.author.name}</div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden shrink-0">
              {user?.image
                ? <img src={user.image} alt={user.name ?? ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                : <span className="text-white text-[10px] font-bold">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-2">
              <input
                type="text" placeholder="Add a comment…" value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddComment(); }}
                className="flex-1 font-[inherit] text-xs outline-none bg-transparent text-slate-700 placeholder-slate-400"
              />
                <button onClick={handleAddComment} disabled={!commentText.trim() || postingComment}
                  className="w-8 h-8 rounded-full bg-[#0a1628] flex items-center justify-center text-white hover:bg-[#1a3a6b] transition-colors disabled:opacity-30">
                  {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <SentIcon className="w-4 h-4 ml-0.5" />}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
