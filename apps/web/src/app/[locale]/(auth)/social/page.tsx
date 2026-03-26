'use client';

/**
 * Social page - Community feed and interactions
 * Phase 2 placeholder - Full implementation in Phase 4
 */
export default function SocialPage() {
  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Community</h1>
        <p className="text-foreground/60 mt-2">
          Share and discover what others are reading
        </p>
      </header>

      {/* Compose post section */}
      <div className="mb-8 p-4 rounded-lg border border-border bg-muted">
        <textarea
          placeholder="Share your thoughts about a book..."
          className="w-full bg-background rounded border border-border p-3 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          rows={3}
          aria-label="Compose a post"
        />
        <div className="mt-2 flex justify-end">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-lg border border-border">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">User Name</p>
                <p className="text-xs text-foreground/60">2 hours ago</p>
              </div>
            </div>
            <p className="text-foreground text-sm mb-3">
              Just finished reading an amazing book! Highly recommend it to
              everyone interested in {['fiction', 'mystery', 'romance'][i - 1]}.
            </p>
            <div className="flex gap-4 text-xs text-foreground/60">
              <button className="hover:text-primary">Like</button>
              <button className="hover:text-primary">Comment</button>
              <button className="hover:text-primary">Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
