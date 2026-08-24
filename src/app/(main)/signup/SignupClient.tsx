'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { isValidBDPhone, isValidEmail } from '@/lib/utils';
import { Institute } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import InstituteAutosuggest from '@/components/listings/InstituteAutosuggest';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  phone?: string;
}

export default function SignupClient() {
  const { t } = useLanguage();
  const { signup } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found: FieldErrors = {};
    if (!name.trim()) found.name = t('auth.signup.error.nameMissing');
    if (!isValidEmail(email.trim())) found.email = t('auth.signup.error.emailInvalid');
    if (password.length < 6) found.password = t('auth.signup.error.passwordShort');
    if (password !== confirm) found.confirm = t('auth.signup.error.passwordMismatch');
    if (phone.trim() && !isValidBDPhone(phone)) found.phone = t('profile.edit.phoneInvalid');

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    const ok = await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
      institute_id: selectedInstitute?.id,
    });
    setBusy(false);
    if (ok) {
      showToast(t('auth.signup.success'));
      router.push(next);
    }
  };

  return (
    <div className="page-enter max-w-md mx-auto px-4 py-10 md:py-16">
      <div className="text-center mb-8">
        <span className="text-4xl">📚</span>
        <h1 className="text-2xl font-bold text-text-main mt-3">{t('auth.signup.title')}</h1>
        <p className="text-sm text-text-secondary mt-1.5">{t('auth.signup.subtitle')}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[var(--radius-card)] border border-border-warm shadow-[var(--shadow-card)] p-6 space-y-4"
      >
        <Input
          label={t('auth.signup.name')}
          placeholder={t('auth.signup.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          type="email"
          label={t('auth.signup.email')}
          placeholder={t('auth.signup.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          type="tel"
          inputMode="numeric"
          label={t('auth.signup.phone')}
          placeholder={t('auth.signup.phonePlaceholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />

        {/* Institute Selection */}
        <InstituteAutosuggest
          selected={selectedInstitute}
          onSelect={(inst) => setSelectedInstitute(inst)}
        />

        <Input
          type="password"
          label={t('auth.signup.password')}
          placeholder={t('auth.signup.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          type="password"
          label={t('auth.signup.confirmPassword')}
          placeholder={t('auth.signup.confirmPasswordPlaceholder')}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth isLoading={busy}>
          {t('auth.signup.submit')}
        </Button>

        <p className="text-center text-sm text-text-secondary pt-1">
          {t('auth.signup.hasAccount')}{' '}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-primary hover:text-primary-dark"
          >
            {t('auth.signup.loginHere')}
          </Link>
        </p>
      </form>
    </div>
  );
}
