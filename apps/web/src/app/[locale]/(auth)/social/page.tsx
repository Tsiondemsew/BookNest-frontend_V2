'use client';

import { useState } from 'react';
import { useSocial } from '@/hooks/useSocial';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/Skeleton';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Button } from '@/components/Button';

export default function SocialPage() {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const {
    feed,
    userFriends,
    isLoadingFeed,
    errorFeed,
    createPost,
    likePost,
    createComment,
    followUser,
    unfollowUser,
  } = useSocial();

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsPosting(true);
    try {
      await createPost(postContent);
      setPostContent('');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="px-4 py-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-balance text-foreground">Community</h1>
        <p className="text-foreground/60 mt-2">Share and discover what others are reading</p>
      </header>

      {/* Compose Post Section */}
      <form onSubmit={handleSubmitPost} className="mb-8 p-4 rounded-lg border border-border bg-card">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Share your thoughts about a book..."
          className="w-full bg-background rounded border border-border p-3 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          rows={3}
          aria-label="Compose a post"
        />
        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            disabled={isPosting || !postContent.trim()}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>

      {/* Error State */}
      {errorFeed && <ErrorDisplay error={errorFeed} onRetry={() => {}} />}

      {/* Loading State */}
      {isLoadingFeed && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {/* Feed */}
      {!isLoadingFeed && feed.length > 0 && (
        <div className="space-y-4">
          {feed.map((post: any) => (
            <div
              key={post.id}
              className="p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-semibold">{post.author.displayName?.[0] || 'U'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{post.author.displayName}</p>
                    <p className="text-xs text-foreground/60">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {post.authorId !== user?.id && (
                  <Button
                    size="sm"
                    variant={post.isFollowing ? 'outline' : 'default'}
                    onClick={() =>
                      post.isFollowing
                        ? unfollowUser(post.authorId)
                        : followUser(post.authorId)
                    }
                  >
                    {post.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>

              {/* Post Content */}
              <p className="text-foreground text-sm mb-4">{post.content}</p>

              {/* Book Reference */}
              {post.book && (
                <div className="mb-4 p-3 rounded bg-muted flex gap-3">
                  <div className="w-12 h-16 rounded bg-secondary/20 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">{post.book.title}</p>
                    <p className="text-xs text-foreground/60">{post.book.author}</p>
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex gap-4 text-xs text-foreground/60 border-t border-border pt-3">
                <button
                  onClick={() => likePost(post.id)}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  aria-label={`Like post (${post.likes || 0} likes)`}
                >
                  ❤️ {post.likes || 0}
                </button>
                <button
                  onClick={() => {}}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  aria-label={`Comment on post (${post.comments?.length || 0} comments)`}
                >
                  💬 {post.comments?.length || 0}
                </button>
                <button
                  onClick={() => {}}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  aria-label="Share post"
                >
                  📤 Share
                </button>
              </div>

              {/* Comments */}
              {post.comments?.slice(0, 2).map((comment: any) => (
                <div key={comment.id} className="mt-3 pl-3 border-l-2 border-primary/30">
                  <p className="text-xs font-semibold text-foreground">{comment.author}</p>
                  <p className="text-xs text-foreground/70">{comment.content}</p>
                </div>
              ))}

              {/* Comment Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                  if (input?.value.trim()) {
                    createComment(post.id, input.value);
                    input.value = '';
                  }
                }}
                className="mt-3 flex gap-2"
              >
                <input
                  name="comment"
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-2 py-1 rounded bg-muted border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  aria-label="Add a comment"
                />
                <Button type="submit" size="sm">
                  Post
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingFeed && feed.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No posts yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}
