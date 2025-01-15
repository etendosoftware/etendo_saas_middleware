'use client'

import { LanguageSelector } from '@/components/ui/language-selector'
import { UserNav } from '@/components/auth/user-nav'
import React from 'react'
import { dictionary } from '@/translations'

interface NavbarProps {
  user: any | null
  locale: 'en' | 'es' | string
}

export function Navbar({ user, locale }: NavbarProps) {
  const t = dictionary[locale as 'en' | 'es'] ?? dictionary.en

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t.dashboard.environmentManager}
        </h1>

        <div className="flex items-center gap-4">
          <LanguageSelector locale={locale} />
          {user && <UserNav user={user} />}
        </div>
      </div>
    </header>
  )
}