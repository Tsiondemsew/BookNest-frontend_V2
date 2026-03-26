'use client';

import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('buy')}</button>
    </div>
  );
}
