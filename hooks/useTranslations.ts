// app/hooks/useTranslations.ts
'use client'; // must be a client component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Translations {
  [key: string]: string;
}

const loadLocaleData = async (locale: string) => {
  const res = await fetch(`/locales/${locale}.json`);
  return res.json();
};

export function useTranslations() {
  const router = useRouter();
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    loadLocaleData(locale).then((data) => setMessages(data));
  }, [locale]);

  const [messages, setMessages] = useState<Translations>({});

  const t = (key: string) => messages[key] || key;

  return { t, locale, setLocale };
}