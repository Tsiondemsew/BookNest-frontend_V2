'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreatePost } from '@/features/community';
import { PageHeader, ui } from '@/features/community/ui';
import { useTranslation } from '@/hooks/useTranslation';
import type { Post } from '@repo/types';

export default function CommunityPostPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handlePostCreated = (_post: Post) => {
    router.push('/community');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader
        backHref="/community"
        backLabel={t('community.backToFeed')}
        title={t('community.createPostTitle')}
        description={t('community.createPostDesc')}
        action={
          <Link href="/community" className={ui.btnSecondary}>
            {t('community.cancel')}
          </Link>
        }
      />

      <CreatePost onPostCreated={handlePostCreated} />
    </div>
  );
}
