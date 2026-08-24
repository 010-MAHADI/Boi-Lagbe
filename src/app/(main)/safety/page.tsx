import type { Metadata } from 'next';
import { ShieldCheck, MapPin, Sun, Eye, CreditCard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'নিরাপত্তা টিপস | বই লাগবে',
  description: 'ক্যাম্পাসে বই কেনাবেচার সময় নিরাপদ থাকার টিপস ও নির্দেশনা।',
};

export default function SafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 page-enter space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white rounded-3xl p-8 md:p-12 text-center shadow-lg">
        <ShieldCheck size={56} className="mx-auto mb-4 text-accent" />
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          ক্যাম্পাসে নিরাপদে বই কেনাবেচা করার নির্দেশিকা
        </h1>
        <p className="text-primary-100 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          'বই লাগবে' প্ল্যাটফর্মে শিক্ষার্থীদের নিরাপত্তা আমাদের প্রথম অগ্রাধিকার। আপনার কেনাবেচা অভিজ্ঞতাকে নিরাপদ করতে নিচের মূল বিষয়গুলো মেনে চলুন।
        </p>
      </div>

      {/* Grid of Safety Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 1 */}
        <div className="bg-white rounded-2xl border border-border-warm p-6 space-y-3 shadow-[var(--shadow-card)]">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main">১. জনবহুল ও পরিচিত স্থানে দেখা করুন</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            মেট-আপ বা বই হ্যান্ডওভার করার জন্য সর্বদাই আপনার পলিটেকনিক, কলেজ বা বিশ্ববিদ্যালয় ক্যাম্পাসের পরিচিত জনবহুল স্থান (যেমন: কেন্দ্রীয় ক্যাফেটেরিয়া, লাইব্রেরির সামনে বা প্রধান গেট) বেছে নিন।
          </p>
        </div>

        {/* Rule 2 */}
        <div className="bg-white rounded-2xl border border-border-warm p-6 space-y-3 shadow-[var(--shadow-card)]">
          <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent flex items-center justify-center">
            <Sun size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main">২. দিনের আলোয় লেনদেন সম্পন্ন করুন</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            সন্ধ্যা বা রাতের বেলা নির্জন স্থানে দেখা করা থেকে বিরত থাকুন। দিনের বেলায় সান্ধ্যকালীন ক্লাসের আগেই দেখা করে বই দেখে নেওয়া সবচেয়ে নিরাপদ।
          </p>
        </div>

        {/* Rule 3 */}
        <div className="bg-white rounded-2xl border border-border-warm p-6 space-y-3 shadow-[var(--shadow-card)]">
          <div className="w-12 h-12 rounded-xl bg-error-light text-error flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main">৩. অগ্রিম টাকা পাঠানো কঠোরভাবে নিষেধ</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            সরাসরি দেখা করার আগে বিকাশ, নগদ বা ব্যাংকে কোনো ধরনের অগ্রিম (Advance) টাকা বা ক্যাশ আউট চার্জ পাঠাবেন না। হাতে বই পাওয়ার পরই মুল্য পরিশোধ করুন।
          </p>
        </div>

        {/* Rule 4 */}
        <div className="bg-white rounded-2xl border border-border-warm p-6 space-y-3 shadow-[var(--shadow-card)]">
          <div className="w-12 h-12 rounded-xl bg-success-light text-success flex items-center justify-center">
            <Eye size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-main">৪. বইয়ের পাতা ও কন্ডিশন ভালো করে যাচাই করুন</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            বইটি হাতে পাওয়ার পর পৃষ্ঠা ছেঁড়া আছে কিনা, ভেতরের লেখা স্পষ্ট কিনা এবং এটি আপনার সিলেবাসের সঠিক এডিশন কিনা তা ভালোভাবে দেখে নিন।
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-warning-light border border-warning/30 rounded-2xl p-6 flex items-start gap-4 text-warning-dark">
        <AlertTriangle size={24} className="shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-base mb-1">কোনো সন্দেহজনক ব্যবহারকারী দেখলে রিপোর্ট করুন</h4>
          <p className="text-sm leading-relaxed">
            কেউ যদি অন্যায্য আচরণ করে, ভুল তথ্য দেয় অথবা ইতোমধ্যে বিক্রি হয়ে যাওয়া বই চালু রাখে — বিজ্ঞাপনের নিচে 'রিপোর্ট করুন' বাটনে ক্লিক করুন। ৩ জন ভিন্ন শিক্ষার্থী রিপোর্ট করলে বইটি নিজে থেকেই সরিয়ে নেওয়া হয়।
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/listings">
          <Button size="lg" variant="primary">
            নিরাপদে বই খোঁজা শুরু করুন
          </Button>
        </Link>
      </div>
    </div>
  );
}
