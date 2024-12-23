'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { dictionary } from '@/translations'

function getLocaleFromPath(pathname: string) {
  const segments = pathname.split('/')
  const localeCandidate = segments[1]
  return localeCandidate === 'es' ? 'es' : 'en'
}

export function LanguageSelector({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedLang, setSelectedLang] = useState('en')
  const t = dictionary[locale as 'en' | 'es'] ?? dictionary.en


  useEffect(() => {
    if (pathname) {
      setSelectedLang(getLocaleFromPath(pathname))
    }
  }, [pathname])

  const handleChange = (newLocale: string) => {
    setSelectedLang(newLocale)

    document.cookie = `preferredLanguage=${newLocale}; path=/;`

    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')

    router.push(newPath)
  }

  return (
    <Select value={selectedLang} onValueChange={handleChange}>
      <SelectTrigger className="w-[7.5rem]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t.languages.english}</SelectItem>
        <SelectItem value="es">{t.languages.spanish}</SelectItem>
      </SelectContent>
    </Select>
  )
}