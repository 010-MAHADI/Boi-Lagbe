import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

export const metadata: Metadata = {
  title: 'বইয়ের বিবরণ | বই লাগবে',
  description: 'ক্যাম্পাসের ব্যবহৃত বইয়ের পূর্ণ বিবরণ ও বিক্রেতার সাথে যোগাযোগের ব্যবস্থা।',
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ProductDetailClient slug={slug} />
    </Suspense>
  );
}
