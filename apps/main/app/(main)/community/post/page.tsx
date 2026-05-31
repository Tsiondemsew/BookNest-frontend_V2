'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreatePost } from '@/features/community';
import { PageHeader, ui } from '@/features/community/ui';
import type { Post } from '@repo/types';

export default function CommunityPostPage() {
  const router = useRouter();

  const handlePostCreated = (_post: Post) => {
    router.push('/community');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        backHref="/community"
        backLabel="Back to feed"
        title="Create post"
        description="Share with the BookNest community"
        action={
          <Link href="/community" className={ui.btnSecondary}>
            Cancel
          </Link>
        }
      />

      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
