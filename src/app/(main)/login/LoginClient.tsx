'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginClient() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const ok = await login({ email: email.trim(), password });
      if (!ok) {
        setError(t('auth.login.error'));
        return;
      }
      showToast(t('auth.login.success'));
      router.push(next);
    } catch {
      setError(t('auth.login.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-enter max-w-md mx-auto px-4 py-10 md:py-16">
      <div className="text-center mb-8">
        <span className="text-4xl">📚</span>
        <h1 className="text-2xl font-bold text-text-main mt-3">{t('auth.login.title')}</h1>
        <p className="text-sm text-text-secondary mt-1.5">{t('auth.login.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[var(--radius-card)] border border-border-warm shadow-[var(--shadow-card)] p-6 space-y-4"
      >
        <Input
          type="email"
          label={t('auth.login.email')}
          placeholder={t('auth.login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          type="password"
          label={t('auth.login.password')}
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={error}
          required
        />

        <Button type="submit" fullWidth isLoading={busy}>
          {t('auth.login.submit')}
        </Button>

        <p className="text-center text-sm text-text-secondary pt-1">
          {t('auth.login.noAccount')}{' '}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="font-medium text-primary hover:text-primary-dark"
          >
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </form>
    </div>
  );
}
