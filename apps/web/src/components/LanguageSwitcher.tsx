'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'አማርኛ' },
  ];

  const switchLanguage = (newLocale: string) => {
    // Replace the current locale in the pathname with the new one
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            locale === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
