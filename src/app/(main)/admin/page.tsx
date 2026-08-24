'use client';

import { useState } from 'react';
import {
  Shield,
  Building2,
  Flag,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Lock,
  Search,
  BadgeCheck,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Institute, InstituteType, User, Listing } from '@/types';
import { INSTITUTE_TYPES, DIVISIONS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Avatar from '@/components/ui/Avatar';
import ConditionBadge from '@/components/listings/ConditionBadge';
import { formatPrice } from '@/lib/utils';

export default function AdminPage() {
  const { user, login } = useAuth();
  const {
    institutes,
    createInstitute,
    updateInstitute,
    approveInstitute,
    rejectInstitute,
    reports,
    resolveReport,
    listings,
    deleteListing,
    users,
    toggleBlockUser,
    toggleVerifyUser,
  } = useData();
  const { showToast } = useToast();
  const { language } = useLanguage();

  // Admin Auth Check
  const isAdmin = user?.role === 'admin' || user?.email === 'mahadi379377@gmail.com';

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string>();
  const [busy, setBusy] = useState(false);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'listings' | 'institutes' | 'users' | 'reports'>('analytics');

  // Search States
  const [userQuery, setUserQuery] = useState('');
  const [listingQuery, setListingQuery] = useState('');

  // Modals State
  const [instituteModalOpen, setInstituteModalOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [instName, setInstName] = useState('');
  const [instNameEn, setInstNameEn] = useState('');
  const [instType, setInstType] = useState<InstituteType>('polytechnic');
  const [instDivision, setInstDivision] = useState('dhaka');
  const [instDistrict, setInstDistrict] = useState('ঢাকা');
  const [instVerified, setInstVerified] = useState(true);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(undefined);
    setBusy(true);

    try {
      const ok = await login({ email: adminEmail.trim(), password: adminPassword });
      setBusy(false);
      if (ok) {
        showToast('অ্যাডমিন প্যানেলে স্বাগতম!');
      } else {
        setLoginError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে');
      }
    } catch (err: unknown) {
      setBusy(false);
      const msg = err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে';
      setLoginError(msg);
    }
  };

  // If Not Admin, show Login Screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 page-enter">
        <div className="bg-white rounded-2xl border border-border-warm p-8 shadow-[var(--shadow-card)] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary-50 text-primary flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">অ্যাডমিন প্রবেশাধিকার</h1>
            <p className="text-xs text-text-muted mt-1">অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার ইমেইল ও পাসওয়ার্ড দিন</p>
          </div>

          {loginError && (
            <div className="p-3 bg-error-light text-error rounded-xl text-xs font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <Input
              label="অ্যাডমিন ইমেইল"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="mahadi379377@gmail.com"
              required
            />
            <Input
              label="পাসওয়ার্ড"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" fullWidth isLoading={busy}>
              প্যানেলে প্রবেশ করুন
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered lists
  const pendingInstitutes = institutes.filter((i) => !i.verified);
  const openReports = reports.filter((r) => r.status === 'open');
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(userQuery.toLowerCase()) || u.email.toLowerCase().includes(userQuery.toLowerCase()));
  const filteredListings = listings.filter((l) => l.title.toLowerCase().includes(listingQuery.toLowerCase()));

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;
  const totalVolume = listings.reduce((sum, l) => sum + l.price, 0);

  const handleOpenAddInstitute = () => {
    setEditingInstitute(null);
    setInstName('');
    setInstNameEn('');
    setInstType('polytechnic');
    setInstDivision('dhaka');
    setInstDistrict('ঢাকা');
    setInstVerified(true);
    setInstituteModalOpen(true);
  };

  const handleOpenEditInstitute = (inst: Institute) => {
    setEditingInstitute(inst);
    setInstName(inst.name);
    setInstNameEn(inst.name_en);
    setInstType(inst.type);
    setInstDivision(inst.division);
    setInstDistrict(inst.district);
    setInstVerified(inst.verified);
    setInstituteModalOpen(true);
  };

  const handleSaveInstitute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim()) {
      showToast('ইনস্টিটিউটের নাম লিখুন', 'error');
      return;
    }

    if (editingInstitute) {
      updateInstitute({
        ...editingInstitute,
        name: instName.trim(),
        name_en: instNameEn.trim() || instName.trim(),
        type: instType,
        division: instDivision,
        district: instDistrict,
        verified: instVerified,
      });
      showToast('ইনস্টিটিউট আপডেট করা হয়েছে');
    } else {
      createInstitute({
        name: instName.trim(),
        name_en: instNameEn.trim() || instName.trim(),
        type: instType,
        division: instDivision,
        district: instDistrict,
        lat: 23.8103,
        lng: 90.4125,
        verified: instVerified,
      });
      showToast('নতুন ইনস্টিটিউট যুক্ত করা হয়েছে');
    }

    setInstituteModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border-warm shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Shield className="text-primary" />
            অ্যাডমিন মডারেশন প্যানেল
          </h1>
          <p className="text-xs text-text-muted mt-1">
            মডারেটর: <span className="font-semibold text-text-main">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={handleOpenAddInstitute}>
          <Plus size={16} /> নতুন ইনস্টিটিউট যোগ করুন
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-border-warm shadow-xs">
          <span className="text-xs text-text-muted block mb-1">মোট বই</span>
          <span className="text-2xl font-extrabold text-text-main">{listings.length}</span>
          <span className="text-[11px] text-text-muted block mt-0.5">({activeCount} চালু, {soldCount} বিক্রি)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-warm shadow-xs">
          <span className="text-xs text-text-muted block mb-1">মোট ব্যবহারকারী</span>
          <span className="text-2xl font-extrabold text-primary">{users.length}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-warm shadow-xs">
          <span className="text-xs text-text-muted block mb-1">মোট ইনস্টিটিউট</span>
          <span className="text-2xl font-extrabold text-accent">{institutes.length}</span>
          <span className="text-[11px] text-warning font-semibold block mt-0.5">{pendingInstitutes.length} টি পেন্ডিং</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-warm shadow-xs">
          <span className="text-xs text-text-muted block mb-1">মোট লেনদেন মূল্য</span>
          <span className="text-2xl font-extrabold text-success">{formatPrice(totalVolume)}</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex overflow-x-auto border-b border-border-warm">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BarChart2 size={16} /> এনালিটিক্স
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'listings' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <BookOpen size={16} /> বিজ্ঞাপন মডারেশন ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('institutes')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'institutes' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Building2 size={16} /> ইনস্টিটিউটসমূহ ({institutes.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Users size={16} /> ব্যবহারকারী ব্যবস্থাপনা ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
            activeTab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <Flag size={16} /> রিপোর্টসমূহ ({openReports.length})
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-border-warm shadow-xs">
              <h3 className="font-bold text-base text-text-main mb-4 flex items-center gap-2">
                <TrendingUp className="text-primary" size={18} />
                ক্যাটাগরি অনুযায়ী বিজ্ঞাপন ভাগ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>📚 একাডেমিক বই</span>
                  <span className="font-bold">{listings.filter((l) => l.category_slug === 'academic_book').length} টি</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>📖 গল্প ও সাহিত্য</span>
                  <span className="font-bold">{listings.filter((l) => l.category_slug === 'general_book').length} টি</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>📝 নোটস ও সাজেশন</span>
                  <span className="font-bold">{listings.filter((l) => l.category_slug === 'notes_suggestion').length} টি</span>
                </div>
              </div>
            </div>

            {/* Health status */}
            <div className="bg-white p-6 rounded-2xl border border-border-warm shadow-xs">
              <h3 className="font-bold text-base text-text-main mb-4 flex items-center gap-2">
                <CheckCircle className="text-success" size={18} />
                সিস্টেমের সার্বিক অবস্থা
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>সক্রিয় বিক্রেতা:</span>
                  <span className="font-bold">{users.length} জন</span>
                </div>
                <div className="flex justify-between">
                  <span>অনুমোদিত ইনস্টিটিউট:</span>
                  <span className="font-bold text-success">{institutes.filter((i) => i.verified).length} টি</span>
                </div>
                <div className="flex justify-between">
                  <span>পেন্ডিং অনুমোদন:</span>
                  <span className="font-bold text-warning">{pendingInstitutes.length} টি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LISTING MODERATION */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={listingQuery}
              onChange={(e) => setListingQuery(e.target.value)}
              placeholder="বিজ্ঞাপনের নাম দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-border-warm text-sm"
            />
          </div>

          <div className="divide-y divide-border-warm bg-white rounded-2xl border border-border-warm shadow-xs overflow-hidden">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-text-main truncate">{listing.title}</span>
                    <ConditionBadge condition={listing.condition} />
                    {listing.status === 'sold' && <Badge variant="error">বিক্রি</Badge>}
                  </div>
                  <p className="text-xs text-text-muted">
                    দাম: {formatPrice(listing.price)} · আইডি: {listing.id} · দেখা হয়েছে: {listing.view_count} বার
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    deleteListing(listing.id);
                    showToast('বিজ্ঞাপনটি মুছে ফেলা হয়েছে');
                  }}
                >
                  <Trash2 size={14} /> রিজেক্ট / ডিলিট
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INSTITUTES MANAGEMENT & EDITING */}
      {activeTab === 'institutes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-text-main">ইনস্টিটিউট তালিকা ({institutes.length})</h3>
            <Button size="sm" onClick={handleOpenAddInstitute}>
              <Plus size={14} /> ইনস্টিটিউট যোগ করুন
            </Button>
          </div>

          <div className="divide-y divide-border-warm bg-white rounded-2xl border border-border-warm shadow-xs overflow-hidden">
            {institutes.map((inst) => (
              <div key={inst.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-text-main">{inst.name}</h4>
                    {inst.verified ? <Badge variant="success">অনুমোদিত</Badge> : <Badge variant="warning">পেন্ডিং</Badge>}
                  </div>
                  <p className="text-xs text-text-muted">
                    {inst.name_en} · বিভাগ: {inst.division} · জেলা: {inst.district} · টাইপ: {inst.type}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!inst.verified && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        approveInstitute(inst.id);
                        showToast('ইনস্টিটিউট অনুমোদন করা হয়েছে');
                      }}
                    >
                      অনুমোদন
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleOpenEditInstitute(inst)}>
                    <Edit3 size={14} /> এডিট
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      rejectInstitute(inst.id);
                      showToast('ইনস্টিটিউট মুছে ফেলা হয়েছে');
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT & BLOCKING */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="ব্যবহারকারীর নাম বা ইমেইল দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-border-warm text-sm"
            />
          </div>

          <div className="divide-y divide-border-warm bg-white rounded-2xl border border-border-warm shadow-xs overflow-hidden">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} src={u.avatar_url} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-main">{u.name}</span>
                      {u.is_verified && <BadgeCheck size={16} className="text-primary" />}
                      {u.is_blocked && <Badge variant="error">ব্লকড</Badge>}
                    </div>
                    <p className="text-xs text-text-muted">{u.email} {u.phone ? `· ${u.phone}` : ''}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toggleVerifyUser(u.id);
                      showToast(u.is_verified ? 'ভেরিফাইড ব্যাজ সরানো হয়েছে' : 'প্রোফাইল ভেরিফাইড করা হয়েছে');
                    }}
                  >
                    <BadgeCheck size={14} /> {u.is_verified ? 'আন-ভেরিফাই' : 'ভেরিফাই করুন'}
                  </Button>

                  <Button
                    size="sm"
                    variant={u.is_blocked ? 'primary' : 'danger'}
                    onClick={() => {
                      toggleBlockUser(u.id);
                      showToast(u.is_blocked ? 'ব্যবহারকারী আনব্লক করা হয়েছে' : 'ব্যবহারকারী ব্লক করা হয়েছে');
                    }}
                  >
                    {u.is_blocked ? 'আনব্লক' : 'ব্লক করুন'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {openReports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-border-warm text-center text-text-muted text-sm shadow-xs">
              কোন নতুন রিপোর্ট নেই।
            </div>
          ) : (
            openReports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-5 rounded-2xl border border-border-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-text-main">
                      কারণ: {report.reason === 'already_sold' ? 'বিক্রি হয়ে গেছে' : report.reason}
                    </span>
                    <Badge variant="error">ওপেন</Badge>
                  </div>
                  <p className="text-xs text-text-muted">
                    টাইপ: {report.target_type} · আইডি: {report.target_id}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    resolveReport(report.id, 'reviewed');
                    showToast('রিপোর্ট নিষ্পন্ন করা হয়েছে');
                  }}
                >
                  নিষ্পন্ন করুন
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Institute Modal */}
      <Modal
        isOpen={instituteModalOpen}
        onClose={() => setInstituteModalOpen(false)}
        title={editingInstitute ? 'ইনস্টিটিউট সম্পাদন করুন' : 'নতুন ইনস্টিটিউট যোগ করুন'}
        size="sm"
      >
        <form onSubmit={handleSaveInstitute} className="space-y-4">
          <Input
            label="ইনস্টিটিউটের নাম (বাংলা)"
            value={instName}
            onChange={(e) => setInstName(e.target.value)}
            placeholder="যেমন: ঢাকা পলিটেকনিক ইনস্টিটিউট"
            required
          />

          <Input
            label="English Name"
            value={instNameEn}
            onChange={(e) => setInstNameEn(e.target.value)}
            placeholder="e.g. Dhaka Polytechnic Institute"
          />

          <Select
            label="ধরন"
            value={instType}
            onChange={(e) => setInstType(e.target.value as InstituteType)}
            options={INSTITUTE_TYPES.map((t) => ({
              value: t.value,
              label: language === 'bn' ? t.bn : t.en,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="বিভাগ"
              value={instDivision}
              onChange={(e) => {
                setInstDivision(e.target.value);
                setInstDistrict('');
              }}
              options={Object.entries(DIVISIONS).map(([key, d]) => ({
                value: key,
                label: d[language],
              }))}
            />

            <Select
              label="জেলা"
              value={instDistrict}
              onChange={(e) => setInstDistrict(e.target.value)}
              options={(DIVISIONS[instDivision]?.districts || []).map((d) => ({
                value: d.bn,
                label: d[language],
              }))}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="instVerified"
              checked={instVerified}
              onChange={(e) => setInstVerified(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-border-warm"
            />
            <label htmlFor="instVerified" className="text-sm font-medium text-text-main cursor-pointer">
              অনুমোদিত ইনস্টিটিউট (Verified)
            </label>
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <Button variant="outline" type="button" onClick={() => setInstituteModalOpen(false)}>
              বাতিল
            </Button>
            <Button variant="primary" type="submit">
              সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
