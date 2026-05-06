import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Send } from "lucide-react";
import AppShell from "../components/AppShell";
import {
  clearSession,
  createForumComment,
  createForumPost,
  fetchForumPosts,
  setStoredUser,
  toggleForumPostLike,
  fetchMe,
} from "../api/client";

function formatPostDate(isoOrSql) {
  if (!isoOrSql) return "";
  const d = new Date(isoOrSql.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return isoOrSql;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ForumPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentBusy, setCommentBusy] = useState({});

  const load = useCallback(async () => {
    setError("");
    const data = await fetchForumPosts();
    setPosts(data.posts ?? []);
    try {
      const me = await fetchMe();
      if (me?.user) setStoredUser(me.user);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setLoading(false);
        if (err?.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load forum");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, navigate]);

  async function handleNewPost(e) {
    e.preventDefault();
    const body = newPostBody.trim();
    if (!body || submittingPost) return;
    setSubmittingPost(true);
    setError("");
    try {
      const { post } = await createForumPost({ body });
      setNewPostBody("");
      setPosts((prev) => [post, ...prev]);
    } catch (err) {
      if (err?.status === 401) {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Could not publish post");
    } finally {
      setSubmittingPost(false);
    }
  }

  async function handleLike(postId) {
    setError("");
    try {
      const { liked, like_count: likeCount } = await toggleForumPostLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked_by_me: liked, like_count: likeCount }
            : p
        )
      );
    } catch (err) {
      if (err?.status === 401) {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Could not update like");
    }
  }

  async function handleComment(postId) {
    const body = (commentDrafts[postId] || "").trim();
    if (!body || commentBusy[postId]) return;
    setCommentBusy((b) => ({ ...b, [postId]: true }));
    setError("");
    try {
      const { comment, comment_count: commentCount } = await createForumComment(
        postId,
        { body }
      );
      setCommentDrafts((d) => ({ ...d, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), comment],
                comment_count: commentCount,
              }
            : p
        )
      );
    } catch (err) {
      if (err?.status === 401) {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Could not add comment");
    } finally {
      setCommentBusy((b) => ({ ...b, [postId]: false }));
    }
  }

  return (
    <AppShell
      title="Community forum"
      subtitle="Public board for logged-in players — share wins, tips, and chaos."
    >
      {error ? (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleNewPost}
        className="glass-panel mb-10 rounded-3xl p-6 shadow-soft-card"
      >
        <label className="block text-sm font-bold text-slate-600">
          New post
        </label>
        <textarea
          value={newPostBody}
          onChange={(e) => setNewPostBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="mt-3 w-full resize-y rounded-2xl border border-white/50 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none ring-blue-400/30 focus:ring-2"
          maxLength={10000}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={submittingPost || !newPostBody.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-hero-glow disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submittingPost ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-sm font-semibold text-slate-500">
          Loading forum…
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center text-slate-600">
          No posts yet. Be the first to say something ridiculous.
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="glass-panel rounded-3xl p-6 shadow-soft-card"
            >
              <div className="flex gap-4">
                <img
                  src={post.author?.avatar_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/80"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-black text-slate-900">
                      {post.author?.username ?? "Player"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatPostDate(post.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                    {post.body}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                        post.liked_by_me
                          ? "bg-rose-100 text-rose-700"
                          : "bg-white/70 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <Heart
                        className="h-4 w-4"
                        fill={post.liked_by_me ? "currentColor" : "none"}
                      />
                      {post.like_count ?? 0}
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                      <MessageCircle className="h-4 w-4" />
                      {post.comment_count ?? (post.comments?.length || 0)}{" "}
                      comments
                    </span>
                  </div>

                  {post.comments?.length ? (
                    <ul className="mt-5 space-y-3 border-t border-white/40 pt-4">
                      {post.comments.map((c) => (
                        <li
                          key={c.id}
                          className="flex gap-3 rounded-2xl bg-white/50 px-3 py-2"
                        >
                          <img
                            src={c.author?.avatar_url}
                            alt=""
                            className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="text-sm font-bold text-slate-800">
                                {c.author?.username}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatPostDate(c.created_at)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">
                              {c.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <input
                      type="text"
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(e) =>
                        setCommentDrafts((d) => ({
                          ...d,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment…"
                      className="min-w-0 flex-1 rounded-2xl border border-white/50 bg-white/80 px-4 py-2.5 text-sm outline-none ring-blue-400/30 focus:ring-2"
                      maxLength={2000}
                    />
                    <button
                      type="button"
                      onClick={() => handleComment(post.id)}
                      disabled={
                        commentBusy[post.id] ||
                        !(commentDrafts[post.id] || "").trim()
                      }
                      className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {commentBusy[post.id] ? "…" : "Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
